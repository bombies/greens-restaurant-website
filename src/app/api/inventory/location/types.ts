import { z } from "zod";

export type CreateLocationDto = {
    name: string
}

export const CreateLocationDtoSchema = z.object({
    name: z.string()
}).strict();