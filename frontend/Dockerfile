FROM node:22.15.0

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build
CMD ["pnpm", "start", "--port", "8080"]