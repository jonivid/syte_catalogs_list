#!/bin/sh
set -e
host="$1"
shift
until mysqladmin ping -h "$host" --silent; do
  echo "Waiting for MySQL to be ready..."
  sleep 2
done
exec "$@"
