# Backups and recovery

What is stored where, how it is backed up, and how to get back from a bad day.

## What needs protecting

| Data | Where | Protection |
| --- | --- | --- |
| Accounts, memberships, events, tickets, messages, audit log | PostgreSQL (Supabase) | Provider backups + the nightly encrypted dump below |
| Club and team logos and banners | Supabase Storage bucket `uniarena-media` | Weekly copy of the bucket (see "Storage") |
| Code | GitHub | Keep branch protection on `main` and `develop` |
| Secrets | Host dashboards | An encrypted copy in a password manager |

## Targets

- **RPO** (most data you can lose): 24 hours now, 1 hour once there are real users (turn on point-in-time recovery).
- **RTO** (time to be back online): 4 hours.

## Nightly database backup

`.github/workflows/backup.yml` runs `backend/scripts/backup.sh` every night. It dumps the database with `pg_dump`,
encrypts the file with GPG and stores it as a private artifact for 30 days (and uploads it to `BACKUP_DEST` when set).

Setup, once:

1. In Supabase create a read-only database user for backups.
2. In GitHub add the repository secrets `BACKUP_DATABASE_URL` and `BACKUP_PASSPHRASE`. Store the passphrase in your password manager too: without it a backup cannot be opened.
3. Run the workflow once by hand (Actions > Nightly database backup > Run workflow) and confirm it produced a file.
4. Also switch on the provider's own automatic backups. Check what your Supabase plan includes: free plans keep little or nothing, and point-in-time recovery is a paid add-on.

For a second copy outside GitHub, set `BACKUP_DEST` (for example an S3-compatible bucket) and the matching `AWS_*` secrets.

## Storage bucket

The database backup does not include uploaded images. Once a week copy the `uniarena-media` bucket to a second location
(Supabase dashboard export, or `rclone` against the S3-compatible endpoint). Images can be re-uploaded by leaders, so this matters less than the database.

## Restore drill (do this before launch, then every quarter)

1. Create an empty scratch database (a free Supabase project works).
2. Download the latest backup file and decrypt it: `gpg --decrypt uniarena-DATE.dump.gpg > uniarena.dump`
3. Restore: `pg_restore --no-owner -d "$SCRATCH_DATABASE_URL" uniarena.dump`
4. Point a local copy of the API at the scratch database and sign in. Check that clubs, events, tickets and a few messages are there.
5. Write down how long it took and anything that went wrong. Fix the instructions here.

A backup that has never been restored is only a hope.

## Before every migration

1. Take a manual backup (run the workflow, or `npm run backup` from `backend/` with the same variables).
2. Apply it as the database owner: `DATABASE_URL="<owner url>" npx prisma migrate deploy`. Migrations that change tables need the owner, not the app's limited user.
3. Have the roll-back step written down before you start (usually: restore the backup you just took).

## When something goes wrong

1. **Contain:** if accounts may be exposed, rotate `NEXTAUTH_SECRET` and `API_JWT_SECRET` (this signs everyone out) and every provider key.
2. **Assess:** use the audit log and the request logs (each request has an `X-Request-Id`).
3. **Recover:** roll back the release, or restore the latest backup using the drill above.
4. **Tell people:** if personal data was exposed, notify the affected students and the regulator within the legal time limit. Confirm the exact duty with your data protection contact.
5. **Learn:** write down the cause and add a check or test so it cannot return.

## Data retention

`npm run retention` (in `backend/`) lists, and with `CONFIRM=yes` deletes, messages older than `MESSAGE_RETENTION_DAYS` (default 365),
read notifications older than `NOTIFICATION_RETENTION_DAYS` (default 90) and expired password-reset and confirmation tokens.
Schedule it weekly once the numbers match the published Data Policy.
