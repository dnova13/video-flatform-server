FROM node:16.20.0-alpine

WORKDIR /app/project

COPY ./package.json ./

RUN npm install

# node_modules 폴더를 제외 하기위해 카피 두번함.
## 도커 이미지에서 로컬에서 같은 폴더가 있을 경우 해당 폴더를 덮어 씌우지 않음.
COPY . .

## babel build
RUN npm run build


## pm2 설치
RUN npm install -g pm2

## 포트 설정
EXPOSE 3010

CMD ["pm2-runtime", "start", "npm", "--","start"]

