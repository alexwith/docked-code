FROM alpine:3.12

LABEL maintainer="alexwith"

RUN apk add yarn
RUN apk add nodejs

# Setup Python 3
RUN apk add python3

# Setup Java 8 - all .java include in trail
RUN apk --update add openjdk8
ENV JAVA_HOME=/usr/lib/jvm/java-1.8-openjdk
ENV PATH="$JAVA_HOME/bin:${PATH}"

# Setup C++ - all .cpp include in trail
RUN apk add g++ 

# Setup C - all .c include in trail
RUN apk add gcc

# Setup TypeScript
RUN yarn global add typescript
RUN yarn global add ts-node