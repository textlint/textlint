#!/bin/bash
set -eux
declare currentDir=$(cd $(dirname $0);pwd)
declare dirName=$(basename "${currentDir}")
declare parentDir=$(dirname "${currentDir}")
declare exampleDir="${parentDir}/example"
# init
cd "${exampleDir}"
npm uninstall textlint-scripts
npm install
npm test
npm run build

exit 0