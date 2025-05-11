# Stage 1: Build Vite app
FROM node:18-alpine AS builder

ARG VITE_API_URL
ARG VITE_APP_NAME
ARG VITE_GOOGLE_MAPS_API_KEY

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_APP_NAME=${VITE_APP_NAME}
ENV VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY}

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

# Copy file cấu hình nginx tùy chỉnh
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Đặt biến môi trường mặc định cho PORT
ENV PORT=80

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
