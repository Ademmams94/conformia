-- ============================================================================
-- ConformIA — Migration initiale : schéma + Row-Level Security
-- ============================================================================
-- Modèle de données de la spec (section 7.2), adapté pour Supabase :
--   * `public.users` est un profil lié 1-1 à `auth.users` (auth gérée par Supabase)
--   * `company_id` est présent sur TOUTES les tables métier pour une RLS uniforme
--     et auditable — l'isolation stricte des données entre PME clientes est le
--     garde-fou #1 du produit (spec 7.2 / 7.3), non négociable.
--
-- Principe RLS : par défaut tout est refusé. Un utilisateur authentifié ne voit
-- que les lignes de SA société. Les écritures « sensibles » (classifications,
-- documents, gestion des utilisateurs) sont réservées au rôle `admin`.
-- L'ingestion extension + le moteur de classification tournent côté serveur avec
-- la clé `service_role` (qui contourne la RLS) — d'où l'absence volontaire de
-- policies d'INSERT « authenticated » sur detected_tools / extension_events.
-- ============================================================================

-- ---------- Types énumérés -------------------------------------------------

create type public.user_role      as enum ('admin', 'employee');
create type public.tool_source    as enum ('detected', 'declared');
create type public.risk_level     as enum ('prohibited', 'high', 'limited', 'minimal');
create type public.document_type  as enum ('cartographie', 'aipd_template', 'registre');

-- ---------- Tables ---------------------------------------------------------

create table public.companies (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  siret          text,
  sector         text,
  employee_count integer,
  contact_email  text,
  created_at     timestamptz not null default now()
);

