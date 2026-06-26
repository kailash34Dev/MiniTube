FROM node:20-slim

# Install FFmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code
COPY . .

# Environment variables should be passed at runtime
# ENV AWS_REGION=...
# ENV AWS_S3_BUCKET_NAME=...
# ENV SQS_QUEUE_URL=...
# ENV DATABASE_URL=...

# Start the worker
CMD ["npm", "start"]
