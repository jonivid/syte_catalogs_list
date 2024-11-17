import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Apply the LoggingInterceptor globally
  app.useGlobalInterceptors(new LoggingInterceptor());

  const PORT = Number(process.env.PORT) || 8001;
  await app.listen(PORT);
  console.log(`🚀 Application is running on: http://localhost:${PORT}`);
}

bootstrap();
