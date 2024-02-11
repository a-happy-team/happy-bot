FROM node:20-alpine3.19

WORKDIR /app

RUN apk add --update --no-cache python3 bash ffmpeg build-base g++ make

COPY package.json /app

RUN npm install

COPY . /app

CMD ["npm", "start"]
