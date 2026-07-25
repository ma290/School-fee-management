# ==========================================
# Stage 2: Serve with Nginx (Alpine)
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

# Expose port 8000
EXPOSE 8000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
