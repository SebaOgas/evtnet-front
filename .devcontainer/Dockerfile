FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

WORKDIR /app

#RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json .
COPY package-lock.json .

#RUN npm install --verbose

COPY . .

CMD ["npm", "run", "dev"]