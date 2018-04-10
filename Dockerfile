FROM node:6.2.2

MAINTAINER xx <XX>

RUN mkdir -p /app
<<<<<<< HEAD
RUN npm install -g pm2 node-gyp 
=======
RUN npm install -g pm2 node-gyp
>>>>>>> b5f5ed0bfe96cea3d3325827ca02e6c8cd5a9ab5

WORKDIR /app

ADD . /app

RUN npm install

<<<<<<< HEAD
ENV NODE_ENV production 

EXPOSE 3000 
=======
ENV NODE_ENV production

EXPOSE 3000
>>>>>>> b5f5ed0bfe96cea3d3325827ca02e6c8cd5a9ab5

CMD ["pm2-docker", "bin/www"]
