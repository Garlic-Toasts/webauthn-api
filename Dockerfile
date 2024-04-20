FROM node:20-alpine as build
WORKDIR /app
ADD *.json .
RUN npm ci
ADD . .
RUN npm run prisma:generate
RUN npm run build

FROM node:20-alpine as deploy
ENV DATABASE_URL ${DATABASE_URL}
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
ADD *.json .
CMD sh -c "npm run prisma:push && node dist/main.js"