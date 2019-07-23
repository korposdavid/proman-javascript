DROP TABLE IF EXISTS public.cards;
DROP TABLE IF EXISTS public.boards_statuses;
DROP TABLE IF EXISTS public.statuses;
DROP TABLE IF EXISTS public.boards;
DROP SEQUENCE IF EXISTS public.boards_id_seq;
DROP SEQUENCE IF EXISTS public.cards_id_seq;
DROP SEQUENCE IF EXISTS public.statuses_id_seq;

CREATE TABLE public.boards (
    id SERIAL NOT NULL,
    title character varying
);

CREATE TABLE public.cards (
    id SERIAL,
    board_id integer,
    title character varying,
    status_id integer DEFAULT 0,
    card_order integer
);

CREATE TABLE public.statuses (
    id SERIAL NOT NULL,
    title character varying
);

ALTER TABLE ONLY public.boards
    ADD CONSTRAINT boards_pkey PRIMARY KEY (id);


ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_pkey PRIMARY KEY (id);


ALTER TABLE ONLY public.statuses
    ADD CONSTRAINT statuses_pkey PRIMARY KEY (id);


ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_boards__fk FOREIGN KEY (board_id) REFERENCES public.boards(id);


ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_statuses__fk FOREIGN KEY (status_id) REFERENCES public.statuses(id);


CREATE TABLE public.boards_statuses (
	board_id integer
		constraint "boards_statuses_boards_boards.id_fk"
			references boards,
	status_id integer
		constraint boards_statuses_statuses__fk
			references statuses
);

INSERT INTO public.boards (id, title) VALUES (1, 'Board 1');
INSERT INTO public.boards (id, title) VALUES (2, 'Board 2');

INSERT INTO public.statuses (id, title) VALUES (0, 'new');
INSERT INTO public.statuses (id, title) VALUES (1, 'in progress');
INSERT INTO public.statuses (id, title) VALUES (2, 'testing');
INSERT INTO public.statuses (id, title) VALUES (3, 'done');
INSERT INTO public.statuses (id, title) VALUES (4, 'extra');

INSERT INTO public.cards (id, board_id, title, status_id, card_order) VALUES (1, 1, 'new card 1', 0, 0);
INSERT INTO public.cards (id, board_id, title, status_id, card_order) VALUES (2, 1, 'new card 2', 0, 1);
INSERT INTO public.cards (id, board_id, title, status_id, card_order) VALUES (3, 1, 'in progress card', 1, 0);
INSERT INTO public.cards (id, board_id, title, status_id, card_order) VALUES (4, 1, 'planning', 2, 0);
INSERT INTO public.cards (id, board_id, title, status_id, card_order) VALUES (5, 1, 'done 1', 3, 0);
INSERT INTO public.cards (id, board_id, title, status_id, card_order) VALUES (7, 2, 'new card 1', 0, 0);
INSERT INTO public.cards (id, board_id, title, status_id, card_order) VALUES (8, 2, 'new card 2', 0, 1);
INSERT INTO public.cards (id, board_id, title, status_id, card_order) VALUES (9, 2, 'in progress card', 1, 0);
INSERT INTO public.cards (id, board_id, title, status_id, card_order) VALUES (6, 1, 'done 1', 3, 1);
INSERT INTO public.cards (id, board_id, title, status_id, card_order) VALUES (10, 2, 'planning', 2, 0);
INSERT INTO public.cards (id, board_id, title, status_id, card_order) VALUES (11, 2, 'extra', 4, 0);
INSERT INTO public.cards (id, board_id, title, status_id, card_order) VALUES (12, 2, 'extra 2', 4, 1);

INSERT INTO public.boards_statuses (board_id, status_id) VALUES (1, 0);
INSERT INTO public.boards_statuses (board_id, status_id) VALUES (1, 1);
INSERT INTO public.boards_statuses (board_id, status_id) VALUES (1, 2);
INSERT INTO public.boards_statuses (board_id, status_id) VALUES (1, 3);
INSERT INTO public.boards_statuses (board_id, status_id) VALUES (2, 0);
INSERT INTO public.boards_statuses (board_id, status_id) VALUES (2, 1);
INSERT INTO public.boards_statuses (board_id, status_id) VALUES (2, 2);
INSERT INTO public.boards_statuses (board_id, status_id) VALUES (2, 4);


SELECT setval('boards_id_seq', 2, true);
SELECT setval('cards_id_seq', 11, true);
SELECT setval('statuses_id_seq', 4, true);
