import { Inter } from "next/font/google";
import React from "react";
import Providers from "./_components/Providers";
import ProgressBar from "./_components/ProgressBar";
import './globals.scss'

export const metadata = {
    title: "Green's Restaurant & Pub",
    description: 'The Management Platform',
}

const inter = Inter({
    subsets: ['latin']
})

interface Props extends React.PropsWithChildren {
    session: any
}

export default function HomeLayout(props: Props) {
    return (
        <html className={inter.className} style={{
            backgroundImage: 'url("/images/mesh-bg-2.png")'
        }}>
            <Providers session={props.session}>
                <ProgressBar />
                {props.children}
            </Providers>
        </html>
    )
}