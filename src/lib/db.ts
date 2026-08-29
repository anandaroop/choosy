import { PrismaClient } from "@prisma/client"

/// Cached on globalThis so hot-reloading in dev doesn't spawn a new
/// PrismaClient (and a new connection pool) on every edit.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db
}
