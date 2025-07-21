FROM node:24-alpine AS builder

WORKDIR /app

# Disable Husky hooks in CI or Docker
ENV HUSKY=0

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the app
COPY . .

# Build the Next.js app
RUN npm run build


FROM node:24-alpine AS runner

WORKDIR /app

# Only copy the build output and necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Next.js uses this port in production
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Run the Next.js app
CMD ["npm", "start"]
