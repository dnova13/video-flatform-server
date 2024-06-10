# 도커이미지 생성

```
## 개발용
docker build -f Dockerfile.dev -t nodetest ./


## 배포용
docker build -t jun/node ./
```

# 도커 컨테이너 생성 및 실행

```
## foreground
docker run -p 3010:3010 jun/node


## background
docker run -p 3010:3010 --name vi-server -d jun/node

```

# 도커 컨테이너안 상황 보기

```
docker exec -it <도커 컨테이너 아이디/이름> sh
```

## 도커 컴포즈 명령어

-   이미지 없을 경우에만 이미지를 빌드하고 컨테이너 생성 및 실행

```
# foreground
docker-compose up


# background
docker-compose up -d


# file
docker-compose -f <파일이름> up
```

-   이미지 유무 상관없이 모든 이미지를 빌드하고 컨테이너 생성 및 실행

```
docker-compose up --build
```

# volumns 전부 삭제

```
docker volume prune
```

# docker에 불필요 한 데이터 제거 명령어

```
docker system prune -a
```

docker run -p 5050:8080 -v ./uploads/video/:/home/media/hls
