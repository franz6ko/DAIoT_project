import React from "react"
import type { NextPage } from 'next'
import Link from 'next/link'
import { useDispositivoList } from "./../api"
import { Item, ItemProps, LayoutH } from "./../Components"
import { Paper, Typography, Grid } from "@mui/material"

const Home: NextPage = () => {
  // const [handler, setHandler] = React.useState<NodeJS.Timer|null>(null);

  let { dispositivos, mutateDispositivos } = useDispositivoList();

  React.useEffect(()=>{
    setInterval(()=>{
      mutateDispositivos();
    },250);
  }, [])

  return (
    <LayoutH>
      {
        dispositivos?.map((element: ItemProps, index: number) => <Item key={index}
          dispositivoId={element.dispositivoId}
          nombre={element.nombre}
          value={element.value}
          updated={element.updated}
          id={element._id}
        />)
      }
    </LayoutH>
  )
}

export default Home
