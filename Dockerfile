FROM node:8-alpine
WORKDIR /app
RUN apk update && apk add unzip curl
COPY . /app
RUN npm install --only=production && sh scripts/post-install.sh
EXPOSE 3000
CMD [ "node", "app.js" ]
