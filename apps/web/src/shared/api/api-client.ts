import { contract } from '@repo/api-contracts';
import { initClient } from '@ts-rest/core';

import { getPublicApiBaseUrl } from '@/shared/config/public-api-url';

export const publicApiClient = initClient(contract, {
  baseUrl: getPublicApiBaseUrl(),
  baseHeaders: {},
});
