import { EnvKey } from "./env-key.enum";
import Joi from "joi";

export const validationSchema = Joi.object({
  [EnvKey.MAIL_HOST]: Joi.string().required(),
  [EnvKey.MAIL_PORT]: Joi.number().positive().required(),
  [EnvKey.MAIL_USER]: Joi.string().required(),
  [EnvKey.MAIL_PASSWORD]: Joi.string().required(),
  [EnvKey.MAIL_SENDER]: Joi.string().required(),
  [EnvKey.RMQ_URL]: Joi.string().required(),
});
