FROM node:20-alpine

WORKDIR /app

# Copy the monorepo root package.json and package-lock.json (if it exists)
COPY package.json package-lock.json* ./

# Copy the shared package first
COPY shared/ ./shared/

# Copy the user-service package.json
COPY services/user-service/package.json ./services/user-service/

# Install dependencies for the monorepo
RUN npm install

# Copy the rest of the user-service code
COPY services/user-service/ ./services/user-service/

WORKDIR /app/services/user-service

EXPOSE 3003

CMD ["npm", "start"]
