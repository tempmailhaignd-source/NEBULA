FROM node:18-slim

RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /app

COPY . .

RUN npm install --prefix server
RUN npm install --prefix client
RUN npm run build --prefix client
RUN pip3 install -r ai/requirements.txt

EXPOSE 8080 5000 3000

CMD ["sh", "-c", "node server/server.js & python3 ai/model.py & npm run preview --prefix client -- --host 0.0.0.0 --port 3000"]
