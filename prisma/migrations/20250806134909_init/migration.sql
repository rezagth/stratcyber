-- AlterTable
ALTER TABLE "Audit" ADD COLUMN "legalRiskScore" REAL;
ALTER TABLE "Audit" ADD COLUMN "roadmapData" TEXT;

-- CreateTable
CREATE TABLE "StrategicAction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Non commencé',
    "startDate" DATETIME,
    "dueDate" DATETIME NOT NULL,
    "estimatedDuration" INTEGER,
    "owner" TEXT,
    "assignees" TEXT,
    "budget" REAL,
    "businessImpact" TEXT,
    "technicalComplexity" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "blockers" TEXT,
    "dependencies" TEXT,
    "resources" TEXT,
    "kpis" TEXT,
    "successCriteria" TEXT,
    "notes" TEXT,
    "auditId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StrategicAction_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StrategicMilestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Non commencé',
    "dueDate" DATETIME NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "auditId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StrategicMilestone_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RoadmapQuarter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quarter" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "budget" REAL,
    "focusAreas" TEXT,
    "objectives" TEXT,
    "kpis" TEXT,
    "userId" TEXT NOT NULL,
    "milestones" TEXT,
    "actions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ComplianceScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "regulation" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" TEXT,
    "recommendations" TEXT,
    "nextReviewDate" DATETIME,
    "auditId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ComplianceScore_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LegalRiskAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "overallScore" REAL NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "regulationRisks" TEXT,
    "criticalPoints" TEXT,
    "urgentActions" TEXT,
    "trendDirection" TEXT,
    "projectedScore" REAL,
    "auditId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LegalRiskAssessment_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_StrategicActionToStrategicMilestone" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_StrategicActionToStrategicMilestone_A_fkey" FOREIGN KEY ("A") REFERENCES "StrategicAction" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_StrategicActionToStrategicMilestone_B_fkey" FOREIGN KEY ("B") REFERENCES "StrategicMilestone" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "LegalRiskAssessment_auditId_key" ON "LegalRiskAssessment"("auditId");

-- CreateIndex
CREATE UNIQUE INDEX "_StrategicActionToStrategicMilestone_AB_unique" ON "_StrategicActionToStrategicMilestone"("A", "B");

-- CreateIndex
CREATE INDEX "_StrategicActionToStrategicMilestone_B_index" ON "_StrategicActionToStrategicMilestone"("B");
