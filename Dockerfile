FROM node:15

WORKDIR /usr/src/app

COPY backend/package*.json ./

RUN npm install

COPY backend .

CMD [ "npm", "start" ]