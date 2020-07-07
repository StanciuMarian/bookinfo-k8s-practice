FROM maven:3.6.3-jdk-8-slim as build
WORKDIR /usr/src/bookinfo-ratings
COPY pom.xml ./
RUN mvn dependency:go-offline
COPY ./src ./src
RUN mvn clean install -DskipTests


FROM openjdk:8-jre-alpine as PROD
WORKDIR /usr/bin/bookinfo-ratings
COPY --from=build /usr/src/bookinfo-ratings/target/bookinfo-ratings-0.0.1-SNAPSHOT.jar .

FROM PROD as DEV 
CMD ["java", "-jar", "bookinfo-ratings-0.0.1-SNAPSHOT.jar" ]

FROM PROD
CMD ["java", "-jar", "bookinfo-ratings-0.0.1-SNAPSHOT.jar" ]