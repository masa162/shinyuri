create table posts (
  id bigint primary key generated always as identity,
  created_at timestamptz default now(),
  content text,
  image_url text
);
