FROM node:6.2.2

MAINTAINER xx <XX>

RUN mkdir -p /app
RUN npm install -g pm2 node-gyp 

WORKDIR /app

ADD . /app

RUN npm install

ENV NODE_ENV production 

EXPOSE 3000 

CMD ["pm2-docker", "bin/www"]
