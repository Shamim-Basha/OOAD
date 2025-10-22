# =============================
# 1️⃣ Build Stage
# =============================
FROM eclipse-temurin:24-jdk AS build

WORKDIR /app

# Copy Maven wrapper and project files first
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# ✅ Force permission change explicitly before use
RUN chmod +x mvnw

# Pre-fetch dependencies (for cache)
RUN ./mvnw dependency:go-offline -B || mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN ./mvnw clean package -DskipTests || mvn clean package -DskipTests


# =============================
# 2️⃣ Runtime Stage
# =============================
FROM eclipse-temurin:24-jre

WORKDIR /app

# Copy built JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the default Spring Boot port
EXPOSE 8080

# Run the app
ENTRYPOINT ["java", "-jar", "app.jar"]
