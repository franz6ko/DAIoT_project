import React from "react"
import Link from 'next/link'
import { Paper, Typography, Grid, Box } from "@mui/material"
import { CircularFluidMeter } from 'fluid-meter';

export interface FluidMeterProps {
    id: any;
    value: number;
}
export const FluidMeter = ({ id, value }: FluidMeterProps) => {

    const [m, setM] = React.useState<CircularFluidMeter|null>(null);

    React.useEffect(()=>{
        console.log(value);
        const target = document.querySelector("#target_" + id) as HTMLElement;
        if(m){
            m.progressFormatter
            m.progress = value;
        }
        console.log(m)
    }, [value])

    React.useEffect(()=>{
        const target = document.querySelector("#target_" + id) as HTMLElement;
        if(target.hasChildNodes()) return;
        if(m !== null) return;
        let n = new CircularFluidMeter(target, {
            initialProgress: value,
            borderWidth: 22,
            backgroundColor: '#002d59',
            borderColor: '#3e4954',
            bubbleColor: '#6bcfff',
            fontFamily: 'Codystar',
            fontSize: 34,
            progressFormatter: (value) => {
              return `${value.toFixed(0)}%`;
            },
            fluidConfiguration: {
              color: '#1e90ff'
            }
        });
        setM(n);
    }, []);
    return (
        <>
        <Box id={'target_' + id} component="div" sx={{width: "300px", height: "300px", margin: "auto"}}></Box>
        </>
    )
}
export default FluidMeter;