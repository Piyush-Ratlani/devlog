import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { EntriesModule } from "./entries/entries.module";
import { SummaryModule } from "./summary/summary.module";

@Module({ imports: [PrismaModule, AuthModule, EntriesModule, SummaryModule] })
export class AppModule {}
