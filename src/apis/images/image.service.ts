import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as Minio from 'minio';
import { getToday } from 'src/common/utils/utils';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Image } from './entities/image.entity';
import { FileUpload } from 'graphql-upload';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  async uploadOne({ data }: { data: FileUpload }) {
    // Setup Minio Client
    const minioClient = new Minio.Client({
      endPoint: process.env.OBJ_STORAGE_ENDPOINT,
      useSSL: true,
      accessKey: process.env.OBJ_STORAGE_ACCESS_KEY_ID,
      secretKey: process.env.OBJ_STORAGE_ACCESS_KEY_SECRET,
    });

    // Upload Image to Minio
    const result: string = await new Promise((res, rej) => {
      const origin_fname = data.filename;
      const fname = `${getToday()}/origin/${uuid()}-${origin_fname}`;
      minioClient.putObject(
        process.env.OBJ_STORAGE_BUCKET,
        fname,
        data.createReadStream(),
        (err, etag) => {
          if (err) {
            rej(err);
          }
          console.log('========= etag =========', etag);
          res(`${process.env.OBJ_STORAGE_URL_PREFIX}${fname}`);
        },
      );
    });

    const databaseInput: Partial<Image> = {
      imageUrl: result,
      fileName: data.filename,
    };
    const image: Image = await this.createImage({ image: databaseInput });
    return image;
  }

  async uploadMany({ data }: { data: FileUpload[] }) {
    const queue = await Promise.all(data);
    const minioClient = new Minio.Client({
      endPoint: process.env.OBJ_STORAGE_ENDPOINT,
      useSSL: true,
      accessKey: process.env.OBJ_STORAGE_ACCESS_KEY_ID,
      secretKey: process.env.OBJ_STORAGE_ACCESS_KEY_SECRET,
    });
    const result: string[] = await Promise.all(
      queue.map(async (image) => {
        return await new Promise((res, rej) => {
          const origin_fname = image.filename;
          const fname = `${getToday()}/origin/${uuid()}-${origin_fname}`;
          minioClient.putObject(
            process.env.OBJ_STORAGE_BUCKET,
            fname,
            image.createReadStream(),
            (err, etag) => {
              if (err) {
                rej(err);
              }
              console.log('========= etag =========', etag);
              res(`${process.env.OBJ_STORAGE_URL_PREFIX}${fname}`);
            },
          );
        });
      }),
    );
    const databaseInput: Partial<Image>[] = result.map((image, index) => {
      return {
        imageUrl: image,
        fileName: queue[index].filename,
      };
    });
    const images: Promise<Image>[] = databaseInput.map(
      async (image) => await this.createImage({ image }),
    );
    return images;
  }

  async createImage({ image }: { image: Partial<Image> }) {
    return await this.imageRepository.save(image);
  }
}
