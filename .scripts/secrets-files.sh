#!/bin/sh

# Array of files to encrypt
files=(
  ".secrets/.env.defaults"
  ".secrets/.env.supabase.dev"
  ".secrets/.env.supabase.local"
  ".secrets/.env.supabase.prod"
  ".secrets/.env.resend.dev"
  ".secrets/.env.resend.prod"
  ".secrets/client_secret_dev.apps.googleusercontent.com.json"
  ".secrets/client_secret_prod.apps.googleusercontent.com.json"
  "apps/links/certificates/localhost.pem"
  "apps/links/certificates/localhost-key.pem"
  "apps/www/certificates/localhost.pem"
  "apps/www/certificates/localhost-key.pem"
  "apps/studio/certificates/localhost.pem"
  "apps/studio/certificates/localhost-key.pem"
  "apps/app/certificates/localhost.pem"
  "apps/app/certificates/localhost-key.pem"
  "apps/admin/certificates/localhost.pem"
  "apps/admin/certificates/localhost-key.pem"
)
