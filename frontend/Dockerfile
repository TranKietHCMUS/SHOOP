# Stage 1: Build Vite app
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build app (output sẽ nằm trong dist/)
RUN npm run build

# Stage 2: Serve với Nginx
FROM nginx:alpine

# Copy dist vào nginx html
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
