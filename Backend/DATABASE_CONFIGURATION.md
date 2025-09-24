# Database Configuration Guide

## Hibernate DDL Auto Configuration

### Current Setting: `spring.jpa.hibernate.ddl-auto=update`

**⚠️ IMPORTANT: This setting is configured for DEVELOPMENT ONLY!**

### What `update` does:
- Automatically creates tables if they don't exist
- Adds new columns if entity fields are added
- **DOES NOT** delete columns or tables if entity fields are removed
- **DOES NOT** modify existing column types or constraints
- Updates the database schema to match your JPA entities

### Why it's risky in production:

1. **Data Loss Risk**: While `update` doesn't drop columns, schema changes can still cause issues
2. **Performance Impact**: Schema modifications can lock tables during updates
3. **Unpredictable Behavior**: Automatic schema changes can lead to inconsistent environments
4. **Security Concerns**: Database structure changes without proper review

### Recommended Production Settings:

#### Option 1: `validate` (Recommended)
```properties
spring.jpa.hibernate.ddl-auto=validate
```
- Validates that the database schema matches your entities
- Fails fast if there's a mismatch
- No automatic schema changes
- Requires manual migrations

#### Option 2: `none` (Most Secure)
```properties
spring.jpa.hibernate.ddl-auto=none
```
- No automatic schema management
- Full control over database changes
- Requires explicit migrations

### Migration Strategy for Production:

#### 1. Use Flyway or Liquibase for Schema Migrations
```xml
<!-- Add to pom.xml -->
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
```

#### 2. Create Migration Scripts
```sql
-- V1__Create_initial_tables.sql
CREATE TABLE tools (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    daily_rate DECIMAL(10,2) NOT NULL,
    category VARCHAR(255) NOT NULL,
    available BOOLEAN NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 1,
    description TEXT,
    image_url VARCHAR(500)
);

CREATE TABLE rentals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    tool_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    total_cost DECIMAL(10,2) NOT NULL
);
```

### Environment-Specific Configuration:

#### Development (application-dev.properties)
```properties
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

#### Production (application-prod.properties)
```properties
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
```

### Best Practices:

1. **Always use environment variables** for database credentials
2. **Test schema changes** in development first
3. **Use version control** for migration scripts
4. **Backup before migrations** in production
5. **Monitor performance** after schema changes

### Current Environment Variables:

The application now uses environment variables for database configuration:

```bash
# Required environment variables
DB_URL=jdbc:mysql://localhost:3306/hardware_store?createDatabaseIfNotExist=true
DB_USERNAME=root
DB_PASSWORD=your_secure_password
DDL_AUTO=update  # Change to 'validate' for production
```

### Switching to Production:

1. Set `DDL_AUTO=validate` in your environment
2. Ensure your database schema matches your entities
3. Implement proper migration strategy
4. Test thoroughly in staging environment

### Monitoring:

Consider adding database monitoring to track:
- Schema change frequency
- Performance impact of DDL operations
- Failed validation attempts

---

**Remember**: The current `update` setting is convenient for development but should never be used in production without proper migration strategy and testing.
