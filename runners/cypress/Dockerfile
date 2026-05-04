FROM cypress/included:13.17.0
WORKDIR /tests
COPY package.json ./
RUN npm install --omit=dev
COPY cypress ./cypress
COPY cypress.config.ts ./
COPY run.sh ./run.sh
RUN chmod +x run.sh
ENV SIMULATE_FAILURE=true
ENTRYPOINT ["./run.sh"]
