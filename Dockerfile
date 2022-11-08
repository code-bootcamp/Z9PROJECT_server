FROM node:16-alpine

WORKDIR /zero9/
COPY ./package.json ./yarn.lock /zero9/
RUN yarn install

COPY . /zero9/

CMD yarn start:dev