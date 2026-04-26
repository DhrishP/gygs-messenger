FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Run daphne server
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "messenger_backend.asgi:application"]
