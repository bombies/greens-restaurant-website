const DIR_LOCATION = '../assets/fonts/'

export enum Font {
    MONTSERRAT = 'montserrat'
}

type FontFile = {
    font: Font,
    getFontStyle: (style: string) => string;
}

const getFont = (font: Font): FontFile => {
    switch (font) {
        case Font.MONTSERRAT: {
            return {
                font: font,
                getFontStyle: (style: string) => {
                    return "Montserrat-" + style + ".ttf";
                }
            }
        }
    }
}

export const getFontLocation = (font: Font): string => {
    return DIR_LOCATION + font.toString() + '/' + getFont(font).getFontStyle('Regular');
}

export const fetchFontData = async (font: Font) => {
    console.log(getFontLocation(font));
    try {
        const res = await fetch(new URL('file://' + getFontLocation(font)));
        return res.arrayBuffer();
    } catch (e) {
        console.error(e);
    }

}

export default Font;