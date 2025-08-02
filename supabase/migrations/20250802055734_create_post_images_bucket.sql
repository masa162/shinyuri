-- Create storage bucket for post images
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true);

-- Set up RLS policies for the bucket
create policy "Anyone can view post images" on storage.objects
for select using (bucket_id = 'post-images');

create policy "Anyone can upload post images" on storage.objects
for insert with check (bucket_id = 'post-images');

create policy "Anyone can delete their post images" on storage.objects
for delete using (bucket_id = 'post-images');