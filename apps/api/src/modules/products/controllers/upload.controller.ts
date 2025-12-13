import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpStatus,
  HttpCode,
  Body,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { CloudinaryService } from '@/shared/cloudinary/cloudinary.service';
import { Public } from '@/modules/auth/decorators/public.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Upload')
@Public()
@Controller('upload')
@UsePipes(
  new ValidationPipe({
    transform: false,
    whitelist: false,
    forbidNonWhitelisted: false,
  }),
)
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  @ApiOperation({ summary: 'Uploader une image vers Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Image uploadée avec succès',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example:
            'https://res.cloudinary.com/example/image/upload/v1234567890/products/image.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Fichier invalide ou manquant',
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    console.log('Upload request received, file:', file ? 'present' : 'missing');

    if (!file) {
      console.error('No file provided in request');
      throw new BadRequestException('Aucun fichier fourni');
    }

    console.log('File details:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      hasBuffer: !!file.buffer,
    });

    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Le fichier doit être une image');
    }

    if (!file.buffer) {
      throw new BadRequestException(
        'Le fichier ne contient pas de données (buffer manquant)',
      );
    }

    try {
      const url = await this.cloudinaryService.uploadImage(file, 'products');
      console.log('Upload successful, URL:', url);
      return { url };
    } catch (error) {
      console.error('Erreur upload Cloudinary:', error);
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'upload de l'image",
      );
    }
  }

  @Post('image/base64')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Uploader une image en base64 vers Cloudinary' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          description: 'Image encodée en base64 (data:image/...;base64,...)',
        },
      },
      required: ['image'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Image uploadée avec succès',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example:
            'https://res.cloudinary.com/example/image/upload/v1234567890/products/image.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Image invalide ou manquante',
  })
  async uploadImageFromBase64(@Body() body: { image: string }) {
    if (!body.image) {
      throw new BadRequestException('Aucune image fournie');
    }

    try {
      const url = await this.cloudinaryService.uploadImageFromBase64(
        body.image,
        'products',
      );
      return { url };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'upload de l'image",
      );
    }
  }
}
