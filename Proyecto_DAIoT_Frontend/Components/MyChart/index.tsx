import React from "react"
import Link from 'next/link'
import { Paper, Typography, Grid, Box } from "@mui/material"
import { CircularFluidMeter } from 'fluid-meter';
import { Line } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';
import cloneDeep from 'lodash/cloneDeep';

import {
Chart as ChartJS,
ChartData,
CategoryScale,
LinearScale,
PointElement,
LineElement,
Title,
Tooltip,
Legend,
} from 'chart.js';

ChartJS.register(
CategoryScale,
LinearScale,
PointElement,
LineElement,
Title,
Tooltip,
Legend
);

export interface MyChartProps {
    nodoId: any;
    dispositivos: any;
}
export const MyChart = ({ nodoId, dispositivos }: MyChartProps) => {
    const options = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          title: {
            display: true,
            text: 'Chart.js Line Chart',
          },
        },
        scales: {
        y: {
            min: 0,
            max: 100,
        }
        }
      };
    const labels = ['1', '2', '3'];

    const data = {
        labels,
        datasets: [
          {
            label: nodoId,
            data: [1,1,1],
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
        ],
    }
    const [chartData, setChartData] = React.useState(data);

    React.useEffect(()=>{
        const newData = cloneDeep(chartData)

        let data1 = dispositivos?.filter(a => a.nodoId == nodoId)

        newData.datasets[0].data = data1?.map(a => a.value*100);
        newData.datasets[0].label = nodoId;

        newData.labels = data1?.map(a => {
            let date = new Date(a.ts);
            // return date.toString();
            return date.toLocaleTimeString();
        })

        // console.log("hola" + dispositivos)
        setChartData(newData)
    },[dispositivos])

    return (
        <>
        <Line options={options} data={chartData}></Line>
        </>
    )
}
export default MyChart;