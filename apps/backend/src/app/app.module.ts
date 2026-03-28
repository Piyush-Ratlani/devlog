import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { EntriesService } from "./entries/entries.service";
import { EntriesController } from "./entries/entries.controller";
import { EntriesModule } from "./entries/entries.module";

@Module({ imports: [PrismaModule, AuthModule, EntriesModule] })
export class AppModule {}
