FROM mcr.microsoft.com/playwright:v1.49.0-jammy
WORKDIR /tests
COPY package.json ./
RUN npm install --omit=dev
COPY tests ./tests
COPY run.sh ./run.sh
RUN chmod +x run.sh
ENV SIMULATE_FAILURE=true
ENTRYPOINT ["./run.sh"]
