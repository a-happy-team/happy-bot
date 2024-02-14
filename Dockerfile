FROM node:20-alpine3.19 as base

WORKDIR /app
RUN apk add --update --no-cache python3 bash ffmpeg build-base g++ make

FROM base as build

WORKDIR /app
COPY package.json package-lock.json /app
RUN npm install
COPY . /app
RUN npm run build

FROM base as release

WORKDIR /app
COPY --from=build /app/dist /app/dist
COPY package.json package-lock.json /app
RUN npm install --production

CMD ["npm", "start"]
