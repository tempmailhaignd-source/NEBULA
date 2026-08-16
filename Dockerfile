FROM node:18-slim

# Install Python
RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/
COPY ai/requirements.txt ./ai/

# Install root dependencies
RUN npm install

# Install server dependencies
WORKDIR /app/server
RUN npm install

# Install client dependencies and build
WORKDIR /app/client
RUN npm install
RUN npm run build

# Install AI dependencies
WORKDIR /app/ai
RUN pip3 install -r requirements.txt

# Copy all source code
WORKDIR /app
COPY . .

# Expose ports
EXPOSE 8080
EXPOSE 5000
EXPOSE 3000

# Start command
CMD ["sh", "-c", "node server/server.js & python3 ai/model.py & npm run preview --prefix client -- --host 0.0.0.0 --port 3000"]
