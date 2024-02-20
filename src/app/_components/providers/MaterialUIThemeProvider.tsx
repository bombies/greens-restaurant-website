import { ThemeProvider, createTheme } from "@mui/material";
import { FC, PropsWithChildren } from "react";

const theme = createTheme({
    palette: {
        primary: {
            main: "#00D615",
            contrastText: "#fff"
        },
        secondary: {
            main: "#007d0d"
        },
        error: {
            main: "#ff2c2c"
        },
        warning: {
            main: "#ffa700"
        },
        info: {
            main: "#0000FF"
        },
        success: {
            main: "#00FF00"
        }
    }
})

const MaterialUIThemeProvider: FC<PropsWithChildren> = ({ children }) => {
    return (
        <ThemeProvider theme={theme}>
            {children}
        </ThemeProvider>
    )
}

export default MaterialUIThemeProvider