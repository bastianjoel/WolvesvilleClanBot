-- Table: public.ledger

-- DROP TABLE IF EXISTS public.ledger;

CREATE TABLE IF NOT EXISTS public.ledger
(
    id SERIAL PRIMARY KEY,
    clan_id uuid NOT NULL,
    data json NOT NULL
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.ledger
    OWNER to postgres;


-- Table: public.members

-- DROP TABLE IF EXISTS public.members;

CREATE TABLE IF NOT EXISTS public.members
(
    id SERIAL PRIMARY KEY,
    clan_id uuid NOT NULL,
    member_data json NOT NULL,
    player_data json NOT NULL
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.members
    OWNER to postgres;
