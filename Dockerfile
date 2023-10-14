ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine
LABEL authors="emonq"
ENV NODE_ENV=production
COPY . /app
WORKDIR /app
RUN npm install
EXPOSE 3000
CMD npm start