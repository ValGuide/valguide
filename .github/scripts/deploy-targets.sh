#!/usr/bin/env bash

deploy_url_for() {
  case "$1" in
    app-prod) echo "https://app.valguide.com" ;;
    app-dev) echo "https://app.valguide.dev" ;;
    studio-prod) echo "https://studio.valguide.com" ;;
    studio-dev) echo "https://studio.valguide.dev" ;;
    admin-prod) echo "https://ops.val.guide" ;;
    admin-dev) echo "https://ops-dev.val.guide" ;;
    docs-prod) echo "https://docs.val.guide" ;;
    docs-dev) echo "https://docs-dev.val.guide" ;;
    links-prod) echo "https://links.valguide.com" ;;
    links-dev) echo "https://links.valguide.dev" ;;
    storybook-prod) echo "https://sb.val.guide" ;;
    storybook-dev) echo "https://sb-dev.val.guide" ;;
    www-prod) echo "https://www.valguide.com" ;;
    www-dev) echo "https://www.valguide.dev" ;;
    *) echo "" ;;
  esac
}

deploy_display_for() {
  case "$1" in
    app) echo "App" ;;
    studio) echo "Studio" ;;
    admin) echo "Admin" ;;
    docs) echo "Docs" ;;
    links) echo "Links" ;;
    storybook) echo "Storybook" ;;
    www) echo "www" ;;
    workers) echo "Workers" ;;
    *) echo "$1" ;;
  esac
}
