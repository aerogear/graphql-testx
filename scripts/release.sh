#!/usr/bin/env bash

set -e

# explicit declaration that this script needs a $TAG variable passed in e.g TAG=1.2.3 ./script.sh
TAG="$TAG"

RELEASE_SYNTAX='^[0-9]+\.[0-9]+\.[0-9]+$'
PRERELEASE_SYNTAX='^[0-9]+\.[0-9]+\.[0-9]+(-.+)+$'

# get version found in package.json. This is the source of truth
PACKAGE_VERSION="$(cat package.json | jq -r '.version')"

DRY_RUN="false"
if [ "$CI" != "true" ]; then
    DRY_RUN="true"
    echo "Warning: this script will be executed in dry run mode"
    echo " because it is running outside of the CI"
    echo "If you really need to run this script, you can use"
    echo "CI=true ./scripts/release.sh"
fi

# validate that TAG == version found in package.json
if [[ "$TAG" != "$PACKAGE_VERSION" ]]; then
    echo "tag $TAG is not the same as package version found in package.json $PACKAGE_VERSION"
    exit 1
fi

if [[ "$(echo "$TAG" | grep -E "$RELEASE_SYNTAX")" == "$TAG" ]]; then
    echo "publishing a new release: $TAG"
    [[ "$DRY_RUN" == "false" ]] && npm publish
elif [[ "$(echo "$TAG" | grep -E "$PRERELEASE_SYNTAX")" == "$TAG" ]]; then
    echo "publishing a new pre release: $TAG"
    [[ "$DRY_RUN" == "false" ]] && npm publish --tag next
else
    echo "error: the tag $TAG is not in one of the valid format"
    exit 1
fi
