-- Function to increment like count for a post
create or replace function increment_like_count(post_id bigint)
returns void
language sql
as $$
  update posts 
  set like_count = like_count + 1
  where id = post_id;
$$;