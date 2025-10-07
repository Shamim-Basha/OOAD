# Rental System Debug Info

## API Contract vs Entity Structure

### Current Implementation

We've updated the internal entity structure while maintaining backward compatibility with the existing API contracts. Here's how it works:

1. **Frontend API**: The frontend sends requests with `rentalId` referring to the tool ID
2. **Backend Entity**: Our RentalCart entity uses `toolId` internally 
3. **Backend DTOs**: We maintain the `rentalId` field in DTOs for API compatibility

### Field Mappings

| Frontend (API) | Backend DTO     | Backend Entity    |
|----------------|-----------------|-------------------|
| rentalId       | rentalId        | toolId            |
| userId         | userId          | userId            |
| quantity       | quantity        | quantity          |
| rentalStart    | rentalStart     | rentalStart       |
| rentalEnd      | rentalEnd       | rentalEnd         |

### Important Notes

1. When creating a RentalCartKey in any service, use:
   ```java
   new RentalCartKey(userId, rentalId)
   ```
   
   Where `rentalId` is the ID of the tool from the request

2. In the getCartByUser method, we've updated the code to use:
   ```java
   dto.setRentalId(rc.getId().getToolId());
   ```

3. In the CartService.addRentalToCart method, we use request.getRentalId() to find the tool, which is semantically correct since the frontend sends the tool ID in the rentalId field

This approach maintains compatibility while clarifying the correct relationships between entities.

## Debugging Checklist

If tools are not being added to the cart, check:

1. Database schema - ensure rental_cart table has the correct column names
2. Request payload - verify the frontend is sending the correct field names
3. Entity relationships - ensure RentalCart.tool is properly mapped to Tool entity
4. Repository methods - ensure they use the correct field names (toolId, not rentalId)

## Future Work

Consider standardizing the naming in a future API version to make the code more maintainable:
- Rename frontend API fields to match entity structure
- Update DTOs to use toolId instead of rentalId
- Update documentation and frontend accordingly