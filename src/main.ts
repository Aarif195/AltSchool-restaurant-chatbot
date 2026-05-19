import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
const app = await NestFactory.create(AppModule, { rawBody: true });

  // const configService = app.get(ConfigService);
  // const origins = configService.get<string>('ALLOWED_ORIGINS') || '';
  // const originArray = origins.split(',');

  // app.enableCors({
  //   origin: (origin, callback) => {
  //     if (!origin || originArray.includes(origin)) {
  //       callback(null, true);
  //     } else {
  //       callback(new Error('Not allowed by CORS'));
  //     }
  //   },
  //   credentials: true,
  // });

  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
