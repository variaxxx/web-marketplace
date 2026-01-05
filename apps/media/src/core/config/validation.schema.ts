import { EnvKey } from "./env-key.enum";
import Joi from "joi";

export const validationSchema = Joi.object({
  [EnvKey.RMQ_URL]: Joi.string().required(),

  [EnvKey.MEDIA_GRPC_URL]: Joi.string().required(),
  [EnvKey.MEDIA_SERVER_PORT]: Joi.string().required(),

  [EnvKey.MINIO_ENDPOINT]: Joi.string(),
  [EnvKey.MINIO_PORT]: Joi.string().required(),
  [EnvKey.MINIO_ACCESS_KEY]: Joi.string().required(),
  [EnvKey.MINIO_SECRET_KEY]: Joi.string().required(),
});
