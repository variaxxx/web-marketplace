/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('INACTIVE', 'ACTIVE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "refresh_token" TEXT,
ADD COLUMN     "role" "Role" NOT NULL,
ADD COLUMN     "status" "Status" NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
