FROM node:20-alpine

WORKDIR /app

# Copy root package files to utilize npm workspaces
COPY package.json package-lock.json ./

# Copy shared workspace
COPY shared ./shared/

# Copy the target service
COPY services/video-upload-service ./services/video-upload-service/

# Install dependencies (workspaces will automatically resolve and link)
RUN npm ci

# Set the working directory context to the service
WORKDIR /app/services/video-upload-service

EXPOSE 5001

# Run the start script from the service context
CMD ["npm", "start"]
