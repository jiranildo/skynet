ALTER TABLE experiences RENAME COLUMN validity_date TO validity_end_date;
ALTER TABLE experiences ADD COLUMN validity_start_date DATE;
