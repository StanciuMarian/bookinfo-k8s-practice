FROM node:14-slim as builder
WORKDIR '/usr/src/bookinfo-details'
COPY package*.json ./
RUN npm install
COPY . .

FROM builder as dev
RUN npm install -g nodemon
CMD ["nodemon", "index.js"]

FROM builder as prod
CMD ["npm", "run", "start"]