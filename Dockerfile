# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy package dependencies
COPY package*.json ./
RUN npm ci

# Copy all source files and compile the production build
COPY . .
RUN npm run build

# Serve stage using lightweight Nginx server
FROM nginx:1.25-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration to support Single Page Application (SPA) routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
