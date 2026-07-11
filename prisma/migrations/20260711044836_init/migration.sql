-- CreateTable
CREATE TABLE "Snippet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'standard',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AnalysisRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "snippetId" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'standard',
    "language" TEXT NOT NULL,
    "overall" INTEGER NOT NULL,
    "bugCount" INTEGER NOT NULL DEFAULT 0,
    "scores" TEXT NOT NULL,
    "findings" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalysisRun_snippetId_fkey" FOREIGN KEY ("snippetId") REFERENCES "Snippet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "weekStart" DATETIME NOT NULL,
    "summary" TEXT NOT NULL,
    "stats" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);
