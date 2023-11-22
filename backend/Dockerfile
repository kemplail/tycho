FROM node:14.19.0
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
RUN npm run build
CMD ["npm","run","start:prod"]