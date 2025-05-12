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
RUN npm run build

# Stage 2: Serve với Nginx
FROM nginx:alpine

# Copy frontend build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx.conf (đã chỉnh sửa cho production)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (nginx sẽ listen 80 or 443 tùy file config)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
