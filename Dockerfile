# Multi-stage build: build React app, then serve with nginx + node API
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
# Install nginx
RUN apk add --no-cache nginx

# Copy built frontend
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/http.d/default.conf

# Copy API server
COPY server.js /app/server.js
COPY package.json /app/package.json

# Install only production deps for express
WORKDIR /app
RUN npm install --omit=dev express

# Create data directory
RUN mkdir -p /app/data

# Copy entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80
CMD ["/entrypoint.sh"]
