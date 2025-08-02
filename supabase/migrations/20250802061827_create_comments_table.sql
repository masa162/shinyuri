-- Create comments table
create table comments (
  id bigint primary key generated always as identity,
  post_id bigint references posts(id) on delete cascade,
  parent_id bigint references comments(id) on delete cascade,
  content text not null,
  author_name varchar(50),
  like_count int not null default 0,
  created_at timestamptz default now()
);

-- Create index for better performance
create index idx_comments_post_id on comments(post_id);
create index idx_comments_parent_id on comments(parent_id);

-- Function to increment comment like count
create or replace function increment_comment_like_count(comment_id bigint)
returns void
language sql
as $$
  update comments 
  set like_count = like_count + 1
  where id = comment_id;
$$;