FROM python:3.11-slim

WORKDIR /app

COPY . /app

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir fastapi uvicorn[standard] mistralai python-dotenv pydantic

EXPOSE 8000

CMD ["uvicorn", "mistral_test:app", "--host", "0.0.0.0", "--port", "8000"]
