# Build Stage
FROM node:20-alpine AS build
WORKDIR /src
COPY . .
RUN npm install
RUN npm run build

# Runtime Stage
FROM node:20-alpine
WORKDIR /src
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

COPY --from=build /src/public ./public
COPY --from=build /src/.next/standalone ./
COPY --from=build /src/.next/static ./.next/static

CMD ["node", "server.js"]
