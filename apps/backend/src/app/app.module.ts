import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { EntriesModule } from "./entries/entries.module";

@Module({ imports: [PrismaModule, AuthModule, EntriesModule] })
export class AppModule {}
