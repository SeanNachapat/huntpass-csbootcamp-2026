/*
  Warnings:

  - You are about to drop the column `checkpointId` on the `Staff` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_CheckpointToStaff" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CheckpointToStaff_A_fkey" FOREIGN KEY ("A") REFERENCES "Checkpoint" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CheckpointToStaff_B_fkey" FOREIGN KEY ("B") REFERENCES "Staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Staff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'officer'
);
INSERT INTO "new_Staff" ("displayName", "id", "password", "role", "sessionToken", "username") SELECT "displayName", "id", "password", "role", "sessionToken", "username" FROM "Staff";
DROP TABLE "Staff";
ALTER TABLE "new_Staff" RENAME TO "Staff";
CREATE UNIQUE INDEX "Staff_username_key" ON "Staff"("username");
CREATE UNIQUE INDEX "Staff_sessionToken_key" ON "Staff"("sessionToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_CheckpointToStaff_AB_unique" ON "_CheckpointToStaff"("A", "B");

-- CreateIndex
CREATE INDEX "_CheckpointToStaff_B_index" ON "_CheckpointToStaff"("B");
