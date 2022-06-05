
FROM node:18

RUN mkdir -p /app && chown -R node:node /app
WORKDIR /app

COPY package*.json ./

RUN npm install -g npm@latest
RUN npm install

USER node
VOLUME /app/data

COPY --chown=node:node . .

EXPOSE 3000
CMD [ "npm", "run", "watch" ]
