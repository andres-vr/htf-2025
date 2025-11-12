import type {PrismaConfig} from "prisma";
import "dotenv/config";

export default {
    migrations: {
        seed: "ts-node prisma/seed.ts"
    }
} satisfies PrismaConfig;