FROM node:14-slim as builder
WORKDIR '/usr/src/bookinfo'
COPY package*.json ./
RUN npm install
COPY . .

FROM builder as dev
CMD ["npm", "run", "start"]

FROM builder as prod-builder
RUN npm run build

FROM nginx:1.17.10-alpine as prod-without-config
COPY --from=prod-builder /usr/src/bookinfo/dist/bookinfo-ui /usr/share/nginx/html

FROM prod-without-config as prod
COPY nginx.conf /etc/nginx/conf.d/default.conf
