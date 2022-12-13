/* MQTT Mutual Authentication Example */

#include <stdio.h>
#include <stdint.h>
#include <stddef.h>
#include <string.h>
#include "esp_wifi.h"
#include "esp_system.h"
#include "nvs_flash.h"
#include "esp_event.h"
#include "esp_netif.h"
#include "protocol_examples_common.h"

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
#include "freertos/queue.h"

#include "lwip/sockets.h"
#include "lwip/dns.h"
#include "lwip/netdb.h"

#include "esp_log.h"
#include "mqtt_client.h"
#include <cJSON.h>

#include "driver/gpio.h"
#include "driver/adc.h"
#include "esp_adc_cal.h"

#define GPIO_OUT_0     2
#define GPIO_IN_0      0
#define GPIO_OUTPUT_PIN_SEL  ((1ULL<<GPIO_OUT_0))
#define GPIO_INPUT_PIN_SEL  ((1ULL<<GPIO_IN_0))

// Set your local broker URI
#define BROKER_URI "mqtts://192.168.68.113:8883"

static const char *TAG = "MQTTS_EXAMPLE";

extern const uint8_t client_cert_pem_start[] asm("_binary_client_crt_start");
extern const uint8_t client_cert_pem_end[] asm("_binary_client_crt_end");
extern const uint8_t client_key_pem_start[] asm("_binary_client_key_start");
extern const uint8_t client_key_pem_end[] asm("_binary_client_key_end");
extern const uint8_t server_cert_pem_start[] asm("_binary_broker_CA_crt_start");
extern const uint8_t server_cert_pem_end[] asm("_binary_broker_CA_crt_end");

static void log_error_if_nonzero(const char *message, int error_code)
{
    if (error_code != 0) {
        ESP_LOGE(TAG, "Last error %s: 0x%x", message, error_code);
    }
}

esp_mqtt_client_handle_t client;
TaskHandle_t sensor_task_handler = NULL;
static void sensor_task(void* arg)
{
    printf("Sensor task started\n");

    adc1_config_channel_atten(ADC1_CHANNEL_0, ADC_ATTEN_DB_11);
    adc1_config_channel_atten(ADC1_CHANNEL_3, ADC_ATTEN_DB_11);
    adc1_config_channel_atten(ADC1_CHANNEL_6, ADC_ATTEN_DB_11);
    adc1_config_width(ADC_WIDTH_BIT_DEFAULT);

    while(true) {
        // ADC1
        int adc1_value = adc1_get_raw(ADC1_CHANNEL_0);
        printf("ADC1 value: %d\n", adc1_value);

        cJSON *json1 = cJSON_CreateObject();
        cJSON_AddStringToObject(json1, "nombre", "Tanque superior");
        cJSON_AddStringToObject(json1, "dispositivoId", "T001");
        cJSON_AddNumberToObject(json1, "value", adc1_value/4096.0);

        char *string1 = NULL;
        string1 = cJSON_Print(json1);
        cJSON_Delete(json1);
        esp_mqtt_client_publish(client, "/data", string1, 0, 0, 0);

        // ADC2
        int adc2_value = adc1_get_raw(ADC1_CHANNEL_3);
        printf("ADC2 value: %d\n", adc2_value);

        cJSON *json2 = cJSON_CreateObject();
        cJSON_AddStringToObject(json2, "nombre", "Tanque medio");
        cJSON_AddStringToObject(json2, "dispositivoId", "T002");
        cJSON_AddNumberToObject(json2, "value", adc2_value/4096.0);

        char *string2 = NULL;
        string2 = cJSON_Print(json2);
        cJSON_Delete(json2);

        esp_mqtt_client_publish(client, "/data", string2, 0, 0, 0);

        // ADC3
        int adc3_value = adc1_get_raw(ADC1_CHANNEL_6);
        printf("ADC3 value: %d\n", adc3_value);

        cJSON *json3 = cJSON_CreateObject();
        cJSON_AddStringToObject(json3, "nombre", "Tanque inferior");
        cJSON_AddStringToObject(json3, "dispositivoId", "T003");
        cJSON_AddNumberToObject(json3, "value", adc3_value/4096.0);

        char *string3 = NULL;
        string3 = cJSON_Print(json3);
        cJSON_Delete(json3);

        esp_mqtt_client_publish(client, "/data", string3, 0, 0, 0);

        vTaskDelay(500 / portTICK_RATE_MS);
    }
}

