import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { graphqlUploadExpress } from 'graphql-upload';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpException } from '@nestjs/common/exceptions';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(graphqlUploadExpress());
  app.useStaticAssets(join(__dirname, '..', 'static'));

  app.enableCors({
    origin: function (origin, callback) {
      if (
        !origin ||
        process.env.FRONTEND_URLS.split(',').indexOf(origin) !== -1
      ) {
        callback(null, true);
      } else {
        callback(new HttpException(`Not allowed by CORS`, 400));
      }
    },
  });
  await app.listen(3000);
}
bootstrap();
