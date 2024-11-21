# Use Node.js as the base image
FROM node:18-alpine

# Install MySQL client for wait-for-it.sh
RUN apk add --no-cache mysql-client

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Add a wait-for-it script for database readiness
COPY wait-for-it.sh /usr/bin/
RUN chmod +x /usr/bin/wait-for-it.sh

# Expose the application port
EXPOSE 8001

# Run seeder and start the application
CMD ["sh", "-c", "wait-for-it.sh mysql -- npm run seed && npm run start:prod"]
