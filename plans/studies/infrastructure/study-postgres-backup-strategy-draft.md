---
title: "PostgreSQL Backup & Restore Strategy"
topic: "postgres-backup-strategy"
category: "infrastructure"
status: "draft"
decision_deadline: "2026-03-08"
created: "2026-03-08"
last_modified: "2026-03-08"
authors:
  - "automation"
---

## Findings

# PostgreSQL Backup & Restore Strategy

**Description**
A reliable backup plan for the PostgreSQL database powering Saleor is essential to meet SLA and GDPR data‑retention requirements. The strategy combines regular logical backups (`pg_dump`) with continuous WAL (Write‑Ahead‑Log) archiving, enabling point‑in‑time recovery (PITR) and fast restores.

**Components**

1. **Full logical dump** – Nightly `pg_dump -Fc` (custom format) stored in a secure object storage bucket (e.g., AWS S3, Azure Blob, or self‑hosted MinIO).
2. **WAL archiving** – Enable `archive_mode = on` and set `archive_command` to copy each WAL segment to the same bucket (`aws s3 cp %p s3://backup-bucket/wal/%f`). This provides continuous protection between dumps.
3. **Retention policy** – Keep daily dumps for 30 days, weekly for 6 months, and monthly for 2 years. Retain WAL files for at least the longest retention window (e.g., 30 days for daily restores).
4. **Automation** – Use a cron job (Docker container or host cron) to run `pg_dump` and invoke `aws s3 sync`. Example cron entry: `0 2 * * * /usr/local/bin/pg_dump -Fc -f /backup/saleor_$(date +%F).dump && /usr/local/bin/aws s3 cp /backup/* s3://saleor-backups/`.

**Restore procedure**

- **Logical restore** – `pg_restore -d saleor_prod s3://saleor-backups/saleor_2024-12-01.dump`.
- **Point‑in‑time restore** – Set up a new PostgreSQL instance, restore the latest base dump, then apply archived WAL files using `pg_restore` with `recovery_target_time='2024-12-01 08:35:00'`.

**Testing & Monitoring**

- Perform quarterly test restores on a staging environment to verify dump integrity.
- Monitor backup job success via CloudWatch/Prometheus alerts on non‑zero exit codes.
- Enable `pg_stat_archiver` to ensure WAL files are successfully archived.

**Key Takeaways**

- Combine nightly logical dumps with continuous WAL archiving for full data protection and PITR capability.
- Store backups in encrypted, immutable object storage with a clear retention schedule.
- Regularly test restores and monitor backup jobs to avoid silent failures.

**References**

- PostgreSQL Backup and Restore documentation – https://www.postgresql.org/docs/current/backup.html
- WAL archiving guide – https://www.postgresql.org/docs/current/continuous-archiving.html
- AWS S3 best practices for databases – https://aws.amazon.com/blogs/database/best-practices-for-using-amazon-s3-as-a-backup-target/
