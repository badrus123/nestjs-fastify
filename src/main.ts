import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify';
import { v4 as uuidv4 } from 'uuid';
// import {HttpExceptionFilter} from './utility/filter/http-exception.filter';
// import {BaseResponseInterceptor} from './utility/interceptor/base-response.interceptor';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
// import {contentParser} from 'fastify-file-interceptor';
async function bootstrap() {
  try {
    const PORT = 3001;
    const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter({
        logger: true,
        genReqId: () => uuidv4(),
      }),
    );

    app.useGlobalPipes(new ValidationPipe()); // enable ValidationPipe`
    // app.useGlobalInterceptors(new BaseResponseInterceptor());
    // app.useGlobalFilters(new HttpExceptionFilter());
    app.enableCors({ origin: '*' });
    const config = new DocumentBuilder()
      .setTitle('Upload Static File')
      .setDescription('Service for Authentication with Header key')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT', // This name here is important for matching up with @ApiBearerAuth() in your controller!
      )
      .addServer(
        process.env.NODE_ENV === 'production'
          ? '/v2/static-upload/'
          : process.env.NODE_ENV === 'development'
          ? '/dev/v2/static-upload/'
          : process.env.NODE_ENV === 'staging'
          ? '/stg/v2/static-upload/'
          : '/',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api-docs', app, document);
    await app.listen(PORT, '0.0.0.0');
  } catch (error) {
    console.log(error);
  }
}
bootstrap();
