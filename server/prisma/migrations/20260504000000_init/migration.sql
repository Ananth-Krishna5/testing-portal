-- CreateEnum
CREATE TYPE "ProgramStatus" AS ENUM ('draft', 'active', 'completed', 'archived');
CREATE TYPE "ProjectStatus" AS ENUM ('draft', 'active', 'paused', 'completed');
CREATE TYPE "JobStatus" AS ENUM ('active', 'paused', 'completed');
CREATE TYPE "RunStatus" AS ENUM ('queued', 'running', 'passed', 'failed', 'cancelled', 'error');
CREATE TYPE "TestResultStatus" AS ENUM ('pass', 'fail', 'skip');
CREATE TYPE "UserRole" AS ENUM ('admin', 'tester', 'viewer', 'external');
CREATE TYPE "TeamType" AS ENUM ('internal', 'development', 'external');
CREATE TYPE "UserAccountStatus" AS ENUM ('active', 'invited', 'disabled');
CREATE TYPE "SuiteSeverity" AS ENUM ('critical', 'high', 'medium', 'low');

CREATE TABLE "roadmaps" (
    "id" TEXT NOT NULL,
    "program_id" TEXT,
    "template_id" TEXT,
    "name" TEXT NOT NULL,
    "canvas_json" JSONB NOT NULL DEFAULT '{}',
    "is_custom" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "roadmaps_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "programs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "manager" TEXT,
    "budget" DECIMAL(14,2),
    "cert_agency" TEXT,
    "start_date" DATE,
    "target_end_date" DATE,
    "roadmap_id" TEXT,
    "status" "ProgramStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "target_product" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'draft',
    "auto_create_tickets" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "test_suites" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "tools" TEXT,
    "focus_areas" TEXT,
    "kpi_json" JSONB NOT NULL DEFAULT '{}',
    "scope" TEXT,
    "standards" TEXT,
    "severity" "SuiteSeverity" NOT NULL DEFAULT 'medium',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "test_suites_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "scheduled_jobs" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "suite_id" TEXT NOT NULL,
    "from_date" DATE NOT NULL,
    "to_date" DATE NOT NULL,
    "time" TEXT NOT NULL,
    "recurrence" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "scheduled_jobs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "test_runs" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "status" "RunStatus" NOT NULL DEFAULT 'queued',
    "runner_type" TEXT NOT NULL,
    "container_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "test_runs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "test_results" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "test_name" TEXT NOT NULL,
    "status" "TestResultStatus" NOT NULL,
    "duration_ms" INTEGER,
    "error_msg" TEXT,
    "screenshot_url" TEXT,
    "log_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "test_results_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ticket_bridge_log" (
    "id" TEXT NOT NULL,
    "result_id" TEXT NOT NULL,
    "sd_ticket_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload_json" JSONB NOT NULL,
    CONSTRAINT "ticket_bridge_log_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'viewer',
    "team_type" "TeamType" NOT NULL DEFAULT 'internal',
    "status" "UserAccountStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "integration_settings" (
    "id" TEXT NOT NULL,
    "support_desk_url" TEXT,
    "auto_ticket_global" BOOLEAN NOT NULL DEFAULT true,
    "last_health_check_at" TIMESTAMP(3),
    "last_health_check_ok" BOOLEAN,
    "tickets_created_count" INTEGER NOT NULL DEFAULT 0,
    "bridge_error_count" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "integration_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "bridge_retry_queue" (
    "id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bridge_retry_queue_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "programs" ADD CONSTRAINT "programs_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "roadmaps"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "projects" ADD CONSTRAINT "projects_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "scheduled_jobs" ADD CONSTRAINT "scheduled_jobs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "scheduled_jobs" ADD CONSTRAINT "scheduled_jobs_suite_id_fkey" FOREIGN KEY ("suite_id") REFERENCES "test_suites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "test_runs" ADD CONSTRAINT "test_runs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "scheduled_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "test_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ticket_bridge_log" ADD CONSTRAINT "ticket_bridge_log_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "test_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "ticket_bridge_log_result_id_key" ON "ticket_bridge_log"("result_id");
