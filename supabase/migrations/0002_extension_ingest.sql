-- ============================================================================
-- ConformIA — Migration 0002 : ingestion des événements de l'extension
-- ============================================================================
-- Ajoute un « jeton d'ingestion » par société (secret partagé configuré dans
-- l'extension) et une RPC atomique qui enregistre un événement + met à jour la
-- table des outils détectés.
--
-- Sécurité : l'extension ne connaît QUE ce jeton (jamais la service_role). Notre
-- endpoint serveur appelle record_extension_event avec la service_role. La RPC
-- est SECURITY DEFINER pour rester atomique et garder la résolution jeton→société
-- côté base.
-- ============================================================================

-- Jeton d'ingestion : un secret opaque par société, régénérable.
alter table public.companies
  add column ingest_token uuid not null default gen_random_uuid();

alter table public.companies
  add constraint companies_ingest_token_key unique (ingest_token);

-- ---------- RPC d'enregistrement d'un événement extension -------------------

create or replace function public.record_extension_event(
  p_token        uuid,
  p_user_id_hash text,
  p_domain       text,
  p_tool_name    text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
begin
  -- Résolution jeton → société. Jeton invalide = rejet.
  select id into v_company_id from public.companies where ingest_token = p_token;
  if v_company_id is null then
    raise exception 'Jeton d''ingestion invalide' using errcode = '28000';
  end if;

  -- Garde-fou : uniquement domaine + horodatage + identifiant anonyme.
  insert into public.extension_events (company_id, user_id_hash, domain)
  values (v_company_id, p_user_id_hash, p_domain);

  -- Mise à jour de l'agrégat « outils détectés ».
  insert into public.detected_tools
    (company_id, domain, tool_name, first_seen, last_seen, distinct_users_count)
  values
    (v_company_id, p_domain, p_tool_name, now(), now(), 1)
  on conflict (company_id, domain) do update
    set last_seen  = now(),
        tool_name  = coalesce(public.detected_tools.tool_name, excluded.tool_name),
        distinct_users_count = (
          select count(distinct user_id_hash)
          from public.extension_events
          where company_id = v_company_id and domain = p_domain
        );
end;
$$;

-- La RPC n'est appelée que côté serveur (service_role). On retire le droit
-- d'exécution aux rôles anon/authenticated par prudence.
revoke execute on function public.record_extension_event(uuid, text, text, text)
  from anon, authenticated;
