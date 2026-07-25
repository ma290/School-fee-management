# ==========================================
# Stage 1: Build the React Application
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the app (respecting the max memory size we set in package.json)
RUN npm run build

# ==========================================
# Stage 2: Serve with Nginx (Alpine) on Port 8000
# ==========================================
FROM nginx:alpine

# Copy the build output from Stage 1 to Nginx's default public directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace the default Nginx config with a custom one that listens on port 8000
RUN echo -e "server {\n\
    listen 8000;\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html index.htm;\n\
        try_files \$uri \$uri/ /index.html;\n\
    }\n\
}" > /etc/nginx/conf.d/default.conf

# Expose port 8000 for the hosting provider's health check
EXPOSE 8000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
