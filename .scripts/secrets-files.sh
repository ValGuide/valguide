#!/bin/sh

# Array of files to encrypt
files=(
  ".secrets/.env.defaults"
  ".secrets/.env.supabase.dev"
  ".secrets/.env.supabase.local"
  ".secrets/.env.supabase.prod"
)
