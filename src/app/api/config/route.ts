import { authenticatedAny } from "@/utils/api/ApiUtils";
import { ApiRoute, buildResponse } from "../utils/utils";
import Permission from "@/libs/types/permission";
import configService from "./service";

export const GET: ApiRoute = (req) =>
    authenticatedAny(req, async () => {
        return buildResponse({
            data: await configService.getConfig()
        })
    }, [Permission.ADMINISTRATOR])

export const PATCH: ApiRoute = (req) =>
    authenticatedAny(req, async () => {
        return buildResponse({
            data: await configService.updateConfig(await req.json())
        })
    }, [Permission.ADMINISTRATOR])