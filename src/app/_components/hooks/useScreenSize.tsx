"use client"

import { useEffect, useState } from "react";

type UseScreenSizeProps = {
    width: number,
    height: number
}

const useScreenSize = () => {
    const [screenSize, setScreenSize] = useState<UseScreenSizeProps>();

    useEffect(() => {
        const onResize = () => {
            setScreenSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener("resize", onResize);

        return () => window.removeEventListener("resize", onResize);
    }, []);

    return screenSize;
};

export default useScreenSize