import { PrismaClient } from "@prisma/client"

declare global {
    var prisma: PrismaClient
}

const prismaClient = globalThis.prisma || new PrismaClient()
if (!globalThis.prisma)
    globalThis.prisma = prismaClient

export default prismaClient