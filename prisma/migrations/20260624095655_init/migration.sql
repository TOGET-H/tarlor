-- CreateTable
CREATE TABLE "TarotCard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "arcana" TEXT NOT NULL,
    "suit" TEXT,
    "number" TEXT,
    "uprightMeaning" TEXT NOT NULL,
    "reversedMeaning" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Reading" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "question" TEXT NOT NULL,
    "spreadType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'interpreted',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ReadingCard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "readingId" INTEGER NOT NULL,
    "cardId" INTEGER NOT NULL,
    "position" TEXT NOT NULL,
    "orientation" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    CONSTRAINT "ReadingCard_readingId_fkey" FOREIGN KEY ("readingId") REFERENCES "Reading" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReadingCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "TarotCard" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Interpretation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "readingId" INTEGER NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'mock',
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Interpretation_readingId_fkey" FOREIGN KEY ("readingId") REFERENCES "Reading" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TarotCard_name_key" ON "TarotCard"("name");
