-- Add images column to posts table for storing multiple image URLs
alter table posts 
add column images text[] default array[]::text[];