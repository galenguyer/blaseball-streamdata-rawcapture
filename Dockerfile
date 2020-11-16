FROM node:12.16.2-alpine

WORKDIR /app

ADD package.json yarn.lock ./

RUN yarn install

ADD . .

EXPOSE 8081
CMD ["node", "index.js"]
