#!/bin/bash
set -e
PG_USER="postgres"
PG_PASS="postgres"
PG_HOST="localhost"
PG_PORT="5433"

dbs=("auth_db" "user_db" "product_db" "review_db")

for db in "${dbs[@]}"; do
  PGPASSWORD="$PG_PASS" psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -c "CREATE DATABASE $db;" 2>/dev/null || true
done
