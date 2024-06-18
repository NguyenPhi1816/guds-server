import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('api/images')
export class CloudinaryController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('file'))
  async uploadImage(
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.cloudinaryService.uploadImages(
      files,
    );
  }
}
