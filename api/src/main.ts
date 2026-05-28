import "reflect-metadata";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";
import { AppModule } from "./app.module";

function corsOrigins() {
  const raw = process.env.BACKEND_CORS_ORIGINS || "http://localhost:3000,http://127.0.0.1:3000";
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    return raw.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return raw.split(",").map((item) => item.trim()).filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prefix = (process.env.API_PREFIX || "/api").replace(/^\/|\/$/g, "");
  const prefixPath = `/${prefix}`;

  app.setGlobalPrefix(prefix);
  app.use(cookieParser());
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
          imgSrc: ["'self'", "data:", "https:"],
          fontSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https:"],
        },
      },
    }),
  );
  app.enableCors({ origin: corsOrigins(), credentials: true });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const openApi = new DocumentBuilder()
    .setTitle(process.env.PROJECT_NAME || "Mindgest Partners API")
    .setDescription("API NestJS com Prisma para o Mindgest Partners Program")
    .setVersion("1.0.0")
    .addBearerAuth()
    .addTag("auth")
    .addTag("public")
    .addTag("affiliates")
    .addTag("services")
    .addTag("leads")
    .addTag("commissions")
    .addTag("wallet")
    .addTag("withdrawals")
    .addTag("partner-program")
    .addTag("webhooks")
    .addTag("admin-dashboard")
    .build();
  const document = SwaggerModule.createDocument(app, openApi);
  const server = app.getHttpAdapter().getInstance();
  server.get(`${prefixPath}/openapi.json`, (_req: any, res: any) => res.json(document));
  app.use(
    `${prefixPath}/reference`,
    apiReference({
      url: `${prefixPath}/openapi.json`,
      theme: "purple",
      darkMode: true,
      pageTitle: "Mindgest Partners API Reference",
    }),
  );
  server.get(`${prefixPath}/docs`, (_req: any, res: any) => res.redirect(302, `${prefixPath}/reference`));
  SwaggerModule.setup(`${prefix}/swagger`, app, document, {
    swaggerOptions: { persistAuthorization: true, docExpansion: "none", filter: true },
  });

  server.get("/", (_req: any, res: any) => res.json({ message: "Bem-vindo a API de Parceiros Mindgest", docs: `${prefixPath}/reference` }));
  await app.listen(Number(process.env.PORT || 8000), "0.0.0.0");
}

bootstrap();
