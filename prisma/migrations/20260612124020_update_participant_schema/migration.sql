/*
  Warnings:

  - You are about to drop the column `displayName` on the `Participant` table. All the data in the column will be lost.
  - You are about to drop the column `speciesAvatar` on the `Participant` table. All the data in the column will be lost.
  - Added the required column `house` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nickname` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `surname` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Staff` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Participant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "huntId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "house" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "qrToken" TEXT NOT NULL,
    "registeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Participant_huntId_fkey" FOREIGN KEY ("huntId") REFERENCES "Hunt" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Participant" ("huntId", "id", "qrToken", "registeredAt") SELECT "huntId", "id", "qrToken", "registeredAt" FROM "Participant";
DROP TABLE "Participant";
ALTER TABLE "new_Participant" RENAME TO "Participant";
CREATE UNIQUE INDEX "Participant_username_key" ON "Participant"("username");
CREATE UNIQUE INDEX "Participant_qrToken_key" ON "Participant"("qrToken");
CREATE TABLE "new_Staff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "checkpointId" TEXT,
    "displayName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'officer',
    CONSTRAINT "Staff_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "Checkpoint" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Staff" ("checkpointId", "displayName", "id", "role", "sessionToken") SELECT "checkpointId", "displayName", "id", "role", "sessionToken" FROM "Staff";
DROP TABLE "Staff";
ALTER TABLE "new_Staff" RENAME TO "Staff";
CREATE UNIQUE INDEX "Staff_username_key" ON "Staff"("username");
CREATE UNIQUE INDEX "Staff_sessionToken_key" ON "Staff"("sessionToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
