# Multi-stage build for TB Adherence App
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy root package files
COPY package*.json ./

# Install root dependencies
RUN npm ci --only=production

# Build client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Build server
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine AS production

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy built client
COPY --from=builder --chown=nodejs:nodejs /app/client/build ./client/build

# Copy server files
COPY --from=builder --chown=nodejs:nodejs /app/server ./server
COPY --chown=nodejs:nodejs server/ ./server/

# Install serve to serve static files
RUN npm install -g serve

# Create startup script
RUN echo '#!/bin/sh\n\
if [ "$NODE_ENV" = "production" ]; then\n\
  cd /app/server && node server.js &\n\
  serve -s /app/client/build -l 3000\n\
else\n\
  cd /app/server && npm run dev\n\
fi' > /app/start.sh

RUN chmod +x /app/start.sh

# Switch to nodejs user
USER nodejs

# Expose ports
EXPOSE 3000 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["/app/start.sh"]