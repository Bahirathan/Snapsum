# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install all dependencies (including devDependencies required for the build process)
RUN npm install

# Copy all application files
COPY . .

# Set environment for production build
ENV NODE_ENV=production

# Compile React frontend and Express server
RUN npm run build

# Stage 2: Production execution stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package manifests for runtime
COPY package*.json ./

# Install only production-needed dependencies to reduce image size
RUN npm install --omit=dev

# Copy compiled application assets and server from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/firebase-applet-config.json* ./

# Default runtime port (can be overridden by GCP runtime environment variable)
EXPOSE 3000

# Set Node environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the compiled self-contained server
CMD ["node", "dist/server.cjs"]
