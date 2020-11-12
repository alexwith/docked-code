FROM alpine:3.12

LABEL maintainer="alexwith"

RUN apk add python3

RUN apk --update add openjdk8
ENV JAVA_HOME=/usr/lib/jvm/java-1.8-openjdk
ENV PATH="$JAVA_HOME/bin:${PATH}"