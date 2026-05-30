import "reflect-metadata";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

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
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const openApi = new DocumentBuilder()
    .setTitle(process.env.PROJECT_NAME || "Mindware Affiliate System API")
    .setDescription("NestJS API with Prisma for the Mindware Affiliate Management System")
    .setVersion("1.0.0")
    .addBearerAuth()
    .addTag("auth", "Affiliate and administrator authentication endpoints")
    .addTag("public", "Publicly accessible service and informational endpoints")
    .addTag("affiliates", "Affiliate profile management endpoints")
    .addTag("services", "Service catalog management endpoints")
    .addTag("leads", "Lead collection and notification endpoints")
    .addTag("commissions", "Affiliate commission tracking endpoints")
    .addTag("wallet", "Affiliate wallet balances and summary")
    .addTag("withdrawals", "Payment withdrawal request processing")
    .addTag("partner-program", "Subscription program plan management")
    .addTag("webhooks", "Third-party system integration webhook endpoints")
    .addTag("admin-dashboard", "Admin analytical dashboard endpoints")
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
  await app.listen(Number(process.env.PORT || 3333), "0.0.0.0");
}

bootstrap();
