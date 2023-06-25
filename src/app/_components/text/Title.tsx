import React from "react";

interface Props extends React.PropsWithChildren {}

export default function Title({ children }: Props) {
    return <h1 className='phone:text-3xl'>{children}</h1>
}