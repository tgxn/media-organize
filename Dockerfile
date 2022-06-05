
FROM node:18

RUN mkdir -p /app && chown -R node:node /app
WORKDIR /app

COPY package*.json ./
COPY --chown=node:node . .

RUN npm install

USER node
VOLUME /app/data
EXPOSE 3000

CMD [ "npm", "run", "watch" ]
