-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Checkpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "huntId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zootopiaIcon" TEXT,
    "order" INTEGER DEFAULT 0,
    "hint" TEXT,
    "type" TEXT NOT NULL DEFAULT 'badge',
    CONSTRAINT "Checkpoint_huntId_fkey" FOREIGN KEY ("huntId") REFERENCES "Hunt" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Checkpoint" ("hint", "huntId", "id", "name", "order", "zootopiaIcon") SELECT "hint", "huntId", "id", "name", "order", "zootopiaIcon" FROM "Checkpoint";
DROP TABLE "Checkpoint";
ALTER TABLE "new_Checkpoint" RENAME TO "Checkpoint";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
