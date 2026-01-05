import { join } from "node:path";

export const PROTO_FILES_PATHS = {
  AUTH: join(__dirname, "../../libs/contracts/proto/auth.proto"),
  USER: join(__dirname, "../../libs/contracts/proto/user.proto"),
  MEDIA: join(__dirname, "../../libs/contracts/proto/media.proto"),
  ADDRESS: join(__dirname, "../../libs/contracts/proto/address.proto"),
  SELLER_APPLICATION: join(__dirname, "../../libs/contracts/proto/seller-application.proto"),
  STORE: join(__dirname, "../../libs/contracts/proto/store.proto"),
} as const;
