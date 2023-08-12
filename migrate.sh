#!/usr/bin/env bash


npm install -g jscodeshift
LATEST_VERSION=$(npm view commonjs-to-es-module-codemod version)
jscodeshift -t "https://unpkg.com/commonjs-to-es-module-codemod@${LATEST_VERSION}/dist/index.js" --parser ts --extensions ts \
./packages/@textlint/**/src/**/*.ts
