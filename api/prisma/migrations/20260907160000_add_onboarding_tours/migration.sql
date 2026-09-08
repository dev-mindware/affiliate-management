-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "onboarding_tour_status_enum" AS ENUM ('in_progress', 'completed', 'skipped');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "onboarding_preferences" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "auto_start_enabled" BOOLEAN NOT NULL DEFAULT true,
    "tour_button_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "onboarding_tour_progress" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "tour_id" TEXT NOT NULL,
    "status" "onboarding_tour_status_enum" NOT NULL DEFAULT 'in_progress',
    "last_step_index" INTEGER,
    "tour_version" INTEGER NOT NULL DEFAULT 1,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "skipped_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_tour_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "onboarding_preferences_user_id_key" ON "onboarding_preferences"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "onboarding_tour_progress_user_id_idx" ON "onboarding_tour_progress"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "onboarding_tour_progress_user_id_tour_id_key" ON "onboarding_tour_progress"("user_id", "tour_id");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "onboarding_preferences" ADD CONSTRAINT "onboarding_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "onboarding_tour_progress" ADD CONSTRAINT "onboarding_tour_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
