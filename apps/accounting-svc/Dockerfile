###############################################################################
#  Stage 1 — development (hot-reload with nodemon)                            #
###############################################################################
FROM node:20-alpine AS development

WORKDIR /app

# Install all deps for live reload / TypeORM CLI
COPY package*.json ./
RUN yarn install

# Copy service code
COPY . .

ENV NODE_ENV=development \
    PORT=4100

# `yarn dev` should be defined in package.json as: nodemon src/main.js
CMD ["yarn", "dev"]

###############################################################################
#  Stage 2 — build (prunes devDeps, runs any build step)                      #
###############################################################################
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN yarn install --production           # only prod deps

COPY . .

# If you ever compile TS or run a build step, do it here.
# For pure JS/TypeORM nothing else is required, but we keep the stage
# for symmetry and potential future transpile.
# RUN yarn build

###############################################################################
#  Stage 3 — production (slim, no dev tooling)                                #
###############################################################################
FROM node:20-slim AS production

WORKDIR /app

# Copy the pruned install + source
COPY --from=build /app ./

ENV NODE_ENV=production \
    PORT=4100

EXPOSE 4100

CMD ["node", "src/main.js"]