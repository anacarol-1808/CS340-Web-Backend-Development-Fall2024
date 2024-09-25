-- Task 1. Insert the following new record to the account table
INSERT INTO public.account (
    account_firstname,
    account_lastname,
    account_email,
    account_password
  )
VALUES   (
    'Tony',
    'Stark',
    'tony@starkent.com',
    'Iam1ronM@n'
  );

-- Task 2. Modify the Tony Stark record to change the account_type to "Admin"
UPDATE public.account
SET account_type = 'Admin'
WHERE account_id = 1;

-- Task 3. Delete the Tony Stark record from the database
DELETE FROM public.account
WHERE account_id = 1;

-- Task 4. Modify the "GM Hummer" record to read "a huge interior" rather than "small interiors" using a single query.
-- Explore the PostgreSQL Replace function Do NOT retype the entire description as part of the query.
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_model = 'Hummer';

-- Task 5. Use an inner join to select the "make and model" fields from the inventory table 
-- and the "classification name" field from the classification table for inventory items that 
-- belong to the "Sport" category.
SELECT inv_make, inv_model, classification_name
FROM public.inventory i
INNER JOIN public.classification c
    ON c.classification_id = i.classification_id
WHERE c.classification_name = 'Sport';

-- Task 6. Update all records in the inventory table to add "/vehicles" to the middle 
-- of the file path in the inv_image and inv_thumbnail columns using a single query.
-- When done the path for both inv_image and inv_thumbnail 
-- should resemble this example: /images/vehicles/a-car-name.jpg
UPDATE public.inventory
SET  inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
