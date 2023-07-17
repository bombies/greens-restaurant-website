"use client";

import { Card, CardBody, CardProps } from "@nextui-org/card";
import React from "react";

type Props = Omit<CardProps, "children"> & React.PropsWithChildren

export default function GenericCard({ children, ...props }: Props) {
    return (
        <Card
            {...props}
            classNames={{
                base: "!default-container rounded-2xl",
                ...props.classNames
            }}
        >
            <CardBody>
                {children}
            </CardBody>
        </Card>
    );
}