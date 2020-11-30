FROM node:alpine

# Switch into correct workspace (needed for permissions)
WORKDIR /home/node

# switch to non-root user for security reasons
USER node

WORKDIR /api
COPY package*.json /home/node/
RUN yarn install
COPY . /home/node/
EXPOSE 80
CMD ["yarn", "start"]

HEALTHCHECK --interval=30s \
  CMD curl -f http://localhost:80/ || exit 1