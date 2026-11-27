#!/usr/bin/env bash
# Takes an encrypted copy of the database and uploads it somewhere other than the database host.
#
# Needs: pg_dump, gpg, and (for the upload) the AWS CLI or any S3-compatible tool.
# Settings (environment variables):
#   BACKUP_DATABASE_URL   connection string for a READ-ONLY database user (never the app's or the owner's)
#   BACKUP_PASSPHRASE     the passphrase that encrypts the dump (keep it in a password manager too)
#   BACKUP_DEST           where to upload, for example s3://my-bucket/uniarena   (optional: without it the file stays local)
#   BACKUP_KEEP_DAYS      delete local copies older than this (default 14)
#
# Restore:  gpg --decrypt FILE.dump.gpg > FILE.dump  &&  pg_restore --no-owner -d "$SCRATCH_DATABASE_URL" FILE.dump
set -euo pipefail

: "${BACKUP_DATABASE_URL:?Set BACKUP_DATABASE_URL}"
: "${BACKUP_PASSPHRASE:?Set BACKUP_PASSPHRASE}"

DIR="${BACKUP_DIR:-./backups}"
STAMP="$(date -u +%Y-%m-%dT%H%M%SZ)"
FILE="$DIR/uniarena-$STAMP.dump.gpg"
mkdir -p "$DIR"

pg_dump --format=custom --no-owner --no-privileges "$BACKUP_DATABASE_URL" \
  | gpg --batch --yes --symmetric --cipher-algo AES256 --passphrase "$BACKUP_PASSPHRASE" -o "$FILE"

# A backup that is empty or tiny is a failed backup
SIZE=$(stat -c %s "$FILE" 2>/dev/null || stat -f %z "$FILE")
if [ "$SIZE" -lt 2048 ]; then echo "Backup is suspiciously small ($SIZE bytes)" >&2; exit 1; fi

if [ -n "${BACKUP_DEST:-}" ]; then
  aws s3 cp "$FILE" "$BACKUP_DEST/$(basename "$FILE")"
fi

find "$DIR" -name 'uniarena-*.dump.gpg' -mtime +"${BACKUP_KEEP_DAYS:-14}" -delete
echo "Backup written: $FILE ($SIZE bytes)"
