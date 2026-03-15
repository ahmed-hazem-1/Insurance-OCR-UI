FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
ARG GEMINI_API_KEY
ARG OCR_API_KEY
ARG VITE_APP_URL

ENV GEMINI_API_KEY=$GEMINI_API_KEY
ENV OCR_API_KEY=$OCR_API_KEY
ENV VITE_APP_URL=$VITE_APP_URL

RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/vite.config.ts ./vite.config.ts
COPY --from=builder /app/package*.json ./

# Install dependencies (including tsx for running server.ts)
RUN npm install

# Set node environment to production
ENV NODE_ENV=production
# Default port (Cloud Run sets this to 8080)
ENV PORT=8080

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 8080) + '/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application using tsx to run server.ts
# Alternatively, we could compile server.ts to JS, but tsx works fine for this case
CMD ["npx", "tsx", "server.ts"]
