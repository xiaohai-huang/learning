FROM node:16

ENV NODE_ENV=production
# Node process management
RUN npm install pm2@latest -g

# Client
WORKDIR /app/client
COPY /client/package.json .
COPY /client/yarn.lock .
RUN yarn --production

# Server
WORKDIR /app/server
COPY /server/package.json .
COPY /server/yarn.lock .
RUN yarn --production

# Copy source code
WORKDIR /app/client
COPY ./client .
RUN yarn build

WORKDIR /app/server
COPY ./server .

ENV PORT=3000
EXPOSE $PORT

CMD [ "yarn", "start" ]