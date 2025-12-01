import { MultipartFile } from '@fastify/multipart';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { logError } from '@/utils/logger.js';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv'
dotenv.config();
interface UploadedImageInfo {
  url: string;
  altText?: string;
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.resolve(__dirname, '..', '..', '..', '..', 'uploads');
const PRODUCT_IMAGE_DIR = path.join(UPLOAD_DIR, 'products');

async function uploadMultiple(files: MultipartFile[]): Promise<UploadedImageInfo[]> {
  try {
    await fs.mkdir(PRODUCT_IMAGE_DIR, { recursive: true });

    const appUrl = process.env.APP_URL
    const uploadedImages: UploadedImageInfo[] = [];

    for (const file of files) {
      const fileExtension = path.extname(file.filename);
      const uniqueFilename = `${randomUUID()}${fileExtension}`;
      const destinationPath = path.join(PRODUCT_IMAGE_DIR, uniqueFilename);

      try {
        const buffer = await file.toBuffer();
        if (buffer.length === 0) {
          throw new Error('Arquivo está vazio');
        }

        await fs.writeFile(destinationPath, buffer);

        const publicUrl = `${appUrl}/uploads/products/${uniqueFilename}`;
        uploadedImages.push({
          url: publicUrl,
          altText: file.filename,
        });
      } catch (fileError: any) {
        logError(fileError, { file: file.filename });

        for (const savedImage of uploadedImages) {
          try {
            const filename = path.basename(savedImage.url);
            const filePath = path.join(PRODUCT_IMAGE_DIR, filename);
            await fs.unlink(filePath);
          } catch (cleanupError: any) {
            logError(cleanupError, { context: 'cleanup', file: file.filename });
          }
        }

        throw new Error(`Não foi possível processar o arquivo: ${file.filename}. Erro: ${fileError.message}`);
      }
    }

    return uploadedImages;
  } catch (error: any) {
    logError(error, { service: 'ImageUploadService.uploadMultiple' });
    throw error;
  }
}

async function uploadMultipleFromBuffer(
  files: Array<{
    fieldname: string;
    filename: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
  }>
): Promise<UploadedImageInfo[]> {
  try {
    await fs.mkdir(PRODUCT_IMAGE_DIR, { recursive: true });

    const appUrl = process.env.APP_URL || 'http://127.0.0.1:3000';
    const uploadedImages: UploadedImageInfo[] = [];

    for (const file of files) {
      const fileExtension = path.extname(file.filename);
      const uniqueFilename = `${randomUUID()}${fileExtension}`;
      const destinationPath = path.join(PRODUCT_IMAGE_DIR, uniqueFilename);

      try {
        if (file.buffer.length === 0) {
          throw new Error('Arquivo está vazio');
        }

        await fs.writeFile(destinationPath, file.buffer);

        const publicUrl = `${appUrl}/uploads/products/${uniqueFilename}`;
        uploadedImages.push({
          url: publicUrl,
          altText: file.filename,
        });
      } catch (fileError: any) {
        logError(fileError, { file: file.filename });

        for (const savedImage of uploadedImages) {
          try {
            const filename = path.basename(savedImage.url);
            const filePath = path.join(PRODUCT_IMAGE_DIR, filename);
            await fs.unlink(filePath);
          } catch (cleanupError: any) {
            logError(cleanupError, { context: 'cleanup', file: file.filename });
          }
        }

        throw new Error(`Não foi possível processar o arquivo: ${file.filename}. Erro: ${fileError.message}`);
      }
    }

    return uploadedImages;
  } catch (error: any) {
    logError(error, { service: 'ImageUploadService.uploadMultipleFromBuffer' });
    throw error;
  }
}

export const ImageUploadService = {
  uploadMultiple,
  uploadMultipleFromBuffer,
};
