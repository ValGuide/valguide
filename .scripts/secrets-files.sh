#!/bin/sh

# Array of files to encrypt
files=(
  ".secrets/.env.defaults"
  ".secrets/.env.supabase.dev"
  ".secrets/.env.supabase.local"
  ".secrets/.env.supabase.prod"
  "apps/links/certificates/localhost.pem"
  "apps/links/certificates/localhost-key.pem"
  "apps/site/certificates/localhost.pem"
  "apps/site/certificates/localhost-key.pem"
  "apps/studio/certificates/localhost.pem"
  "apps/studio/certificates/localhost-key.pem"
  "apps/visit/certificates/localhost.pem"
  "apps/visit/certificates/localhost-key.pem"
)
