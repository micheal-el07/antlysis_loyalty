#!/bin/sh
# Waits for Postgres to actually accept connections (container start != DB
# ready), then runs migrations + the idempotent admin seeder before
# starting the API. Plain retry loop, not depends_on/healthcheck — those
# needed a Compose file version newer than what every reviewer's Docker
# install will necessarily have.
set -e

i=0
until npm run db:migrate; do
  i=$((i + 1))
  if [ "$i" -ge 15 ]; then
    echo "Postgres did not become ready in time." >&2
    exit 1
  fi
  echo "Waiting for Postgres... ($i/15)"
  sleep 2
done

npm run db:seed:all
exec npm start
