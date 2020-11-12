FROM alpine:3.12

LABEL maintainer="alexwith"

# Setup Python 3
RUN apk add python3

# Setup Java 8
RUN apk --update add openjdk8
ENV JAVA_HOME=/usr/lib/jvm/java-1.8-openjdk
ENV PATH="$JAVA_HOME/bin:${PATH}"

# Setup c++
RUN apk add g++ 

# Setup C
RUN apk add gcc

# Steup GoLang
RUN apk --update add go
ENV GOROOT=/usr/lib/go
ENV GOPATH=/go
ENV PATH=/go/bin/:$PATH

RUN mkdir -p ${GOPATH}/src ${GOPATH}/bin