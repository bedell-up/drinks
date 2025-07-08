#!/bin/bash
set -e

cd "$(dirname "$0")"
npm install
npm run build

rm -rf ../backend/static/*
cp -r build/* ../backend/static/

echo "✅ React build complete and copied to backend/static"
