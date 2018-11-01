FROM node:9.6.1

RUN mkdir /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/package.json

# add `/node_modules/.bin` to $PATH
ENV PATH usr/src/app/node_modules/.bin:$PATH

COPY package.json /usr/src/app/package.json

# install and cache app dependencies
RUN npm install --silent

COPY . /usr/src/app

# start app
CMD ["npm", "start"]