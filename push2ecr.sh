#!/usr/bin/env sh
set -e
#set -x

echo "docker login to aws erc"
$(aws ecr get-login --no-include-email --region us-east-1)

ECRREPO=376953470933.dkr.ecr.us-east-1.amazonaws.com
IMAGE=puppeteer

if [ -z "$IMG_TAG" ] ; then
    echo "IMG_TAG not configured"
    exit 2
fi

echo "building and publish $ECRREPO/$IMAGE:$IMG_TAG ..."

docker build -t $IMAGE:$IMG_TAG .

echo "push $ECRREPO/$IMAGE:$IMG_TAG"
docker tag $IMAGE:$IMG_TAG $ECRREPO/$IMAGE:$IMG_TAG
docker push $ECRREPO/$IMAGE:$IMG_TAG