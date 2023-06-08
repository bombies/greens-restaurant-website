import { NextResponse } from "next/server";

export const respond = (options: {
    data?: any,
    message?: string,
    init?: ResponseInit
}) => {
    return NextResponse.json(options.data || {
        message: options.message
    }, options.init);
};