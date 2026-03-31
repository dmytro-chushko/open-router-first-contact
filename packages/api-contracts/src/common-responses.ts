import { z } from 'zod';

const errorResponseBase = z.object({
  status: z.number(),
  error: z.string(),
});

export const badRequestResponse = errorResponseBase.extend({
  status: z.literal(400),
  issues: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
      })
    )
    .optional(),
});

export const unauthorizedResponse = errorResponseBase.extend({
  status: z.literal(401),
});

export const forbiddenResponse = errorResponseBase.extend({
  status: z.literal(403),
});

export const notFoundResponse = errorResponseBase.extend({
  status: z.literal(404),
});

export const conflictResponse = errorResponseBase.extend({
  status: z.literal(409),
});

export const unprocessableEntityResponse = errorResponseBase.extend({
  status: z.literal(422),
});

export const internalServerErrorResponse = errorResponseBase.extend({
  status: z.literal(500),
});
