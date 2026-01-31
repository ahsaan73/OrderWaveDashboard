-- ### USERS TABLE ###
-- This table stores information about the users who can access the system.

-- First, create an ENUM type for the user roles to ensure data consistency.
CREATE TYPE user_role AS ENUM ('Admin', 'Manager', 'Cashier', 'Waiter');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    password VARCHAR(255) NOT NULL -- In a real application, this should be a hashed password.
);

-- ### INVENTORY TABLE ###
-- This table tracks the current stock of all ingredients.

-- Create an ENUM type for the units of measurement.
CREATE TYPE inventory_unit AS ENUM ('kg', 'liters', 'units');

CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL UNIQUE,
    current_quantity FLOAT NOT NULL,
    unit inventory_unit NOT NULL,
    reorder_level FLOAT NOT NULL,
    CHECK (current_quantity >= 0), -- Ensure quantity is not negative
    CHECK (reorder_level >= 0)      -- Ensure reorder level is not negative
);

-- ### INVENTORY LOGS TABLE ###
-- This table creates an audit trail for every change made to the inventory.
CREATE TABLE inventory_logs (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES inventory(id) ON DELETE CASCADE,
    changed_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    old_quantity FLOAT NOT NULL,
    new_quantity FLOAT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);


-- ### SALES TABLE ###
-- This table records every sale made.

-- Create an ENUM type for the payment methods.
CREATE TYPE payment_method AS ENUM ('Cash', 'Card');

CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method payment_method NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ### TRIGGER FOR INVENTORY LOGS ###
-- This function and trigger will automatically add a log entry whenever
-- the 'current_quantity' in the 'inventory' table is updated.

CREATE OR REPLACE FUNCTION log_inventory_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Note: In a real-world scenario, you would get the user ID from the
    -- application context (e.g., through a session variable) rather than
    -- hardcoding or leaving it NULL. For this example, we'll assume the
    -- application layer will handle passing the user ID. We insert NULL
    -- as a placeholder for 'changed_by_user_id'. The application would
    -- need a mechanism to set this appropriately.
    INSERT INTO inventory_logs(item_id, changed_by_user_id, old_quantity, new_quantity)
    VALUES(NEW.id, NULL, OLD.current_quantity, NEW.current_quantity);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger that executes the function after an update on the inventory table.
CREATE TRIGGER inventory_update_trigger
AFTER UPDATE ON inventory
FOR EACH ROW
WHEN (OLD.current_quantity IS DISTINCT FROM NEW.current_quantity) -- Only run if quantity changes
EXECUTE FUNCTION log_inventory_changes();

-- Example Usage (for testing purposes):
-- 1. Insert a user and an item
-- INSERT INTO users (name, role, password) VALUES ('John Doe', 'Manager', 'securepass');
-- INSERT INTO inventory (item_name, current_quantity, unit, reorder_level) VALUES ('Tomatoes', 50.5, 'kg', 10.0);

-- 2. Update the item's quantity
-- UPDATE inventory SET current_quantity = 45.0 WHERE item_name = 'Tomatoes';

-- 3. Check the logs
-- SELECT * FROM inventory_logs;
