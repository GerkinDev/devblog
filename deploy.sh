#!/bin/bash

echo -e "\033[0;32mDeploying updates to GitHub...\033[0m"

if [ -n "$GITHUB_AUTH_SECRET" ]
then
    touch ~/.git-credentials
    chmod 0600 ~/.git-credentials
    echo $GITHUB_AUTH_SECRET > ~/.git-credentials
    
    git config credential.helper store
    git config user.email "GerkinDev-blog-bot@users.noreply.github.com"
    git config user.name "GerkinDev-blog-bot"
fi

GIT_REMOTE="$(git config --get remote.origin.url)"

rm -rf public
mkdir public
cd public

git init .
git remote add origin $GIT_REMOTE
git fetch origin docs
git checkout docs
rm -rf *

cd ..
hugo
cd public

git add .
git commit -m "Rebuild site"
git push origin HEAD:docs