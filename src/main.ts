import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { graphqlUploadExpress } from 'graphql-upload';
import { join } from 'path';
import { AppModule } from './app.module';

const originList = process.env.ORIGIN_LIST.split(',');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(graphqlUploadExpress());
  app.useStaticAssets(join(__dirname, '..', 'static'));

  app.enableCors({
    origin: originList,
    credentials: true,
  });

  await app.listen(Number(process.env.SERVER_PORT));
}
bootstrap();
