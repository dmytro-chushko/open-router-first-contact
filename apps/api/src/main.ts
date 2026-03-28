import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { contract } from '@repo/api-contracts';
import { generateOpenApi } from '@ts-rest/open-api';
import * as swaggerUi from 'swagger-ui-express';

import { AppModule } from './app.module';
import { AppConfigService } from './common/services/app-config';

async function bootstrap() {
  const logger = new Logger('Main');
  const app = await NestFactory.create(AppModule);

  const appConfig = app.get(AppConfigService);
  const port = appConfig.port;

  app.setGlobalPrefix('api');

  const openApiDocument = generateOpenApi(
    contract,
    {
      info: {
        title: 'Open Router App API',
        version: '1.0.0',
        description: 'API for Open Router App',
      },
      servers: [
        {
          url: appConfig.apiUrl || `http://localhost:${port}/api`,
          description: 'API Server',
        },
      ],
    },
    {
      setOperationId: true,
    },
  );

  app.use(
    '/api/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Heliguy.io API Documentation',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
    }),
  );

  logger.log(
    `🔗 Swagger UI: ${appConfig.apiUrl || `http://localhost:${port}`}/api/api-docs`,
  );

  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
}
void bootstrap();
