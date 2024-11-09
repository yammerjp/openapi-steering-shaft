#!/bin/bash

set -e

bash -c "$(cat .env | xargs echo) npm run dev"
