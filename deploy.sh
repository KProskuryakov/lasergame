#!/usr/bin/env sh

if ! npm run build ; then
    echo "issues running build"
    exit 1
fi

git add -f dist
git commit -m "deploying dist folder"
git subtree push --prefix dist origin gh-pages