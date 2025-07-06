###############################################################################
#  Stage 1 — development (hot-reload with nodemon)                             #
###############################################################################
FROM node:20-slim AS development
WORKDIR /app

# Install ALL dependencies for live reload and linting
COPY package*.json ./
RUN yarn install

# Project source
COPY . .

ENV NODE_ENV=development
EXPOSE 4000
CMD ["yarn", "dev"]            


###############################################################################
#  Stage 2 — build (prunes devDeps, optional transpile)                        #
###############################################################################
FROM node:20-slim AS build
WORKDIR /app

COPY package*.json ./
RUN yarn install --production    # prod-only deps

COPY . .
# If you ever transpile or seed DB, do it here
# RUN yarn build


###############################################################################
#  Stage 3 — production (slim runtime, no dev tooling)                         #
###############################################################################
FROM node:20-slim AS production
WORKDIR /app

COPY --from=build /app ./

ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "src/index.js"]