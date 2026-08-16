FROM node:18-slim

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create and activate virtual environment
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"
ENV VIRTUAL_ENV="/app/venv"

COPY . .

# Install dependencies
RUN npm install --prefix server
RUN npm install --prefix client
RUN npm run build --prefix client
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r ai/requirements.txt

# Verify installations
RUN pip list

EXPOSE 8080 5000 3000

CMD ["sh", "-c", "source /app/venv/bin/activate && node server/server.js & python3 ai/model.py & npm run preview --prefix client -- --host 0.0.0.0 --port 3000"]
