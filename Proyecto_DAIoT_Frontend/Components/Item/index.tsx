import React from "react"
import Link from 'next/link'
import { Paper, Typography, Grid, TextField } from "@mui/material"
import { CircularFluidMeter } from 'fluid-meter';
import { FluidMeter } from '../FluidMeter'


export interface ItemProps {
    dispositivoId?: any;
    nombre?: any;
    value?: any;
    updated?: any;
    id?: any;
    _id?: any;
}
export const Item = ({ dispositivoId, nombre, value, updated, id }: ItemProps) => {
    return (
        <Link href={`/dispositivos/${dispositivoId}`}>
            <Paper elevation={3} style={{ margin: 10, padding: 20, display: "inline-block" }}>
                <div style={{ display: "flex", marginBottom: 16 }}>
                    <FluidMeter id={id} value={value*100} ></FluidMeter>
                </div>
                <div style={{ display: "flex" }}>
                    <Typography variant="h5" style={{ fontWeight: "bold" }}>Nombre</Typography>
                    <Typography variant="h5">: {nombre}</Typography>
                </div>
                <div style={{ display: "flex" }}>
                    <Typography variant="h5" style={{ fontWeight: "bold" }}>ID</Typography>
                    <Typography variant="h5">: {dispositivoId}</Typography>
                </div>
                <div style={{ display: "flex" }}>
                    <Typography variant="h5" style={{ fontWeight: "bold" }}>Updated</Typography>
                    <Typography variant="h5">: {new Date(updated).toLocaleString()}</Typography>
                </div>
            </Paper>
        </Link>
    )
}
export default Item;