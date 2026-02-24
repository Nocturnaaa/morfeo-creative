-- Morfeo Creative - Supabase Schema
-- Run this in your Supabase SQL editor

-- Generations table
create table if not exists generations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  brand_profile text not null,
  product_url text,
  creative_brief text,
  aspect_ratio text not null default '4:5',
  language text not null default 'es',
  run_id text not null unique,
  status text not null default 'running' check (status in ('running', 'success', 'failed')),
  output_url text,
  inputs_json jsonb
);

-- Index for fast lookup by run_id
create index if not exists generations_run_id_idx on generations(run_id);

-- Storage bucket for uploaded assets
-- Run this in Supabase Dashboard > Storage > New bucket
-- Name: morfeo-assets
-- Public: true (so ComfyDeploy can fetch the images)

-- RLS (for MVP with single user, disable RLS for simplicity)
alter table generations disable row level security;
