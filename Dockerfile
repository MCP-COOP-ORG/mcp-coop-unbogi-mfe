FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

# Copy workspace root + shared + tma + contracts package files for install
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/tma/package.json ./packages/tma/
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/shared/ ./packages/shared/
COPY packages/contracts/ ./packages/contracts/
COPY packages/tma/ ./packages/tma/

# Build args for Firebase env
ARG UNBOGI_FIREBASE_API_KEY
ARG UNBOGI_FIREBASE_AUTH_DOMAIN
ARG UNBOGI_FIREBASE_PROJECT_ID
ARG UNBOGI_FIREBASE_STORAGE_BUCKET
ARG UNBOGI_FIREBASE_MESSAGING_SENDER_ID
ARG UNBOGI_FIREBASE_APP_ID
ENV UNBOGI_FIREBASE_API_KEY=$UNBOGI_FIREBASE_API_KEY
ENV UNBOGI_FIREBASE_AUTH_DOMAIN=$UNBOGI_FIREBASE_AUTH_DOMAIN
ENV UNBOGI_FIREBASE_PROJECT_ID=$UNBOGI_FIREBASE_PROJECT_ID
ENV UNBOGI_FIREBASE_STORAGE_BUCKET=$UNBOGI_FIREBASE_STORAGE_BUCKET
ENV UNBOGI_FIREBASE_MESSAGING_SENDER_ID=$UNBOGI_FIREBASE_MESSAGING_SENDER_ID
ENV UNBOGI_FIREBASE_APP_ID=$UNBOGI_FIREBASE_APP_ID

RUN pnpm --filter @unbogi/contracts build
RUN pnpm --filter @unbogi/tma build

# Production
FROM nginx:alpine AS production
COPY packages/tma/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=base /app/packages/tma/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
