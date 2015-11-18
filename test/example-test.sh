#!/bin/bash
set -e
NODE_ENV=production
rootDir=$(git rev-parse --show-toplevel)
cd ${rootDir}/examples/cli && npm test
cd ${rootDir}/examples/config-file && npm test
cd ${rootDir}/examples/rulesdir && npm test
cd ${rootDir}/examples/plugin && npm test
cd ${rootDir}/examples/html-plugin && npm test
cd ${rootDir}/examples/use-as-module && npm test