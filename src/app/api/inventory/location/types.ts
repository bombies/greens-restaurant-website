import { z } from "zod";

export type CreateLocationDto = {
    name: string
}

export const createLocationDtoSchema = z.object({
    name: z.string()
}).strict();