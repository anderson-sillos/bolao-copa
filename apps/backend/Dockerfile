FROM node:24.18.0-bookworm-slim AS dependencies

WORKDIR /app
COPY package.json package-lock.json ./
COPY .husky/install.mjs .husky/install.mjs
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
RUN npm ci

FROM dependencies AS build

COPY . .
RUN npm run build --workspace=backend

FROM node:24.18.0-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY .husky/install.mjs .husky/install.mjs
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
RUN npm ci --omit=dev

COPY --from=build /app/apps/backend/dist apps/backend/dist

EXPOSE 3000
CMD ["node", "apps/backend/dist/main.js"]
