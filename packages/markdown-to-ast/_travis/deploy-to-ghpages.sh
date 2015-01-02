#!/bin/bash
if [[ "$TRAVIS_PULL_REQUEST" == "true" ]]; then
echo "This is a pull request. No deployment will be done.";
  exit 0;
fi
if [[ "$TRAVIS_BRANCH" != "master" ]] && [[ "$TRAVIS_BRANCH" != "staging" ]]; then
echo "This is not a deployable branch.";
  exit 0;
fi

echo "BUMP HELLO WORLD set up $GH_REPO [via travis] for $GIT_NAME <${GIT_EMAIL}>"
export REPO_URL="https://$GH_TOKEN@github.com/$GH_REPO.git"
git config user.name ${GIT_NAME}
git config user.email ${GIT_EMAIL}

# Git
git checkout -b gh-pages
lastCommit=$(git log --oneline | head -n 1)

echo "=STATUS="
git status

echo "=COMMIT="
echo "MESSAGE :" $lastCommit

git add . --verbose
git commit -m "Travis build $TRAVIS_BUILD_NUMBER"

echo "=PUSH STATUS="
git status
git push --force --quiet "$REPO_URL" gh-pages > /dev/null 2>&1
