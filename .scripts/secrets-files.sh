#!/bin/sh

# Array of files to encrypt
files=(
  ".secrets/.env.defaults"
  ".secrets/.env.db.dev"
  ".secrets/.env.db.local"
  ".secrets/.env.db.prod"
  ".secrets/.env.web.local"
  ".secrets/.env.web.prod"
  ".secrets/.env.web.dev"
)
