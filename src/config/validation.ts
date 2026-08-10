import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(5000),
  DB_URI: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().required(),
  BCRYPT_SALT_ROUNDS: Joi.number().default(12),
  ADMIN_EMAIL: Joi.string().email().optional(),
  ADMIN_PASSWORD: Joi.string().min(8).optional(),
  ADMIN_NAME: Joi.string().optional(),
});
