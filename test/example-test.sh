#!/bin/bash
set -e
rootDir=$(git rev-parse --show-toplevel)
cd ${rootDir}/examples/cli && npm test
cd ${rootDir}/examples/config-file && npm test
cd ${rootDir}/examples/rulesdir && npm test