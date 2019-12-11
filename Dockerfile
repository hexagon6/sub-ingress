FROM node:13.2

WORKDIR /server
ADD . ./
RUN npm ci
CMD node index.mjs
