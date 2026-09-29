-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "interviewDates" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "interviewTime" TEXT;
