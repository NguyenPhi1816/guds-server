import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // This line enables global validation pipes,
  // ensuring that only validated data is passed through
  // and removing any properties that do not have validation decorators.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.enableCors();

  const port = process.env.PORT;
  await app.listen(port || 8080);
}
bootstrap();