-- Profil applicatif lié à auth.users (Supabase Auth gère l'identité/mot de passe)
create table public.users (
  id         uuid primary key references auth.users (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  email      text not null,
  role       public.user_role not null default 'employee',
  created_at timestamptz not null default now()
);

create table public.detected_tools (
  id                   uuid primary key default gen_random_uuid(),
  company_id           uuid not null references public.companies (id) on delete cascade,
  domain               text not null,
  tool_name            text,
  first_seen           timestamptz not null default now(),
  last_seen            timestamptz not null default now(),
  distinct_users_count integer not null default 0,
  unique (company_id, domain)
);

create table public.declared_tools (
  id                  uuid primary key default gen_random_uuid(),
  company_id          uuid not null references public.companies (id) on delete cascade,
  tool_name           text not null,
  description         text,
  declared_by_user_id uuid references public.users (id) on delete set null,
  created_at          timestamptz not null default now()
);

-- tool_id est une référence polymorphe (detected_tools OU declared_tools selon
-- tool_source) : pas de FK stricte possible. company_id est dénormalisé ici pour
-- garder une RLS simple et une classification à portée réglementaire auditable.
create table public.risk_classifications (
  id                 uuid primary key default gen_random_uuid(),
  company_id         uuid not null references public.companies (id) on delete cascade,
  tool_id            uuid not null,
  tool_source        public.tool_source not null,
  risk_level         public.risk_level not null,
  annexe_iii_category text,
  rationale          text not null,
  needs_legal_review boolean not null default false,
  created_at         timestamptz not null default now(),
  unique (tool_id, tool_source)
);

create table public.compliance_documents (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references public.companies (id) on delete cascade,
  type         public.document_type not null,
  generated_at timestamptz not null default now(),
  file_url     text
);

-- Log brut d'événements de l'extension : anonymisé (user_id_hash hashé côté
-- client, spec 7.3), à purger à 90 jours. JAMAIS de contenu de page, seulement
-- domaine + horodatage.
create table public.extension_events (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references public.companies (id) on delete cascade,
  user_id_hash text not null,
  domain       text not null,
  "timestamp"  timestamptz not null default now()
);

-- ---------- Index ----------------------------------------------------------

create index idx_users_company             on public.users (company_id);
create index idx_detected_tools_company    on public.detected_tools (company_id);
create index idx_declared_tools_company    on public.declared_tools (company_id);
create index idx_risk_classif_company      on public.risk_classifications (company_id);
create index idx_compliance_docs_company   on public.compliance_documents (company_id);
create index idx_extension_events_company  on public.extension_events (company_id);
create index idx_extension_events_ts       on public.extension_events ("timestamp");

-- ---------- Helpers RLS (SECURITY DEFINER pour éviter la récursion) --------
-- Ces fonctions lisent public.users en contournant la RLS : indispensable pour
-- ne pas déclencher de récursion infinie quand une policy sur `users` appelle
-- current_company_id().

create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.users where id = auth.uid();
$$;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

-- ---------- Activation RLS -------------------------------------------------

alter table public.companies            enable row level security;
alter table public.users                enable row level security;
alter table public.detected_tools       enable row level security;
alter table public.declared_tools       enable row level security;
alter table public.risk_classifications enable row level security;
alter table public.compliance_documents enable row level security;
alter table public.extension_events     enable row level security;

-- ---------- Policies -------------------------------------------------------

-- companies : membres lisent leur société ; seul l'admin la modifie.
create policy companies_select on public.companies
  for select to authenticated
  using (id = public.current_company_id());

create policy companies_update on public.companies
  for update to authenticated
  using (id = public.current_company_id() and public.current_user_role() = 'admin')
  with check (id = public.current_company_id());

-- users : membres voient les collègues ; admin gère (invite/supprime) ;
-- chacun peut se mettre à jour lui-même.
create policy users_select on public.users
  for select to authenticated
  using (company_id = public.current_company_id());

create policy users_admin_write on public.users
  for all to authenticated
  using (company_id = public.current_company_id() and public.current_user_role() = 'admin')
  with check (company_id = public.current_company_id());

create policy users_update_self on public.users
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- detected_tools : lecture seule pour les membres (écriture = service_role).
create policy detected_tools_select on public.detected_tools
  for select to authenticated
  using (company_id = public.current_company_id());

-- declared_tools : tout membre peut déclarer un outil ; lecture par société.
create policy declared_tools_select on public.declared_tools
  for select to authenticated
  using (company_id = public.current_company_id());

create policy declared_tools_insert on public.declared_tools
  for insert to authenticated
  with check (company_id = public.current_company_id());

create policy declared_tools_admin_write on public.declared_tools
  for all to authenticated
  using (company_id = public.current_company_id() and public.current_user_role() = 'admin')
  with check (company_id = public.current_company_id());

-- risk_classifications : lecture par société ; écriture admin (+ service_role).
create policy risk_classif_select on public.risk_classifications
  for select to authenticated
  using (company_id = public.current_company_id());

create policy risk_classif_admin_write on public.risk_classifications
  for all to authenticated
  using (company_id = public.current_company_id() and public.current_user_role() = 'admin')
  with check (company_id = public.current_company_id());

-- compliance_documents : lecture par société ; génération côté serveur/admin.
create policy compliance_docs_select on public.compliance_documents
  for select to authenticated
  using (company_id = public.current_company_id());

create policy compliance_docs_admin_write on public.compliance_documents
  for all to authenticated
  using (company_id = public.current_company_id() and public.current_user_role() = 'admin')
  with check (company_id = public.current_company_id());

-- extension_events : lecture seule pour l'admin (log sensible) ; écriture = service_role.
create policy extension_events_select on public.extension_events
  for select to authenticated
  using (company_id = public.current_company_id() and public.current_user_role() = 'admin');

-- ---------- Provisionnement société + admin au signup ----------------------
-- Appelée par le dirigeant juste après auth.signUp(). SECURITY DEFINER pour
-- créer la 1re ligne `users` (impossible sous RLS : current_company_id() est
-- encore NULL). Refuse si l'utilisateur a déjà un profil.

create or replace function public.create_company_and_admin(
  p_name           text,
  p_siret          text default null,
  p_sector         text default null,
  p_employee_count integer default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid        uuid := auth.uid();
  v_email      text;
  v_company_id uuid;
begin
  if v_uid is null then
    raise exception 'Utilisateur non authentifié';
  end if;

  if exists (select 1 from public.users where id = v_uid) then
    raise exception 'Cet utilisateur a déjà une société';
  end if;

  select email into v_email from auth.users where id = v_uid;

  insert into public.companies (name, siret, sector, employee_count, contact_email)
  values (p_name, p_siret, p_sector, p_employee_count, v_email)
  returning id into v_company_id;

  insert into public.users (id, company_id, email, role)
  values (v_uid, v_company_id, v_email, 'admin');

  return v_company_id;
end;
$$;

-- ---------- Purge RGPD des logs bruts (> 90 jours, spec 7.3) ---------------
-- À planifier (pg_cron / Edge Function schedulée). Fournie ici, non planifiée.

create or replace function public.purge_old_extension_events()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.extension_events where "timestamp" < now() - interval '90 days';
$$;
