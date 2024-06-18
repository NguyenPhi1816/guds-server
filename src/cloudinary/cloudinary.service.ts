import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
  uploadFile(
    file: Express.Multer.File,
  ): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>(
      (resolve, reject) => {
        const uploadStream =
          cloudinary.uploader.upload_stream(
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            },
          );

        streamifier
          .createReadStream(file.buffer)
          .pipe(uploadStream);
      },
    );
  }

  async uploadImages(
    files: Express.Multer.File[],
  ) {
    const uploadPromises = files.map((file) =>
      this.uploadFile(file),
    );

    const result = await Promise.all(
      uploadPromises,
    );

    const paths = result.map(
      (item) => item.secure_url,
    );

    return { paths };
  }
}
