-- Fix Admin Portal 403s on /practices by granting admins access via RLS
-- Also ensures admins can read admin_users membership (so "am I admin?" checks work).

do $$
declare
  admin_uid_col text;
begin
  -- Detect which column in public.admin_users stores auth.users.id
  if exists (
    select 1
    from information_schema.columns
    where table_schema='public' and table_name='admin_users' and column_name='user_id'
  ) then
    admin_uid_col := 'user_id';
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema='public' and table_name='admin_users' and column_name='id'
  ) then
    admin_uid_col := 'id';
  else
    raise exception 'admin_users has no user_id or id column to match auth.uid()';
  end if;

  -- Ensure RLS is enabled
  execute 'alter table public.practices enable row level security';
  execute 'alter table public.admin_users enable row level security';

  -- Drop existing policies if they exist (idempotent)
  execute 'drop policy if exists admin_practices_select on public.practices';
  execute 'drop policy if exists admin_practices_insert on public.practices';
  execute 'drop policy if exists admin_practices_update on public.practices';
  execute 'drop policy if exists admin_admin_users_select_self on public.admin_users';

  -- Admin can read practices
  execute format($sql$
    create policy admin_practices_select
    on public.practices
    for select
    using (
      exists (
        select 1
        from public.admin_users au
        where au.%I = auth.uid()
      )
    );
  $sql$, admin_uid_col);

  -- Admin can create practices
  execute format($sql$
    create policy admin_practices_insert
    on public.practices
    for insert
    with check (
      exists (
        select 1
        from public.admin_users au
        where au.%I = auth.uid()
      )
    );
  $sql$, admin_uid_col);

  -- Admin can update practices
  execute format($sql$
    create policy admin_practices_update
    on public.practices
    for update
    using (
      exists (
        select 1
        from public.admin_users au
        where au.%I = auth.uid()
      )
    )
    with check (
      exists (
        select 1
        from public.admin_users au
        where au.%I = auth.uid()
      )
    );
  $sql$, admin_uid_col, admin_uid_col);

  -- Allow an admin to read their own admin_users row (helps Admin Portal "is admin" checks)
  execute format($sql$
    create policy admin_admin_users_select_self
    on public.admin_users
    for select
    using ( %I = auth.uid() );
  $sql$, admin_uid_col);

end $$;
