import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'products',
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file.buffer) {
        reject(new Error('Le fichier ne contient pas de buffer'));
        return;
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'image',
          transformation: [
            {
              width: 1200,
              height: 1200,
              crop: 'limit',
              quality: 'auto',
              fetch_format: 'auto',
            },
          ],
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            reject(new Error(`Erreur lors de l'upload: ${error.message}`));
          } else if (result) {
            resolve(result.secure_url);
          } else {
            reject(new Error('Aucun résultat retourné par Cloudinary'));
          }
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async uploadImageFromBase64(
    base64String: string,
    folder: string = 'products',
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64String,
        {
          folder: folder,
          resource_type: 'image',
          transformation: [
            {
              width: 1200,
              height: 1200,
              crop: 'limit',
              quality: 'auto',
              fetch_format: 'auto',
            },
          ],
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            reject(new Error(`Erreur lors de l'upload: ${error.message}`));
          } else if (result) {
            resolve(result.secure_url);
          } else {
            reject(new Error('Aucun résultat retourné par Cloudinary'));
          }
        },
      );
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error) => {
        if (error) {
          reject(new Error(`Erreur lors de la suppression: ${error.message}`));
        } else {
          resolve();
        }
      });
    });
  }

  extractPublicIdFromUrl(url: string): string | null {
    try {
      const parts = url.split('/');
      const filename = parts[parts.length - 1];
      const publicId = filename.split('.')[0];
      const folder = parts[parts.length - 2];
      return folder ? `${folder}/${publicId}` : publicId;
    } catch {
      return null;
    }
  }
}
