FROM node:20-alpine
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY src ./src
ENV SQLITE_DATA_DIR=/app/data
ENV PORT=3001
EXPOSE 3001
CMD ["node", "src/index.js"]
