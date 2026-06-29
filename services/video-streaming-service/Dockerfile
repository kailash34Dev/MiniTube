FROM node:20-alpine

WORKDIR /app

# Copy root package files to utilize npm workspaces
COPY package.json package-lock.json ./

# Copy shared workspace
COPY shared ./shared/

# Copy the target service
COPY services/video-streaming-service ./services/video-streaming-service/

# Install dependencies
RUN npm ci

# Set the working directory context to the service
WORKDIR /app/services/video-streaming-service

EXPOSE 5002

# Run the start script from the service context
CMD ["npm", "start"]
