FROM node:18-slim

WORKDIR /app

COPY . .

RUN npm install
RUN cd client && npm install
RUN cd client && npx vite build

EXPOSE 3000

CMD ["sh", "-c", "cd client && npx vite preview --host 0.0.0.0 --port 3000"]
