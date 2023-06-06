import {createTheme} from "@nextui-org/react";

const darkTheme = createTheme({
    type: 'dark',
    theme: {
        colors: {
            // background colors (dark)
            background: "rgb(14,14,14)",
            backgroundAlpha: "rgba(14,14,14,0.8)", // used for semi-transparent backgrounds like the navbar
            foreground: "$white",
            backgroundContrast: "$white",


            //semantic colors (light)
            green500: '#00D615',
            green600: '#007d0d',
            amber500: '#ffa700',
            red500: '#ff2c2c',

            // brand colors
            primaryLight: '$green500',
            primaryLightHover: '$green500', // commonly used on hover state
            primaryLightActive: '$green500', // commonly used on pressed state
            primaryLightContrast: '$green500', // commonly used for text inside the component
            primary: '$green500',
            primaryBorder: '$green500',
            primaryBorderHover: '$green500',
            primarySolidHover: '$green500',
            primarySolidContrast: '$white', // commonly used for text inside the component
            primaryShadow: '$green500',


            secondaryLight: '$green600',
            secondaryLightHover: '$green600', // commonly used on hover state
            secondaryLightActive: '$green600', // commonly used on pressed state
            secondaryLightContrast: '$green600', // commonly used for text inside the component
            secondary: '$green600',
            secondaryBorder: '$green600',
            secondaryBorderHover: '$green600',
            secondarySolidHover: '$green600',
            secondarySolidContrast: '$white', // commonly used for text inside the component
            secondaryShadow: '$green600',

            warningLight: '$amber500',
            warningLightHover: '$amber500', // commonly used on hover state
            warningLightActive: '$amber500', // commonly used on pressed state
            warningLightContrast: '$amber500', // commonly used for text inside the component
            warning: '$amber500',
            warningBorder: '$amber500',
            warningBorderHover: '$amber500',
            warningSolidHover: '$amber500',
            warningSolidContrast: '$white', // commonly used for text inside the component
            warningShadow: '$amber500',

            errorLight: '$red500',
            errorLightHover: '$red500', // commonly used on hover state
            errorLightActive: '$red500', // commonly used on pressed state
            errorLightContrast: '$red500', // commonly used for text inside the component
            error: '$red500',
            errorBorder: '$red500',
            errorBorderHover: '$red500',
            errorSolidHover: '$red500',
            errorSolidContrast: '$white', // commonly used for text inside the component
            errorShadow: '$red500'
        }
    }
})

export default darkTheme