import React from "react"
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useDispositivoById } from "./../../api"
import { Layout } from "./../../Components"
import { Paper, Typography, Button, Box } from "@mui/material"
import { MyChart } from "./../../Components/MyChart"

interface ItemProps {
    item: any;
}
export const Item = ({ item }: ItemProps) => {
    const { _id, __v, ...allValues } = item || {};
    const keys = Object.keys(allValues || {});
    return (

        <Paper elevation={3} style={{ marginTop: 20, marginBottom: 20, padding: 20 }}>

            {
                keys?.map((key) => {
                    const value = item[key];
                    return (
                        <div key={key} style={{ display: "flex" }}>
                            <Typography variant="h6" style={{ fontWeight: "bold" }}>{key}</Typography>
                            <Typography variant="h6">: {value}</Typography>
                        </div>
                    );
                })
            }

        </Paper>
    )
}

const DispositivoId: NextPage = () => {
    const router = useRouter();
    const { dispositivoId } = router.query;
    const { dispositivos, mutateDispositivo } = useDispositivoById(dispositivoId);

    React.useEffect(()=>{
    setInterval(()=>{
        mutateDispositivo();
    },250);
    }, [])

    const onBack = () => {
        router.back();
    }
    return (
        <Layout>
            {/* <Item
                item={dispositivos}
            /> */}
            <Button
                variant="outlined"
                onClick={onBack}
            >
                Volver
            </Button>
            <Box style={{ width: "70%", margin: "auto"}}>
                <MyChart nodoId={dispositivoId} dispositivos={dispositivos}></MyChart>
            </Box>
            {
                dispositivos?.map((dispositivo, index) => {
                    console.log(dispositivo)
                    return (
                        <Item key={index} item={dispositivo}></Item>
                    );
                })
            }
        </Layout>
    )
}

export default DispositivoId;
