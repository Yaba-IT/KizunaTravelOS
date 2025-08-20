###############################################################################
#  Stage 1 — development (hot-reload with Vite)                                #
###############################################################################
FROM node:20-slim AS development
WORKDIR /app

# Dependencies for Vite + React Fast-Refresh
COPY package*.json yarn.lock ./
RUN yarn install

COPY . .
ENV NODE_ENV=development
EXPOSE 5173
CMD ["yarn", "dev", "--host"] 

###############################################################################
#  Stage 2 — build (static site generation)                                    #
###############################################################################
FROM node:20-slim AS build
WORKDIR /app

COPY . .
RUN yarn install
RUN yarn build 

###############################################################################
#  Stage 3 — production (Nginx, no dev tooling)                                #
###############################################################################
FROM nginx:alpine AS production
WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist ./
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]