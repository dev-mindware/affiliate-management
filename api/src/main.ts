import "reflect-metadata";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

function normalizeOrigin(value: string): string | null {
  const trimmed = value.trim().replace(/^['"]+|['"]+$/g, "").trim();
  if (!trimmed) return null;
  try {
    // Reduz para a origem canonica (esquema://host:porta), descartando qualquer path ou barra final.
    return new URL(trimmed).origin.toLowerCase();
  } catch {
    return trimmed.replace(/\/+$/, "").toLowerCase();
  }
}

function corsOrigins(): string[] {
  const raw = process.env.BACKEND_CORS_ORIGINS || "http://localhost:3000,http://127.0.0.1:3000";
  let entries: string[] = [];
  try {
    const parsed = JSON.parse(raw);
    entries = Array.isArray(parsed) ? parsed.map((item) => String(item)) : [String(parsed)];
  } catch {
    entries = raw.replace(/^\[|\]$/g, "").split(",");
  }
  const normalized = entries
    .map(normalizeOrigin)
    .filter((item): item is string => Boolean(item));
  return Array.from(new Set(normalized));
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
  const allowedOrigins = corsOrigins();
  app.enableCors({
    origin(
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) {
      // Requisicoes sem header Origin (curl, health checks, mesma origem) sao permitidas.
      if (!origin || allowedOrigins.includes(origin.toLowerCase())) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  });
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
