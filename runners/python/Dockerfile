FROM python:3.12-slim
WORKDIR /tests
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY tests ./tests
COPY run.sh ./run.sh
RUN chmod +x run.sh
ENV SIMULATE_FAILURE=true
ENTRYPOINT ["./run.sh"]
