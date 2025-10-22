# =============================
# 1️⃣ Build Stage
# =============================
FROM eclipse-temurin:24-jdk AS build

# Set working directory
WORKDIR /app

# Copy Maven wrapper and project files
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Make mvnw executable (important if pushed from Windows)
RUN chmod +x mvnw

# Download dependencies (cache layer)
RUN ./mvnw dependency:go-offline -B

# Copy source and build the jar
COPY src ./src
RUN ./mvnw clean package -DskipTests

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
