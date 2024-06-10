FROM ubuntu:22.04

# nginx 버전 변수 설정
ENV NGINX_VERSION=1.26.1
ENV RTMP_MODULE_VERSION=1.2.1

RUN apt-get update && apt-get install -y \
    build-essential \
    libpcre3 \
    libpcre3-dev \
    libssl-dev \
    zlib1g \
    zlib1g-dev \
    wget \
    git \
    vim \
    && rm -rf /var/lib/apt/lists/*

# Nginx 및 RTMP 모듈 소스 다운로드 및 컴파일
RUN mkdir -p /usr/local/src \
    && cd /usr/local/src \
    && wget http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz \
    && git clone https://github.com/sergey-dryabzhinsky/nginx-rtmp-module.git \
    && tar -zxvf nginx-${NGINX_VERSION}.tar.gz \
    && rm -f *.tar.gz \
    && cd nginx-${NGINX_VERSION} \
    && ./configure --with-http_ssl_module --add-module=../nginx-rtmp-module \
    && make \
    && make install


COPY nginx.conf /usr/local/nginx/conf/nginx.conf

# foreground nginx 실행
CMD ["/usr/local/nginx/sbin/nginx", "-g", "daemon off;"]