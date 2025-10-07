# Rental System Workflow

## Overview
The rental system in our Hardware Store application follows a clear three-step process:

1. **Tool Selection**: Users browse available tools in the services/tools section
2. **Rental Cart**: Selected tools are added to the rental cart with desired dates and quantities
3. **Confirmed Rentals**: After checkout and payment, tools move from cart to active rentals

## Technical Implementation

### Tool Entity
- Represents available tools for rental
- Contains information like name, daily rate, stock quantity, etc.
- Used to display available tools to users

### Rental Cart Entity
- Temporarily stores tools that a user wants to rent
- Contains rental dates, quantity, and calculated cost
- Links directly to the Tool entity

### Rental Entity
- Created only after successful checkout
- Represents an active rental with confirmed payment
- Contains start/end dates, quantity, and status (ACTIVE or RETURNED)
- Created from Rental Cart items during checkout

## Database Schema
- **tools**: Contains all available tools for rent
- **rental_cart**: Temporary storage for tools pending checkout 
- **rentals**: Active rentals after successful checkout

## Workflow in Detail
1. User selects a tool and adds it to cart (with dates and quantity)
2. Backend adds entry to rental_cart table
3. Upon checkout and successful payment:
   - Records from rental_cart are used to create entries in rentals table
   - Tool inventory is updated to reflect reduced stock
   - Rental_cart items are removed

This implementation ensures proper tracking of rental inventory while providing a seamless experience for users.