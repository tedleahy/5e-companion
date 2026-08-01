-- Race-safe uniqueness for active custom class names (per owner, case-insensitive).
-- Archived rows are excluded so a name can be reused after archive.
CREATE UNIQUE INDEX "Class_ownerUserId_lower_name_active_key"
ON "Class" ("ownerUserId", lower("name"))
WHERE "ownerUserId" IS NOT NULL AND "archivedAt" IS NULL;

-- Same policy for active custom subclasses (per owner + parent class, case-insensitive).
CREATE UNIQUE INDEX "Subclass_ownerUserId_classId_lower_name_active_key"
ON "Subclass" ("ownerUserId", "classId", lower("name"))
WHERE "ownerUserId" IS NOT NULL AND "archivedAt" IS NULL;
