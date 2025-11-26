-- Update existing languages to set their direction
-- Run this after the migration

-- Set Arabic to RTL
UPDATE languages SET direction = 'rtl' WHERE code = 'ar';

-- Set English to LTR
UPDATE languages SET direction = 'ltr' WHERE code = 'en';

-- If you have other languages, add them here:
-- UPDATE languages SET direction = 'rtl' WHERE code IN ('ar', 'he', 'fa', 'ur'); -- RTL languages
-- UPDATE languages SET direction = 'ltr' WHERE code IN ('en', 'es', 'fr', 'de'); -- LTR languages

-- Verify the changes
SELECT id, name, code, direction, is_active FROM languages;