static void mqtt_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data)
{
    ESP_LOGD(TAG, "Event dispatched from event loop base=%s, event_id=%d", base, event_id);
    esp_mqtt_event_handle_t event = event_data;
    esp_mqtt_client_handle_t client = event->client;
    int msg_id;
    switch ((esp_mqtt_event_id_t)event_id) {
    case MQTT_EVENT_CONNECTED:
        ESP_LOGI(TAG, "MQTT_EVENT_CONNECTED");
        xTaskCreate(sensor_task, "sensor_task", 2048, NULL, 10, &sensor_task_handler);
        break;
    case MQTT_EVENT_DISCONNECTED:
        ESP_LOGI(TAG, "MQTT_EVENT_DISCONNECTED");
        if (sensor_task_handler != NULL) {
            vTaskDelete(sensor_task_handler);
            sensor_task_handler = NULL;
        }
        break;
    case MQTT_EVENT_SUBSCRIBED:
        ESP_LOGI(TAG, "MQTT_EVENT_SUBSCRIBED, msg_id=%d", event->msg_id);
        break;
    case MQTT_EVENT_UNSUBSCRIBED:
        ESP_LOGI(TAG, "MQTT_EVENT_UNSUBSCRIBED, msg_id=%d", event->msg_id);
        break;
    case MQTT_EVENT_PUBLISHED:
        ESP_LOGI(TAG, "MQTT_EVENT_PUBLISHED, msg_id=%d", event->msg_id);
        break;
    case MQTT_EVENT_DATA:
        ESP_LOGI(TAG, "MQTT_EVENT_DATA");
        printf("TOPIC=%.*s\r\n", event->topic_len, event->topic);
        printf("DATA=%.*s\r\n", event->data_len, event->data);
        break;
    case MQTT_EVENT_ERROR:
        ESP_LOGI(TAG, "MQTT_EVENT_ERROR");
        if (event->error_handle->error_type == MQTT_ERROR_TYPE_TCP_TRANSPORT) {
            log_error_if_nonzero("reported from esp-tls", event->error_handle->esp_tls_last_esp_err);
            log_error_if_nonzero("reported from tls stack", event->error_handle->esp_tls_stack_err);
            log_error_if_nonzero("captured as transport's socket errno",  event->error_handle->esp_transport_sock_errno);
            ESP_LOGI(TAG, "Last errno string (%s)", strerror(event->error_handle->esp_transport_sock_errno));
        }
        break;
    default:
        ESP_LOGI(TAG, "Other event id:%d", event->event_id);
        break;
    }
}

static void mqtt_app_start(void)
{
    const esp_mqtt_client_config_t mqtt_cfg = {
        .uri = BROKER_URI,
        .client_cert_pem = (const char *)client_cert_pem_start,
        .client_key_pem = (const char *)client_key_pem_start,
        .cert_pem = (const char *)server_cert_pem_start,
    };

    ESP_LOGI(TAG, "[APP] Free memory: %d bytes", esp_get_free_heap_size());
    client = esp_mqtt_client_init(&mqtt_cfg);
    /* The last argument may be used to pass data to the event handler, in this example mqtt_event_handler */
    esp_mqtt_client_register_event(client, ESP_EVENT_ANY_ID, mqtt_event_handler, NULL);
    esp_mqtt_client_start(client);
}

void app_main(void)
{
    ESP_LOGI(TAG, "[APP] Startup..");
    ESP_LOGI(TAG, "[APP] Free memory: %d bytes", esp_get_free_heap_size());
    ESP_LOGI(TAG, "[APP] IDF version: %s", esp_get_idf_version());

    esp_log_level_set("*", ESP_LOG_INFO);
    esp_log_level_set("MQTT_CLIENT", ESP_LOG_VERBOSE);
    esp_log_level_set("TRANSPORT_BASE", ESP_LOG_VERBOSE);
    esp_log_level_set("TRANSPORT", ESP_LOG_VERBOSE);
    esp_log_level_set("OUTBOX", ESP_LOG_VERBOSE);

    ESP_ERROR_CHECK(nvs_flash_init());
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());

    ESP_ERROR_CHECK(example_connect());

    mqtt_app_start();
}
