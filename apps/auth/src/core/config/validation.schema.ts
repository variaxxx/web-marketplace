import { EnvKey } from "./env-key.enum";
import Joi from "joi";

export const validationSchema = Joi.object({
  [EnvKey.ACCESS_JWT_SECRET]: Joi.string().required(),
  [EnvKey.REFRESH_JWT_SECRET]: Joi.string().required(),

  [EnvKey.RMQ_URL]: Joi.string().required(),

  [EnvKey.AUTH_REDIS_HOST]: Joi.string(),
  [EnvKey.AUTH_REDIS_PORT]: Joi.string().required(),
  [EnvKey.AUTH_REDIS_USER]: Joi.string().required(),
  [EnvKey.AUTH_REDIS_PASSWORD]: Joi.string().required(),

  [EnvKey.AUTH_GRPC_URL]: Joi.string().required(),
});
