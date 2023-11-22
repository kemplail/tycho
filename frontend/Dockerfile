FROM node:14.19.0 as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ARG REACT_APP_API=/api
ENV REACT_APP_API=$REACT_APP_API

RUN npm run build

FROM nginx:stable-alpine
COPY --from=build app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]