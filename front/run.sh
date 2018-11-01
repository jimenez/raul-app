#!/bin/sh

docker build -t raul-app .
docker run -it   -v ${PWD}:/usr/src/app   -v /usr/src/app/node_modules   -p 3000:3000   --rm raul-app
