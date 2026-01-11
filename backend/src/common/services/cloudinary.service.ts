import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

export interface UploadResult {
  url: string;
  publicId: string;
}

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('cloudinary.cloudName'),
      api_key: this.configService.get<string>('cloudinary.apiKey'),
      api_secret: this.configService.get<string>('cloudinary.apiSecret'),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    // Validar tipo de archivo
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Tipo de archivo no permitido. Solo se aceptan: JPEG, PNG, WebP, GIF',
      );
    }

    // Validar tamaño (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('El archivo es demasiado grande. Máximo 5MB');
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `catalogo/${folder}`,
            resource_type: 'image',
            transformation: [
              { quality: 'auto:good' },
              { fetch_format: 'auto' },
            ],
          },
          (error, result: UploadApiResponse | undefined) => {
            if (error) {
              console.error('Cloudinary error:', error);
              reject(new BadRequestException('Error al subir la imagen'));
              return;
            }
            if (!result) {
              reject(new BadRequestException('Error al subir la imagen'));
              return;
            }
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          },
        )
        .end(file.buffer);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    if (!publicId) return;

    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
    }
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string,
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }
}
