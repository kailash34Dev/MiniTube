FROM node:20-alpine

WORKDIR /app

# Copy the monorepo root package.json and package-lock.json
COPY package.json package-lock.json* ./

# Copy the shared package
COPY shared/ ./shared/

# Copy the interaction-service package.json
COPY services/interaction-service/package.json ./services/interaction-service/

# Install dependencies for the monorepo
RUN npm install

# Copy the rest of the interaction-service code
COPY services/interaction-service/ ./services/interaction-service/

WORKDIR /app/services/interaction-service

EXPOSE 5003

CMD ["npm", "start"]
