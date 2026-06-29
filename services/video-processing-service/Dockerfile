FROM node:20-alpine

# Install FFmpeg required for video processing
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Copy root package files to utilize npm workspaces
COPY package.json package-lock.json ./

# Copy shared workspace
COPY shared ./shared/

# Copy the target service
COPY services/video-processing-service ./services/video-processing-service/

# Install dependencies
RUN npm ci

# Set the working directory context to the service
WORKDIR /app/services/video-processing-service

# Run the start script from the service context
CMD ["npm", "start"]
