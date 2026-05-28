import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { Prisma } from "@prisma/client";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger("AllExceptionsFilter");

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = "Ocorreu um erro interno no servidor";
    let error = "Internal Server Error";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resPayload = exception.getResponse();
      message = this.extractMessage(resPayload);
      error = exception.name;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Prisma known request errors handling
      switch (exception.code) {
        case "P2002": // Unique constraint violation
          status = HttpStatus.BAD_REQUEST;
          const target = (exception.meta?.target as string[]) || [];
          const duplicatedField = target.join(", ");
          message = duplicatedField
            ? `O valor para o campo (${duplicatedField}) já está em uso.`
            : "Um registro com este valor já existe.";
          error = "ConflictError";
          break;
        case "P2025": // Record not found
          status = HttpStatus.NOT_FOUND;
          message = "O registro solicitado não foi encontrado.";
          error = "NotFoundError";
          break;
        case "P2003": // Foreign key constraint violation
          status = HttpStatus.BAD_REQUEST;
          message = "Operação inválida devido a dependências ou relacionamentos entre registros.";
          error = "ForeignKeyConstraintError";
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          message = `Erro na operação de banco de dados (${exception.code})`;
          error = "DatabaseError";
          break;
      }
    } else if (exception instanceof Error) {
      // Log generic internal server errors for debugging
      this.logger.error(`Unexpected Exception: ${exception.message}`, exception.stack);
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      error: error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private extractMessage(payload: unknown): string {
    if (typeof payload === "string") return payload;
    if (payload && typeof payload === "object") {
      const message = (payload as Record<string, any>).message;
      if (Array.isArray(message)) return message.join(", ");
      if (message) return String(message);
    }
    return "Ocorreu um erro inesperado";
  }
}
