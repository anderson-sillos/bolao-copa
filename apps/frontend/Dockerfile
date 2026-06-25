FROM node:24.18.0-bookworm-slim AS dependencies

WORKDIR /app
COPY package.json package-lock.json ./
COPY .husky/install.mjs .husky/install.mjs
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
RUN npm ci

FROM dependencies AS build

ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY . .
RUN npm run build --workspace=frontend

FROM node:24.18.0-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

COPY package.json package-lock.json ./
COPY .husky/install.mjs .husky/install.mjs
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
RUN npm ci --omit=dev

COPY --from=build /app/apps/frontend/.next apps/frontend/.next
COPY --from=build /app/apps/frontend/next-env.d.ts apps/frontend/next-env.d.ts

EXPOSE 3001
CMD ["npm", "run", "start", "--workspace=frontend", "--", "-p", "3001"]
