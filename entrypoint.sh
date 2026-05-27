#!/bin/sh
node src/db/init-db.js
node src/db/seed.js
node src/index.js
