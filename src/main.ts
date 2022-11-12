import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import axios from 'axios';
import { graphqlUploadExpress } from 'graphql-upload';
import { join } from 'path';
import { AppModule } from './app.module';

const originList = process.env.ORIGIN_LIST.split(',');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(graphqlUploadExpress());
  app.useStaticAssets(join(__dirname, '..', 'static'));

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://localhost:3000',
      'http://localhost:4000',
      'https://localhost:4000',
      'https://zero9.shop',
      'https://zero9.brian-hong.tech',
    ],
    credentials: true,
  });
  const payload = {
    attachments: [
      {
        color: '#36a64f',
        title: 'Server Start',
        text: `Zero9 Server is being started with latest build at ${new Date()}`,
      },
    ],
  };
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: payload,
    baseURL:
      'https://hooks.slack.com/services/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',
  };
  await axios.request(options);
  await app.listen(Number(process.env.SERVER_PORT));
}
bootstrap();
