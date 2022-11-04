import { ImageResponse } from "@vercel/og";
import { NextApiRequest } from "next";
import { getParamFromSearch } from "../../../utils/api/ApiUtils";
import { fetchFontData, Font } from "../../../utils/Fonts";

export const config = {
    runtime: "experimental-edge",
};

const handler = async (req: NextApiRequest) => {
    const { searchParams } = new URL(req.url ?? '');
    
    const title = getParamFromSearch({
        searchParams: searchParams,
        paramName: 'title',
        defaultResult: 'Default Title'
    });

    const subTitle = getParamFromSearch({
        searchParams: searchParams,
        paramName: 'subtitle',
        defaultResult: 'Default Sub-Title'
    });


    return new ImageResponse(
        (
            <div tw='flex flex-col justify-center px-12 h-full w-full bg-neutral-800'>
                <div tw='flex'>
                    <h1 tw='flex flex-col text-2xl text-white text-bold'>
                        <span>{title}</span>
                        <span tw={'text-green-300'}>{subTitle}</span>
                    </h1>
                </div>
                <div tw ='flex bg-green-500 rounded-2xl w-3/4 p-6'>
                    <h1 tw='text-4xl text-white'>{`The current time is ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}:${new Date().getMilliseconds()}`}</h1>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 600,
        }
    )
}

export default handler;