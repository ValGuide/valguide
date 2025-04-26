#!/bin/sh

# Array of files to encrypt
files=(
  ".env/.env.defaults"
  ".env/.env.db.dev"
  ".env/.env.db.local"
  ".env/.env.db.prod"
  ".env/.env.web.local"
  ".env/.env.web.prod"
  ".env/.env.web.dev"
)
