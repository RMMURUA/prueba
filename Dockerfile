FROM node:16-alpine

WORKDIR /usr/src/app
COPY package*.json ./
# COPY cloud_sql_proxy ./
# COPY speaknosis-backend-1fefb34d34bd.json ./

# RUN yarn install --only=production && \
#     chmod +x ./cloud_sql_proxy

RUN yarn install --only=production

COPY . .

USER node

# ENV GOOGLE_APPLICATION_CREDENTIALS=./speaknosis-backend-1fefb34d34bd.json

#CMD ./cloud_sql_proxy --port 8000 speaknosis-backend:us-central1:speaknosis-backend & node src/index.js
CMD node src/index.js



#CMD ./cloud_sql_proxy -instances=speaknosis-backend:us-central1:speaknosis-backend=tcp:8000 & node src/index.js

#EXPOSE ${APP_PORT}
EXPOSE 8080
