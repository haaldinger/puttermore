-- Puttermore Database Schema & Row Level Security

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── 1. CORE LEAGUE TABLES ───

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  venue_id uuid references public.venues(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  league_id uuid references public.leagues(id) on delete cascade not null,
  name text not null,
  status text not null check (status in ('scheduled', 'active', 'completed')),
  start_date date,
  end_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null, -- Hex color
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.players (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  avatar_color text not null default '#e91e8b',
  putter_name text default 'The Baltimore Blade',
  putter_desc text default 'A reliable steel blade putter selected to dominate the concrete brewery carpets.',
  putter_type text default 'blade' check (putter_type in ('blade', 'mallet', 'gold', 'cyberpunk', 'stealth', 'copper', 'hickory', 'carbon', 'sapphire', 'damascus', 'brass', 'titanium', 'space', 'diamond')),
  putter_image_url text,
  role text not null default 'spectator' check (role in ('spectator', 'player', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.season_roster (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references public.seasons(id) on delete cascade not null,
  team_id uuid references public.teams(id) on delete cascade not null,
  player_id uuid references public.players(id) on delete cascade not null,
  is_captain boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (season_id, player_id)
);

-- ─── 2. MATCH & GAME RESULTS ───

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references public.seasons(id) on delete cascade not null,
  home_team_id uuid references public.teams(id) on delete cascade not null,
  away_team_id uuid references public.teams(id) on delete cascade not null,
  week_number integer not null,
  scheduled_time timestamp with time zone,
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'pending_review', 'completed')),
  winner_id uuid references public.teams(id) on delete set null,
  series_score_home integer not null default 0,
  series_score_away integer not null default 0,
  scoring_mode text not null default 'live' check (scoring_mode in ('live', 'override')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.games (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references public.matches(id) on delete cascade not null,
  game_number integer not null check (game_number in (1, 2, 3)),
  winner_id uuid references public.teams(id) on delete set null,
  final_score_home integer not null default 0,
  final_score_away integer not null default 0,
  overtime boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (match_id, game_number)
);

create table public.turns (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references public.games(id) on delete cascade not null,
  turn_number integer not null,
  team_id uuid references public.teams(id) on delete cascade not null,
  ball_back boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.putts (
  id uuid primary key default gen_random_uuid(),
  turn_id uuid references public.turns(id) on delete cascade not null,
  player_id uuid references public.players(id) on delete cascade not null,
  hole text not null, -- 'back-1', 'miss', etc.
  made boolean not null,
  island boolean not null default false,
  bonus_cup text,
  synthetic boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.banter_logs (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references public.matches(id) on delete cascade not null,
  player_id uuid references public.players(id) on delete cascade not null,
  player_name text not null,
  quote text not null,
  context text not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ─── 3. INDEXES FOR PERFORMANCE ───

create index idx_matches_season on public.matches(season_id);
create index idx_roster_player on public.season_roster(player_id);
create index idx_games_match on public.games(match_id);
create index idx_turns_game on public.turns(game_id);
create index idx_putts_turn on public.putts(turn_id);
create index idx_putts_player on public.putts(player_id);

-- ─── 4. ROW-LEVEL SECURITY (RLS) ───

-- Enable RLS on all tables
alter table public.venues enable row level security;
alter table public.leagues enable row level security;
alter table public.seasons enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.season_roster enable row level security;
alter table public.matches enable row level security;
alter table public.games enable row level security;
alter table public.turns enable row level security;
alter table public.putts enable row level security;
alter table public.banter_logs enable row level security;

-- Helper Function to check if current user is admin
create or replace function public.is_admin()
returns boolean security definer as $$
begin
  return exists (
    select 1 from public.players
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql;

-- Helper Function to check if current user is captain of a team in a match
create or replace function public.is_match_captain(match_id uuid)
returns boolean security definer as $$
declare
  m_row record;
begin
  select home_team_id, away_team_id, season_id into m_row from public.matches where id = match_id;
  if not found then
    return false;
  end if;

  return exists (
    select 1 from public.season_roster
    where player_id = auth.uid()
      and season_id = m_row.season_id
      and (team_id = m_row.home_team_id or team_id = m_row.away_team_id)
      and is_captain = true
  );
end;
$$ language plpgsql;

-- ─── Venue Policies ───
create policy "Venues are viewable by everyone" on public.venues for select to authenticated, anon using (true);
create policy "Venues modified by admin only" on public.venues for all to authenticated using (public.is_admin());

-- ─── League Policies ───
create policy "Leagues are viewable by everyone" on public.leagues for select to authenticated, anon using (true);
create policy "Leagues modified by admin only" on public.leagues for all to authenticated using (public.is_admin());

-- ─── Season Policies ───
create policy "Seasons are viewable by everyone" on public.seasons for select to authenticated, anon using (true);
create policy "Seasons modified by admin only" on public.seasons for all to authenticated using (public.is_admin());

-- ─── Team Policies ───
create policy "Teams are viewable by everyone" on public.teams for select to authenticated, anon using (true);
create policy "Teams modified by admin only" on public.teams for all to authenticated using (public.is_admin());

-- ─── Player Policies ───
create policy "Player profiles are viewable by everyone" on public.players for select to authenticated, anon using (true);
create policy "Players can update their own profile" on public.players for update to authenticated 
  using (auth.uid() = id) with check (auth.uid() = id);
create policy "Admins have full player control" on public.players for all to authenticated using (public.is_admin());

-- ─── Roster Policies ───
create policy "Rosters are viewable by everyone" on public.season_roster for select to authenticated, anon using (true);
create policy "Rosters modified by admin only" on public.season_roster for all to authenticated using (public.is_admin());

-- ─── Match Policies ───
create policy "Matches are viewable by everyone" on public.matches for select to authenticated, anon using (true);
create policy "Matches can be updated by match captains" on public.matches for update to authenticated
  using (public.is_match_captain(id) and status in ('scheduled', 'live'))
  with check (public.is_match_captain(id) and status in ('scheduled', 'live'));
create policy "Admins have full match control" on public.matches for all to authenticated using (public.is_admin());

-- ─── Game Policies ───
create policy "Games are viewable by everyone" on public.games for select to authenticated, anon using (true);
create policy "Games can be modified by match captains" on public.games for all to authenticated
  using (public.is_match_captain(match_id))
  with check (public.is_match_captain(match_id));
create policy "Admins have full game control" on public.games for all to authenticated using (public.is_admin());

-- ─── Turn Policies ───
create policy "Turns are viewable by everyone" on public.turns for select to authenticated, anon using (true);
create policy "Turns can be modified by match captains" on public.turns for all to authenticated
  using (exists (
    select 1 from public.games g
    where g.id = game_id and public.is_match_captain(g.match_id)
  ))
  with check (exists (
    select 1 from public.games g
    where g.id = game_id and public.is_match_captain(g.match_id)
  ));
create policy "Admins have full turn control" on public.turns for all to authenticated using (public.is_admin());

-- ─── Putt Policies ───
create policy "Putts are viewable by everyone" on public.putts for select to authenticated, anon using (true);
create policy "Putts can be modified by match captains" on public.putts for all to authenticated
  using (exists (
    select 1 from public.turns t
    join public.games g on g.id = t.game_id
    where t.id = turn_id and public.is_match_captain(g.match_id)
  ))
  with check (exists (
    select 1 from public.turns t
    join public.games g on g.id = t.game_id
    where t.id = turn_id and public.is_match_captain(g.match_id)
  ));
create policy "Admins have full putt control" on public.putts for all to authenticated using (public.is_admin());

-- ─── Banter Policies ───
create policy "Banter is viewable by everyone" on public.banter_logs for select to authenticated, anon using (true);
create policy "Banter can be added by match captains" on public.banter_logs for insert to authenticated
  using (public.is_match_captain(match_id))
  with check (public.is_match_captain(match_id));
create policy "Admins have full banter control" on public.banter_logs for all to authenticated using (public.is_admin());

-- ─── 5. AUTOMATIC PROFILE CREATION TRIGGER ───

-- Create profile table insert trigger on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.players (id, name, email, avatar_color, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    '#e91e8b',
    'spectator'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
