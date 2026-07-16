import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private client: S3Client | null = null;

  private getClient(): S3Client {
    if (this.client) return this.client;

    const endpoint = process.env.S3_ENDPOINT;
    const accessKeyId = process.env.S3_ACCESS_KEY;
    const secretAccessKey = process.env.S3_SECRET_KEY;
    const bucket = process.env.S3_BUCKET;

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
      throw new BadRequestException("Armazenamento (S3/R2) nao configurado.");
    }

    this.client = new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    });

    return this.client;
  }

  private extFromMime(mime: string): string {
    return MIME_EXTENSIONS[mime] || "bin";
  }

  async upload(buffer: Buffer, mime: string, keyPrefix = "comprovativos"): Promise<{ url: string; filename: string }> {
    const client = this.getClient();
    const bucket = process.env.S3_BUCKET as string;
    const key = `${keyPrefix}/${uuidv4()}.${this.extFromMime(mime)}`;

    try {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: mime,
        }),
      );
    } catch (error) {
      this.logger.error(`Falha ao carregar ficheiro para o armazenamento: ${(error as Error)?.message}`);
      throw new BadRequestException("Falha ao carregar o comprovativo.");
    }

    const publicBase = process.env.S3_PUBLIC_URL || "";
    return { url: `${publicBase}/${key}`, filename: key };
  }
}
