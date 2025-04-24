FROM node:23

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV CLIENT_ID=your_client_id

CMD ["npm", "start"]