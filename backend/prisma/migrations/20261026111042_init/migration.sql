
CREATE TABLE "tasks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status_id" INTEGER NOT NULL,
    "category_id" INTEGER,
    "due_at" DATETIME,
    "reminder_at" DATETIME,
    "completed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "tasks_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "statuses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tasks_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "statuses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "colour" TEXT NOT NULL DEFAULT '#64748b',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);


CREATE TABLE "categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "colour" TEXT NOT NULL DEFAULT '#64748b',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);


CREATE INDEX "tasks_status_id_idx" ON "tasks"("status_id");


CREATE INDEX "tasks_category_id_idx" ON "tasks"("category_id");


CREATE INDEX "tasks_due_at_idx" ON "tasks"("due_at");

CREATE UNIQUE INDEX "statuses_name_key" ON "statuses"("name");


CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");
