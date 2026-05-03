FROM node:20-slim
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY server/package*.json ./
RUN npm install
COPY server/src ./src
COPY server/tsconfig.json ./
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
