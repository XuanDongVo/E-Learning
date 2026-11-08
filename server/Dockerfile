# syntax=docker/dockerfile:1
# Build context: server/
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml ./
# Keep dependency resolution cacheable when source files change.
RUN mvn -B -ntp dependency:go-offline
COPY src ./src
# Compile and package a Spring Boot executable JAR. Test execution is a separate CI step.
RUN mvn -B -ntp -DskipTests package \
    && cp target/server-*.jar /app/app.jar

FROM eclipse-temurin:21-jre-jammy AS runner
WORKDIR /app
RUN groupadd --system app \
    && useradd --system --gid app --home-dir /app app
COPY --from=builder --chown=app:app /app/app.jar /app/app.jar
ENV SPRING_PROFILES_ACTIVE=prod
USER app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
