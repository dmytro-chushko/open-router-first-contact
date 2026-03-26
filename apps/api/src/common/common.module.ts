import { Module } from '@nestjs/common';

import { AppConfigService } from './services/app-config';

@Module({
  imports: [],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class CommonModule {}
