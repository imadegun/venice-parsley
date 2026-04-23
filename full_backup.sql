--
-- PostgreSQL database dump
--

\restrict rIbwMLOooXsQTSu5fM5IQt2dfic3dyrCaA882KtUm0npAt5xdixts469Y6tz9FN

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: booking_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.booking_status AS ENUM (
    'confirmed',
    'cancelled',
    'completed'
);


--
-- Name: loyalty_point_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.loyalty_point_type AS ENUM (
    'earned',
    'redeemed'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'guest',
    'member',
    'admin'
);


--
-- Name: award_loyalty_points(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.award_loyalty_points() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Only award points for new confirmed bookings
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    INSERT INTO loyalty_points (user_id, points, type, booking_id, description)
    VALUES (
      NEW.guest_id,
      FLOOR(NEW.total_cents / 100), -- 1 point per dollar spent
      'earned',
      NEW.id,
      'Points earned from booking: ' || NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: apartments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.apartments (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    short_description text,
    max_guests integer NOT NULL,
    bedrooms integer NOT NULL,
    base_price_cents integer NOT NULL,
    image_url text,
    gallery_images text[] DEFAULT '{}'::text[],
    artistic_features text[] DEFAULT '{}'::text[],
    amenities text[] DEFAULT '{}'::text[],
    location_details jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT apartments_base_price_cents_check CHECK ((base_price_cents >= 0)),
    CONSTRAINT apartments_bedrooms_check CHECK ((bedrooms >= 0)),
    CONSTRAINT apartments_max_guests_check CHECK ((max_guests > 0))
);


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    apartment_id uuid NOT NULL,
    check_in_date date NOT NULL,
    check_out_date date NOT NULL,
    total_guests integer DEFAULT 1 NOT NULL,
    total_cents integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    special_requests text,
    contact_info jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: content_revisions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_revisions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    section_id uuid NOT NULL,
    key text NOT NULL,
    payload jsonb NOT NULL,
    version integer NOT NULL,
    published_by uuid,
    published_at timestamp with time zone DEFAULT now(),
    CONSTRAINT content_revisions_key_check CHECK ((key = ANY (ARRAY['homepage'::text, 'about'::text, 'contact'::text]))),
    CONSTRAINT content_revisions_version_check CHECK ((version > 0))
);


--
-- Name: content_sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_sections (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    key text NOT NULL,
    payload jsonb NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT content_sections_key_check CHECK ((key = ANY (ARRAY['homepage'::text, 'about'::text, 'contact'::text]))),
    CONSTRAINT content_sections_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text]))),
    CONSTRAINT content_sections_version_check CHECK ((version > 0))
);


--
-- Name: database-schema; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."database-schema" (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE "database-schema"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public."database-schema" IS 'schema database for venice parcley';


--
-- Name: database-schema_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."database-schema" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."database-schema_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: loyalty_points; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loyalty_points (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    points integer NOT NULL,
    type text NOT NULL,
    booking_id uuid,
    description text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: menu_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menu_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    label text NOT NULL,
    href text NOT NULL,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    content text,
    map_embed text
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    full_name text,
    phone text,
    role public.user_role DEFAULT 'guest'::public.user_role,
    preferred_driver_id uuid,
    notification_preferences jsonb DEFAULT '{"sms": false, "email": true}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    key text NOT NULL,
    value jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Data for Name: apartments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.apartments (id, slug, name, description, short_description, max_guests, bedrooms, base_price_cents, image_url, gallery_images, artistic_features, amenities, location_details, is_active, created_at, updated_at) FROM stdin;
739ebdf8-5ad7-46fb-aa3f-bae49305ec0d	ca-asia-app-1	Ca' Asia - App. 1	A luxury residence (110 mt2) with refined design, crafted by a renowned architect and enriched with touches inspired by the elegance of Venice and the aesthetics of Asia. \n\nLocated in the vibrant heart of Venice, it is just steps away from the city’s most iconic landmarks: Rialto Bridge (7 minutes), St. Mark’s Square (15 minutes), and the Basilica of Saints John and Paul (3 minutes). An exclusive location to explore the entire city.\n\nThe apartment is on the second floor (approximately 30 steps) of a private *calle* overlooking the northern lagoon. Thanks to this location, the environment is exceptionally peaceful and reserved, with only a few residents passing through. The absence of shops or restaurants nearby ensures a serene and restful stay.\n\nThe Interiors:\nThe apartment boasts unique, elegant, and comfortable spaces, fully equipped with modern amenities:\nA modern and fully equipped kitchen, perfect for preparing both local dishes and your preferred cuisine.\nThree tastefully decorated bedrooms, each designed with attention to detail. Two of the bedrooms feature en-suite bathrooms, ensuring an exclusive and private experience.\nThree bathrooms in total, all modern, functional, and finished with high-quality materials.\nAir conditioning throughout the apartment, ensuring maximum comfort in every season.\nA spacious, cozy living room with refined décor that creates a warm, relaxing atmosphere.\nMagnificent high ceilings adorned with intricate wooden beams add a sense of grandeur and highlight the architectural charm of the space.\n\nSmart TV  and a fast and reliable Wi-Fi\nA baby cot is available upon request, at no additional cost.\n\nThe Altana:\nThe highlight of the apartment is its splendid *altana*, a traditional Venetian rooftop terrace. This unique space offers breathtaking views of the northern lagoon and the city’s rooftops. It is perfect for enjoying an aperitif at sunset, dining al fresco, or starting your day with an unforgettable breakfast.\n\nThe Location:\nJust a 4-minute walk from the Fondamenta Nove vaporetto stop, connecting the apartment to all Venetian destinations and the water shuttle to/from the airport. - Surrounded by excellent restaurants and bars, with a pharmacy and a laundromat just 3 minutes away on foot. A one-of-a-kind retreat that combines exclusive design, modern comfort, and the charm of a traditional Venetian terrace for an unforgettable stay in the heart of Venice!\n\nSMOKING, PETS, AND PARTIES ARE NOT ALLOWED	A spacious 3 bedrooms apartment with designer interiors, Asian decorations and wonderful art pieces in the authentic heart of Venice	6	3	65000	https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-asia-app-1/1ff4d004-db29-4c59-b68f-a72d8b02897a-1776667040420.jpg	{https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-asia-app-1/1ff4d004-db29-4c59-b68f-a72d8b02897a-1776667040420.jpg,https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-asia-app-1/7e0e83e6-c038-41be-8b7c-dd0e01573b16-1776667065278.jpg,https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-asia-app-1/1191b4a7-b843-47b6-96a2-31524fafcbae-1776667074147.jpg,https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-asia-app-1/f6b0eef2-6dbf-463b-9f88-0aaf835f08f7-1776667077908.jpg,https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-asia-app-1/eaf22f7d-857a-45c9-ad13-18d9b2336af5-1776667084183.jpg,https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-asia-app-1/d61b7e00-acba-464d-8dce-183bd3f5e90e-1776667091276.jpg,https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-asia-app-1/fc4089e9-bbf1-4c5f-a12e-abaeb2c4f20d-1776667094843.jpg,https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-asia-app-1/6f00b76e-8235-4d24-8cec-e63cb035373d-1776667101074.jpg,https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-asia-app-1/5becf661-7abc-4307-ad83-71ab1ed0b625-1776667107367.jpg,https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-asia-app-1/ce5becb5-b412-42ce-8266-e2ab29b8cb74-1776667138283.jpg}	{"High industrial ceilings","Concrete walls","Modern art installations","Dedicated art studio","Urban design elements"}	{Towels,"Bed Sheets","Bathroom Amenities","Hair dryer",AC,"Fully equipped Kitchen",Dishwasher,Wi-Fi,"Smart TV",Safe,Terrace,"Baby cot and high chair (on request)"}	{"address": "Industrial Arts District", "coordinates": {"lat": 1.2789, "lng": 103.8412}}	t	2026-04-12 07:12:39.148792+00	2026-04-21 02:27:55.731814+00
3f667c8f-1e9a-4385-9ed8-2b0cf44446d4	ca-biri-apt-2	Ca' Biri - Apt. 2	A charming and contemporary apartment set in the authentic heart of Venice, just a short walk from Rialto (7 minutes), St. Mark’s Square (15 minutes), and the Basilica of SS. Giovanni e Paolo (3 minutes). An ideal location to experience and explore the city with ease.\n\nThe apartment is located on the first floor (15 steps) in an exceptionally quiet and peaceful area. The calle is closed and opens onto the northern lagoon, with only a handful residents passing through. No nearby shops or restaurants means one rare luxury in Venice: complete tranquility and restful nights.\n\nInside, you’ll find a modern, fully equipped kitchen and fast Wi-Fi. The apartment offers two bedrooms, one of which is flexible and can be arranged either as a double (or twin beds) or transformed into a living area with two sofas. Just let us know your preferred setup. Each bedroom is equipped with online TV (Netflix) and air conditioning. A baby cot is available upon request at no additional cost.\n\nThe apartment is just 4 minutes from the Fondamente Nove vaporetto stop, with connections to all Venetian destinations and direct hydrofoil service to and from the airport. Excellent restaurants and bars are within easy reach, and a pharmacy and self-service laundry are conveniently located nearby (3 minutes).\n\nSMOKING, PETS, AND PARTIES ARE NOT ALLOWED	A charming and contemporary apartment set in the authentic heart of Venice, 	4	2	25000	https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-biri-apt-2/ac775915-efa2-4406-820d-eb3c543619c9-1776672327395.jpg	{https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-biri-apt-2/ac775915-efa2-4406-820d-eb3c543619c9-1776672327395.jpg,https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-biri-apt-2/83199b58-98dd-443c-aad7-5de2ee0d696a-1776672335460.jpg,https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-biri-apt-2/3cb07b0c-f16b-4c28-b1f4-8690175349b6-1776672340634.jpg,https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-biri-apt-2/ffefe668-6cc6-468a-86ec-dd7072953b7a-1776672347415.jpg,https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-biri-apt-2/631de58c-cd12-42ee-86a9-58969e705a15-1776672356342.jpg,https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-biri-apt-2/0d5598b0-bb02-4952-af05-4b86c89547b8-1776672361155.jpg,https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-biri-apt-2/479db910-2ed2-4a7a-9463-04362e2877ee-1776672369653.jpg,https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-biri-apt-2/9bb913b0-47c4-43fe-8f98-a52d42f1c884-1776672380073.jpg,https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-biri-apt-2/4a151392-845c-4902-809a-a34e776428ce-1776672388056.jpg,https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-biri-apt-2/14bf294a-c7e6-4dfd-9240-1df07ca29c80-1776672412384.jpg}	{"Floor-to-ceiling windows","Natural light optimization","Scandinavian minimalist design","Artist workspace"}	{Towels,"Bed Sheets","Bathroom Amenities","Hair dryer",AC,"Fully equipped kitchen",Wi-Fi,"Smart TV",Safe,"Baby cot and high chair (on request)"}	{"address": "Downtown Art District", "coordinates": {"lat": 1.3521, "lng": 103.8198}}	t	2026-04-12 07:12:39.148792+00	2026-04-21 02:28:10.735719+00
d0e3aa54-8367-4f32-a6a6-d656bac9db01	ca-tera-apt-3	Ca' Tera' - Apt. 3	A charming and contemporary apartment set in the authentic heart of Venice, just a short walk from Rialto (7 minutes), St. Mark’s Square (15 minutes), and the Basilica of SS. Giovanni e Paolo (3 minutes). An ideal location to experience and explore the city with ease.\n\nThe apartment is located on the first floor (15 steps) in an exceptionally quiet and peaceful area. The calle is closed and opens onto the northern lagoon, with only a handful residents passing through. No nearby shops or restaurants means one rare luxury in Venice: complete tranquility and restful nights.\n\nInside, you’ll find a modern, fully equipped kitchen and fast Wi-Fi. The apartment offers two bedrooms, one of which is flexible and can be arranged either as a double (or twin beds) or transformed into a living area with two sofas. Just let us know your preferred setup. Each bedroom is equipped with online TV (Netflix) and air conditioning. A baby cot is available upon request at no additional cost.\n\nThe apartment is just 4 minutes from the Fondamente Nove vaporetto stop, with connections to all Venetian destinations and direct hydrofoil service to and from the airport. Excellent restaurants and bars are within easy reach, and a pharmacy and self-service laundry are conveniently located nearby (3 minutes).\n\nSMOKING, PETS, AND PARTIES ARE NOT ALLOWED	A charming and contemporary apartment set in the authentic heart of Venice..	4	2	25000	https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-tera-apt-3/92fb3cb8-1fcf-4adc-a3f0-cadc8d8f4a32-1776672478145.jpg	{https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-tera-apt-3/92fb3cb8-1fcf-4adc-a3f0-cadc8d8f4a32-1776672478145.jpg,https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-tera-apt-3/f26cb595-0c77-4913-9deb-54fc19d24176-1776672482841.jpg,https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-tera-apt-3/841c8623-83be-46ea-b2c9-808b6957d5cf-1776672486195.jpg,https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-tera-apt-3/a1242e3a-2028-4123-9121-2a6a5bc9dd29-1776672489699.jpg,https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-tera-apt-3/b81d8dd0-4f54-4604-b71b-40af20f78e43-1776672512725.jpg,https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-tera-apt-3/dd6242aa-a805-48e1-864e-d6cd1c0cf600-1776672519714.jpg,https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-tera-apt-3/97de23a0-9528-4e7c-98f3-b6f277f9833b-1776672523807.jpg,https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-tera-apt-3/34bc3153-a7c3-4a15-8bbe-f702ef8c4aef-1776672528812.jpg,https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-tera-apt-3/d4f90eca-19cd-4805-b742-8cda51ce399e-1776672532453.jpg,https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/ca-tera-apt-3/2a7663d8-6ef7-4aeb-946f-88bcb94e5f32-1776672556539.jpg}	{"Panoramic city views","Private rooftop terrace","Professional art studio","Natural northern light","Premium finishes"}	{Towels,"Bed Sheets","Bathroom Amenities","Hair dryer",AC,"Fully equipped kitchen",Wi-Fi,"Smart TV",Safe,"Baby cot and high chair (on request)"}	{"address": "Luxury Arts Tower", "coordinates": {"lat": 1.2834, "lng": 103.8607}}	t	2026-04-12 07:12:39.148792+00	2026-04-21 02:27:38.82755+00
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bookings (id, user_id, apartment_id, check_in_date, check_out_date, total_guests, total_cents, status, special_requests, contact_info, created_at, updated_at) FROM stdin;
56981aea-c58b-4fd3-9d4d-29b51b370fb9	691769f3-9978-472b-9fb5-62c15543d7d9	3f667c8f-1e9a-4385-9ed8-2b0cf44446d4	2026-04-19	2026-04-20	2	25000	cancelled	note request	{"guest_name": "kakgun", "guest_email": "admin@admin.com", "guest_phone": "+624545676786"}	2026-04-19 08:40:01.024074+00	2026-04-19 09:55:24.459+00
3359dd1b-4860-41e7-8ba9-af7e7e7658c6	691769f3-9978-472b-9fb5-62c15543d7d9	d0e3aa54-8367-4f32-a6a6-d656bac9db01	2026-04-19	2026-04-20	2	95000	confirmed	note for michele	{"guest_name": "Michele", "guest_email": "Michele@gmail.com", "guest_phone": "+624545676786"}	2026-04-19 10:38:25.065728+00	2026-04-19 10:40:20.735+00
6e5b88d5-29ed-4b0d-951f-346c20d7c98c	691769f3-9978-472b-9fb5-62c15543d7d9	3f667c8f-1e9a-4385-9ed8-2b0cf44446d4	2026-04-19	2026-04-20	2	25000	completed	\N	{"guest_name": "jhon doe", "guest_email": "jhon@doe.com", "guest_phone": "+624545676786"}	2026-04-19 09:33:21.284055+00	2026-04-19 10:43:02.928+00
556ddecf-4221-4643-814d-4c23f4814fa0	691769f3-9978-472b-9fb5-62c15543d7d9	d0e3aa54-8367-4f32-a6a6-d656bac9db01	2026-04-19	2026-04-20	2	95000	cancelled	note special	{"guest_name": "kakgun", "guest_email": "admin@admin.com", "guest_phone": "+624545676786"}	2026-04-19 07:42:06.252363+00	2026-04-19 10:43:25.741+00
8e125466-29f6-4f17-b459-5c11da8684e2	691769f3-9978-472b-9fb5-62c15543d7d9	3f667c8f-1e9a-4385-9ed8-2b0cf44446d4	2026-04-19	2026-04-20	4	25000	confirmed	note for paull	{"guest_name": "Paull", "guest_email": "paull@gmail.com", "guest_phone": "+624545676786"}	2026-04-19 11:00:40.948918+00	2026-04-19 11:07:00.224+00
a7bcc697-51fc-4127-a6bf-6bae9bf17029	691769f3-9978-472b-9fb5-62c15543d7d9	739ebdf8-5ad7-46fb-aa3f-bae49305ec0d	2026-05-01	2026-05-02	3	65000	confirmed	dorce notes	{"guest_name": "Dorce", "guest_email": "dorce@gmail.com", "guest_phone": "+624545676786"}	2026-04-19 11:34:00.448162+00	2026-04-19 11:37:57.225+00
7e4c7cbc-ca3e-48f3-84e5-f5805637bd0d	691769f3-9978-472b-9fb5-62c15543d7d9	739ebdf8-5ad7-46fb-aa3f-bae49305ec0d	2026-04-29	2026-05-02	2	195000	pending	\N	{"guest_name": "Marcello Massoni", "guest_email": "marcello@gayaceramic.com", "guest_phone": "+628174745035"}	2026-04-20 02:22:52.643076+00	2026-04-20 02:22:52.643076+00
83ce5d45-c57c-4148-b9f9-c3eeebcb9afe	691769f3-9978-472b-9fb5-62c15543d7d9	739ebdf8-5ad7-46fb-aa3f-bae49305ec0d	2026-04-29	2026-05-02	2	195000	pending	\N	{"guest_name": "Marcello Massoni", "guest_email": "marcello@gayaceramic.com", "guest_phone": "+628174745035"}	2026-04-20 02:23:57.519981+00	2026-04-20 02:23:57.519981+00
de2fd5d2-898c-428c-9332-4247c337aeb5	691769f3-9978-472b-9fb5-62c15543d7d9	3f667c8f-1e9a-4385-9ed8-2b0cf44446d4	2026-04-20	2026-04-21	2	25000	pending	\N	{"guest_name": "julio", "guest_email": "julio@gmail.com", "guest_phone": "123456"}	2026-04-20 02:28:36.069507+00	2026-04-20 02:28:36.069507+00
83f6970e-b367-42d8-9a99-ef79ed42f81c	691769f3-9978-472b-9fb5-62c15543d7d9	d0e3aa54-8367-4f32-a6a6-d656bac9db01	2026-04-20	2026-04-21	2	95000	confirmed	\N	{"guest_name": "andrea", "guest_email": "andrea@gmail.com", "guest_phone": "+62123456789"}	2026-04-20 03:07:39.699354+00	2026-04-20 03:09:16.367+00
50107da1-0f38-41f8-8e42-fb6d25b65fda	691769f3-9978-472b-9fb5-62c15543d7d9	739ebdf8-5ad7-46fb-aa3f-bae49305ec0d	2026-04-29	2026-05-02	4	195000	confirmed	\N	{"guest_name": "Marcello Massoni", "guest_email": "marcello@gayaceramic.com", "guest_phone": "+628174745035"}	2026-04-20 08:00:40.370522+00	2026-04-20 08:02:16.109+00
1d3dd077-3b28-460b-bfa0-75b4dfd662d6	691769f3-9978-472b-9fb5-62c15543d7d9	739ebdf8-5ad7-46fb-aa3f-bae49305ec0d	2026-04-23	2026-04-24	1	65000	confirmed	\N	{"guest_name": "degun", "guest_email": "degun@admin.com", "guest_phone": "+624545676786"}	2026-04-22 14:39:51.453764+00	2026-04-22 14:42:05.669+00
\.


--
-- Data for Name: content_revisions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.content_revisions (id, section_id, key, payload, version, published_by, published_at) FROM stdin;
aae79b7c-a1df-4faa-8920-89c084fd69a5	2c909497-399d-4e25-9cde-58a3673bcedd	homepage	{"hero": {"title": {"en": "Discover Artistic Living Spaces", "it": "Scopri Spazi di Vita Artistici"}, "ctaText": {"en": "Explore Apartments", "it": "Esplora Appartamenti"}, "subtitle": {"en": "Luxury apartments designed for art lovers and creative souls", "it": "Appartamenti di lusso progettati per amanti dell'arte e anime creative"}, "backgroundImages": ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1920"]}, "about": {"title": {"en": "", "it": ""}, "content": {"en": "", "it": ""}}, "featured": {"title": {"en": "", "it": ""}, "description": {"en": "", "it": ""}}}	5	691769f3-9978-472b-9fb5-62c15543d7d9	2026-04-19 13:50:28.486493+00
abfa45cc-334c-40cf-8e97-3dda0ba256ec	2c909497-399d-4e25-9cde-58a3673bcedd	homepage	{"hero": {"title": {"en": "", "it": ""}, "ctaText": {"en": "", "it": ""}, "subtitle": {"en": "", "it": ""}, "backgroundImages": ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1920"]}, "about": {"title": {"en": "made About Venice Parcley", "it": "Chi Siamo"}, "content": {"en": "We connect art lovers with extraordinary living spaces in Venice, offering a unique blend of luxury accommodation and artistic inspiration.", "it": "Connettiamo gli amanti dell'arte con spazi abitativi straordinari a Venezia, offrendo un mix unico di alloggi di lusso e ispirazione artistica."}}, "featured": {"title": {"en": "", "it": ""}, "description": {"en": "", "it": ""}}}	7	691769f3-9978-472b-9fb5-62c15543d7d9	2026-04-19 13:51:42.628966+00
d588320c-0f38-42dd-8917-d43ad1085e97	2c909497-399d-4e25-9cde-58a3673bcedd	homepage	{"hero": {"title": {"en": "Made Discover Artistic Living Spaces", "it": "Scopri Spazi di Vita Artistici"}, "ctaText": {"en": "Explore Apartments", "it": "Esplora Appartamenti"}, "subtitle": {"en": "Luxury apartments designed for art lovers and creative souls", "it": "Appartamenti di lusso progettati per amanti dell'arte e anime creative"}, "backgroundImages": ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1920"]}, "about": {"title": {"en": "", "it": ""}, "content": {"en": "", "it": ""}}, "featured": {"title": {"en": "", "it": ""}, "description": {"en": "", "it": ""}}}	9	691769f3-9978-472b-9fb5-62c15543d7d9	2026-04-19 13:56:05.33314+00
2d907bdc-22af-49fb-ad32-271bd9297021	2c909497-399d-4e25-9cde-58a3673bcedd	homepage	{"hero": {"title": {"en": "", "it": ""}, "ctaText": {"en": "", "it": ""}, "subtitle": {"en": "", "it": ""}, "backgroundImages": ["https://images.unsplash.com/photo-1545324418-cc1a3fa00c00?w=1920", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920"]}, "about": {"title": {"en": "", "it": ""}, "content": {"en": "", "it": ""}}, "intro": {"title": {"en": "Life at Shoreline, wrapped in artful calm and cinematic sea light.", "it": "La vita a Shoreline, avvolta da una calma sapientemente studiata e da una luce marina da film."}, "tagline": {"en": "made SHORELINE VIBES", "it": "ATMOSFERA DI COSTA"}, "description": {"en": "Drift through curated spaces, coastal textures, and boutique rhythms designed for guests who savor design-forward stays.", "it": "Lasciatevi trasportare da spazi curati nei minimi dettagli, atmosfere costiere e ritmi esclusivi pensati per ospiti che apprezzano soggiorni all'insegna del design."}}, "featured": {"title": {"en": "", "it": ""}, "description": {"en": "", "it": ""}}}	11	691769f3-9978-472b-9fb5-62c15543d7d9	2026-04-19 14:22:17.600523+00
bddd99e2-20f5-4b93-a441-8cf1eb2fd501	2c909497-399d-4e25-9cde-58a3673bcedd	homepage	{"hero": {"title": {"en": "", "it": ""}, "ctaText": {"en": "", "it": ""}, "subtitle": {"en": "", "it": ""}, "backgroundImages": ["https://images.unsplash.com/photo-1545324418-cc1a3fa00c00?w=1920", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920"]}, "about": {"title": {"en": "", "it": ""}, "content": {"en": "", "it": ""}}, "intro": {"title": {"en": "Life in the Heart of Venice.", "it": "Vita nel cuore di Venezia."}, "tagline": {"en": "SHORELINE VIBES", "it": "ATMOSFERA DI COSTA"}, "description": {"en": "Intimate stays where timeless Venetian character meets understated contemporary living elegance. Central. Private. Effortless.", "it": "Soggiorni intimi dove il fascino intramontabile di Venezia incontra la sobria eleganza del vivere contemporaneo. Centrale. Riservato. Senza sforzo."}}, "featured": {"title": {"en": "", "it": ""}, "description": {"en": "", "it": ""}}}	13	691769f3-9978-472b-9fb5-62c15543d7d9	2026-04-19 14:24:23.357265+00
63b4a9ff-bd27-4c29-a0fe-134a90f51eaf	2c909497-399d-4e25-9cde-58a3673bcedd	homepage	{"hero": {"title": {"en": "", "it": ""}, "ctaText": {"en": "", "it": ""}, "subtitle": {"en": "", "it": ""}, "backgroundImages": ["https://images.unsplash.com/photo-1545324418-cc1a3fa00c00?w=1920", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920"]}, "about": {"title": {"en": "", "it": ""}, "content": {"en": "", "it": ""}}, "intro": {"title": {"en": "", "it": ""}, "tagline": {"en": "", "it": ""}, "description": {"en": "", "it": ""}}, "featured": {"title": {"en": "Featured Apartments", "it": "Appartamenti in evidenza"}, "description": {"en": "Designed for discerning travelers, each residence offers a calm and curated atmosphere, just steps from the city's most iconic landmarks.\\r\\nThoughtful details, refined materials, and a sense of quiet exclusivity.", "it": "Pensate per viaggiatori esigenti, ogni residenza offre un'atmosfera tranquilla e raffinata, a pochi passi dai luoghi più iconici della città.\\r\\nDettagli curati, materiali pregiati e un senso di serena esclusività."}}}	15	691769f3-9978-472b-9fb5-62c15543d7d9	2026-04-19 14:26:24.289847+00
52dd1729-bc57-49dd-8200-487bba1e76e7	2c909497-399d-4e25-9cde-58a3673bcedd	homepage	{"hero": {"title": {"en": "", "it": ""}, "ctaText": {"en": "", "it": ""}, "subtitle": {"en": "", "it": ""}, "backgroundImages": ["https://images.unsplash.com/photo-1545324418-cc1a3fa00c00?w=1920", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920"]}, "about": {"title": {"en": "Made About Venice Parcley", "it": "Chi Siamo"}, "content": {"en": "We connect art lovers with extraordinary living spaces in Venice, offering a unique blend of luxury accommodation and artistic inspiration.", "it": "Connettiamo gli amanti dell'arte con spazi abitativi straordinari a Venezia, offrendo un mix unico di alloggi di lusso e ispirazione artistica."}}, "intro": {"title": {"en": "", "it": ""}, "tagline": {"en": "", "it": ""}, "description": {"en": "", "it": ""}}, "featured": {"title": {"en": "", "it": ""}, "description": {"en": "", "it": ""}}}	17	691769f3-9978-472b-9fb5-62c15543d7d9	2026-04-19 14:41:04.037916+00
4edcfa9d-ace7-4282-a8ae-8c60234f3ebb	2c909497-399d-4e25-9cde-58a3673bcedd	homepage	{"hero": {"title": {"en": "", "it": ""}, "ctaText": {"en": "", "it": ""}, "subtitle": {"en": "", "it": ""}, "backgroundImages": ["https://images.unsplash.com/photo-1545324418-cc1a3fa00c00?w=1920", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920"]}, "about": {"title": {"en": "Made About Venice Parcley", "it": "Chi Siamo"}, "content": {"en": "We connect art lovers with extraordinary living spaces in Venice, offering a unique blend of luxury accommodation and artistic inspiration.", "it": "Connettiamo gli amanti dell'arte con spazi abitativi straordinari a Venezia, offrendo un mix unico di alloggi di lusso e ispirazione artistica."}}, "intro": {"title": {"en": "", "it": ""}, "tagline": {"en": "", "it": ""}, "description": {"en": "", "it": ""}}, "featured": {"title": {"en": "", "it": ""}, "description": {"en": "", "it": ""}}}	18	691769f3-9978-472b-9fb5-62c15543d7d9	2026-04-19 14:45:20.091607+00
f9b8a621-2525-4a42-aa98-ebec0f57c1a3	2c909497-399d-4e25-9cde-58a3673bcedd	homepage	{"hero": {"title": {"en": "", "it": ""}, "ctaText": {"en": "", "it": ""}, "subtitle": {"en": "", "it": ""}, "backgroundImages": ["https://images.unsplash.com/photo-1545324418-cc1a3fa00c00?w=1920", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920"]}, "about": {"title": {"en": "About Venice Parsley", "it": "Informazioni sul prezzemolo di Venezia"}, "content": {"en": "We connect art lovers with extraordinary living spaces in Venice, offering a unique blend of luxury accommodation and artistic inspiration.", "it": "Connettiamo gli amanti dell'arte con spazi abitativi straordinari a Venezia, offrendo un mix unico di alloggi di lusso e ispirazione artistica."}}, "intro": {"title": {"en": "", "it": ""}, "tagline": {"en": "", "it": ""}, "description": {"en": "", "it": ""}}, "featured": {"title": {"en": "", "it": ""}, "description": {"en": "", "it": ""}}}	20	691769f3-9978-472b-9fb5-62c15543d7d9	2026-04-19 14:52:36.900781+00
f43743c5-f7ac-413a-8199-e5beb36c869b	2c909497-399d-4e25-9cde-58a3673bcedd	homepage	{"hero": {"title": {"en": "", "it": ""}, "ctaText": {"en": "", "it": ""}, "subtitle": {"en": "", "it": ""}, "backgroundImages": ["https://images.unsplash.com/photo-1545324418-cc1a3fa00c00?w=1920", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920"]}, "about": {"title": {"en": "", "it": ""}, "content": {"en": "", "it": ""}}, "intro": {"title": {"en": "Life in the Heart of Venice.", "it": "Vita nel cuore di Venezia."}, "tagline": {"en": "SHORELINE VIBES", "it": "ATMOSFERA DI COSTA"}, "description": {"en": "Intimate stays where timeless Venetian character meets understated contemporary living elegance. Central. Private. Effortless.", "it": "Soggiorni intimi dove il fascino intramontabile di Venezia incontra la sobria eleganza del vivere contemporaneo. Centrale. Riservato. Senza sforzo."}}, "featured": {"title": {"en": "", "it": ""}, "description": {"en": "", "it": ""}}}	22	691769f3-9978-472b-9fb5-62c15543d7d9	2026-04-19 14:56:55.070683+00
a73b26fe-0f99-494f-bfba-c2864cb38c39	2c909497-399d-4e25-9cde-58a3673bcedd	homepage	{"hero": {"title": {"en": "", "it": ""}, "ctaText": {"en": "", "it": ""}, "subtitle": {"en": "", "it": ""}, "backgroundImages": ["https://images.unsplash.com/photo-1545324418-cc1a3fa00c00?w=1920", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920"]}, "about": {"title": {"en": "About Venice Parsley", "it": "Informazioni sul prezzemolo di Venezia"}, "content": {"en": "We connect art lovers with extraordinary living spaces in Venice, offering a unique and artistic inspiration.", "it": "Mettiamo in contatto gli amanti dell'arte con straordinari spazi abitativi a Venezia, offrendo un'ispirazione artistica unica."}}, "intro": {"title": {"en": "", "it": ""}, "tagline": {"en": "", "it": ""}, "description": {"en": "", "it": ""}}, "featured": {"title": {"en": "", "it": ""}, "description": {"en": "", "it": ""}}}	24	691769f3-9978-472b-9fb5-62c15543d7d9	2026-04-19 15:03:34.701079+00
e462cd35-307a-4b2d-b11b-21266ebbb364	2c909497-399d-4e25-9cde-58a3673bcedd	homepage	{"hero": {"title": {"en": "Discover Artistic Living Spaces", "it": "Scopri Spazi di Vita Artistici"}, "ctaText": {"en": "Explore Apartments", "it": "Esplora Appartamenti"}, "subtitle": {"en": "Luxury apartments designed for art lovers and creative souls", "it": "Appartamenti di lusso progettati per amanti dell'arte e anime creative"}, "backgroundImages": ["https://images.unsplash.com/photo-1545324418-cc1a3fa00c00?w=1920", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920"]}, "about": {"title": {"en": "About Venice Parcley", "it": "A proposito del prezzemolo di Venezia"}, "content": {"en": "We connect art lovers with extraordinary living spaces in Venice, offering a unique blend of luxury accommodation and artistic inspiration.", "it": "Mettiamo in contatto gli amanti dell'arte con straordinari spazi abitativi a Venezia, offrendo una miscela unica di alloggi di lusso e ispirazione artistica."}}, "intro": {"title": {"en": "Life in the Heart of Venice.", "it": "La vita nel cuore di Venezia."}, "tagline": {"en": "SHORELINE VIBES", "it": "SHORELINE VIBES"}, "description": {"en": "Intimate stays where timeless Venetian character meets understated contemporary living elegance. Central. Private. Effortless.", "it": "Soggiorni intimi dove il carattere veneziano senza tempo incontra la sobria eleganza abitativa contemporanea. Centrale. Privato. Senza sforzo."}}, "featured": {"title": {"en": "Featured Apartments", "it": "Appartamenti in vetrina"}, "description": {"en": "Designed for discerning travelers, each residence offers a calm and curated atmosphere, just steps from the citys most iconic landmarks.\\r\\nThoughtful details, refined materials, and a sense of quiet exclusivity.", "it": "Progettate per i viaggiatori più esigenti, ogni residenza offre un'atmosfera tranquilla e curata, a pochi passi dai monumenti più iconici della città.\\r\\nDettagli attenti, materiali raffinati e un senso di silenziosa esclusività."}}}	27	691769f3-9978-472b-9fb5-62c15543d7d9	2026-04-19 22:36:43.400104+00
edc9afba-d71c-4cbf-a67d-e2bf1de9acc6	2c909497-399d-4e25-9cde-58a3673bcedd	homepage	{"hero": {"title": {"en": "Discover Artistic Living Spaces", "it": "Scopri Spazi di Vita Artistici"}, "ctaText": {"en": "Explore Apartments", "it": "Esplora gli appartamenti"}, "subtitle": {"en": "Luxury apartments designed for art lovers and creative souls", "it": "Appartamenti di lusso progettati per amanti dell'arte e anime creative"}, "backgroundImages": ["https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/homepage-hero/0db998d0-570f-4cdd-a9af-ae80a724fb81-1776638272353.jpg", "https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/homepage-hero/937b3611-3033-4fc3-a59c-4cd366605329-1776638273628.jpg", "https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/homepage-hero/19791fc6-fa7f-42ae-9ea6-f3a07610aeff-1776638275170.jpg"]}, "about": {"title": {"en": "About Venice Parcley", "it": "A proposito del prezzemolo di Venezia"}, "content": {"en": "We connect art lovers with extraordinary living spaces in Venice, offering a unique blend of luxury accommodation and artistic inspiration.", "it": "Mettiamo in contatto gli amanti dell'arte con straordinari spazi abitativi a Venezia, offrendo una miscela unica di alloggi di lusso e ispirazione artistica."}}, "intro": {"title": {"en": "Life in the Heart of Venice.", "it": "La vita nel cuore di Venezia."}, "tagline": {"en": "SHORELINE VIBES", "it": "SHORELINE VIBES"}, "description": {"en": "Intimate stays where timeless Venetian character meets understated contemporary living elegance. Central. Private. Effortless.", "it": "Soggiorni intimi dove il carattere veneziano senza tempo incontra la sobria eleganza abitativa contemporanea. Centrale. Privato. Senza sforzo."}}, "featured": {"title": {"en": "Featured Apartments", "it": "Appartamenti in vetrina"}, "description": {"en": "Designed for discerning travelers, each residence offers a calm and curated atmosphere, just steps from the citys most iconic landmarks.\\r\\nThoughtful details, refined materials, and a sense of quiet exclusivity.", "it": "Progettate per i viaggiatori più esigenti, ogni residenza offre un'atmosfera tranquilla e curata, a pochi passi dai monumenti più iconici della città.\\r\\nDettagli attenti, materiali raffinati e un senso di silenziosa esclusività."}}}	29	691769f3-9978-472b-9fb5-62c15543d7d9	2026-04-19 22:38:40.170338+00
87c222c0-040f-439e-869c-a408db6cbebe	2c909497-399d-4e25-9cde-58a3673bcedd	homepage	{"hero": {"title": {"en": "Discover Artistic Living Spaces", "it": "Scopri Spazi di Vita Artistici"}, "ctaText": {"en": "Explore Apartments", "it": "Esplora gli appartamenti"}, "subtitle": {"en": "Luxury apartments designed for art lovers and creative souls", "it": "Appartamenti di lusso progettati per amanti dell'arte e anime creative"}, "backgroundImages": ["https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/homepage-hero/0db998d0-570f-4cdd-a9af-ae80a724fb81-1776638272353.jpg", "https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/homepage-hero/937b3611-3033-4fc3-a59c-4cd366605329-1776638273628.jpg", "https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/homepage-hero/19791fc6-fa7f-42ae-9ea6-f3a07610aeff-1776638275170.jpg"]}, "about": {"title": {"en": "About Venice Parcley", "it": "A proposito del prezzemolo di Venezia"}, "content": {"en": "We connect art lovers with extraordinary living spaces in Venice, offering a unique blend of luxury accommodation and artistic inspiration.", "it": "Mettiamo in contatto gli amanti dell'arte con straordinari spazi abitativi a Venezia, offrendo una miscela unica di alloggi di lusso e ispirazione artistica."}}, "intro": {"title": {"en": "Life in the Heart of Venice.", "it": "La vita nel cuore di Venezia."}, "tagline": {"en": "SHORELINE VIBES", "it": "SHORELINE VIBES"}, "description": {"en": "Intimate stays where timeless Venetian character meets understated contemporary living elegance. Central. Private. Effortless.", "it": "Soggiorni intimi dove il carattere veneziano senza tempo incontra la sobria eleganza abitativa contemporanea. Centrale. Privato. Senza sforzo."}}, "featured": {"title": {"en": "Featured Apartments", "it": "Appartamenti in vetrina"}, "description": {"en": "Designed for discerning travelers, each residence offers a calm and curated atmosphere, just steps from the citys most iconic landmarks.\\r\\nThoughtful details, refined materials, and a sense of quiet exclusivity.", "it": "Progettate per i viaggiatori più esigenti, ogni residenza offre un'atmosfera tranquilla e curata, a pochi passi dai monumenti più iconici della città.\\r\\nDettagli attenti, materiali raffinati e un senso di silenziosa esclusività."}}}	31	691769f3-9978-472b-9fb5-62c15543d7d9	2026-04-19 22:42:57.58537+00
84c0cf46-2ef1-4846-a08a-976fb7a463a2	2c909497-399d-4e25-9cde-58a3673bcedd	homepage	{"hero": {"title": {"en": "Discover Artistic Living Spaces", "it": "Scopri Spazi di Vita Artistici"}, "ctaText": {"en": "Explore Apartments", "it": "Esplora Appartamenti"}, "subtitle": {"en": "Luxury apartments designed for art lovers and creative souls", "it": "Appartamenti di lusso progettati per amanti dell'arte e anime creative"}, "backgroundImages": ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1920"]}, "about": {"title": {"en": "About Venice Parcley", "it": "Chi Siamo"}, "content": {"en": "We connect art lovers with extraordinary living spaces in Venice, offering a unique blend of luxury accommodation and artistic inspiration.", "it": "Connettiamo gli amanti dell'arte con spazi abitativi straordinari a Venezia, offrendo un mix unico di alloggi di lusso e ispirazione artistica."}}, "intro": {"title": {"en": "Life at Shoreline, wrapped in artful calm and cinematic sea light.", "it": "Life at Shoreline, wrapped in artful calm and cinematic sea light."}, "tagline": {"en": "SHORELINE VIBES", "it": "SHORELINE VIBES"}, "description": {"en": "Drift through curated spaces, coastal textures, and boutique rhythms designed for guests who savor design-forward stays.", "it": "Drift through curated spaces, coastal textures, and boutique rhythms designed for guests who savor design-forward stays."}}, "featured": {"title": {"en": "Featured Apartments", "it": "Appartamenti in Evidenza"}, "description": {"en": "Experience Venice like never before in our carefully curated collection of artistic apartments.", "it": "Vivi Venezia come mai prima d'ora nella nostra collezione curata di appartamenti artistici."}}}	38	691769f3-9978-472b-9fb5-62c15543d7d9	2026-04-20 03:14:19.765481+00
617c77c1-550c-484e-a332-b2ec12fbd212	2c909497-399d-4e25-9cde-58a3673bcedd	homepage	{"hero": {"title": {"en": "Discover Artistic Living Spaces", "it": "Scopri Spazi di Vita Artistici"}, "ctaText": {"en": "Explore Apartments", "it": "Esplora Appartamenti"}, "subtitle": {"en": "Luxury apartments designed for art lovers and creative souls", "it": "Appartamenti di lusso progettati per amanti dell'arte e anime creative"}, "backgroundImages": ["https://images.unsplash.com/photo-1545324418-cc1a3fa00c00?w=1920", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1920"]}, "about": {"title": {"en": "About Venice Parcley", "it": "Chi Siamo"}, "content": {"en": "We connect art lovers with extraordinary living spaces in Venice, offering a unique blend of luxury accommodation and artistic inspiration.", "it": "Connettiamo gli amanti dell'arte con spazi abitativi straordinari a Venezia, offrendo un mix unico di alloggi di lusso e ispirazione artistica."}}, "intro": {"title": {"en": "Life at Shoreline, wrapped in artful calm and cinematic sea light.", "it": "Life at Shoreline, wrapped in artful calm and cinematic sea light."}, "tagline": {"en": "SHORELINE VIBES", "it": "SHORELINE VIBES"}, "description": {"en": "Drift through curated spaces, coastal textures, and boutique rhythms designed for guests who savor design-forward stays.", "it": "Drift through curated spaces, coastal textures, and boutique rhythms designed for guests who savor design-forward stays."}}, "featured": {"title": {"en": "Featured Apartments", "it": "Appartamenti in Evidenza"}, "description": {"en": "Experience Venice like never before in our carefully curated collection of artistic apartments.", "it": "Vivi Venezia come mai prima d'ora nella nostra collezione curata di appartamenti artistici."}}}	48	691769f3-9978-472b-9fb5-62c15543d7d9	2026-04-20 05:00:07.931501+00
e6ef53a7-8852-4ebe-bcf0-726b4e751bd3	2c909497-399d-4e25-9cde-58a3673bcedd	homepage	{"hero": {"title": {"en": "Discover Artistic Living Spaces", "it": "Scopri Spazi di Vita Artistici"}, "ctaText": {"en": "Explore Apartments", "it": "Esplora Appartamenti"}, "subtitle": {"en": "Luxury apartments designed for art lovers and creative souls", "it": "Appartamenti di lusso progettati per amanti dell'arte e anime creative"}, "backgroundImages": ["https://images.unsplash.com/photo-1545324418-cc1a3fa00c00?w=1920", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1920"]}, "about": {"title": {"en": "About Venice Parcley", "it": "Chi Siamo"}, "content": {"en": "We connect art lovers with extraordinary living spaces in Venice, offering a unique blend of luxury accommodation and artistic inspiration.", "it": "Connettiamo gli amanti dell'arte con spazi abitativi straordinari a Venezia, offrendo un mix unico di alloggi di lusso e ispirazione artistica."}}, "intro": {"title": {"en": "Life at Shoreline, wrapped in artful calm and cinematic sea light.", "it": "Life at Shoreline, wrapped in artful calm and cinematic sea light."}, "tagline": {"en": "SHORELINE VIBES", "it": "SHORELINE VIBES"}, "description": {"en": "Drift through curated spaces, coastal textures, and boutique rhythms designed for guests who savor design-forward stays.", "it": "Drift through curated spaces, coastal textures, and boutique rhythms designed for guests who savor design-forward stays."}}, "featured": {"title": {"en": "Featured Apartments", "it": "Appartamenti in Evidenza"}, "description": {"en": "Experience Venice like never before in our carefully curated collection of artistic apartments.", "it": "Vivi Venezia come mai prima d'ora nella nostra collezione curata di appartamenti artistici."}}}	50	691769f3-9978-472b-9fb5-62c15543d7d9	2026-04-20 05:13:32.990691+00
49ee42c1-626d-4cce-8459-2c2f1b02bdda	2c909497-399d-4e25-9cde-58a3673bcedd	homepage	{"hero": {"title": {"en": "Discover Artistic Living Spaces", "it": "Scopri Spazi di Vita Artistici"}, "ctaText": {"en": "Explore Apartments", "it": "Esplora Appartamenti"}, "subtitle": {"en": "Luxury apartments designed for art lovers and creative souls", "it": "Appartamenti di lusso progettati per amanti dell'arte e anime creative"}, "backgroundImages": ["https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/homepage-hero/be12c7e0-6a95-4ca6-89d7-073f42f23626-1776662266188.webp"]}, "about": {"title": {"en": "About Venice Parcley", "it": "Chi Siamo"}, "content": {"en": "We connect art lovers with extraordinary living spaces in Venice, offering a unique blend of luxury accommodation and artistic inspiration.", "it": "Connettiamo gli amanti dell'arte con spazi abitativi straordinari a Venezia, offrendo un mix unico di alloggi di lusso e ispirazione artistica."}}, "intro": {"title": {"en": "Life at Shoreline, wrapped in artful calm and cinematic sea light.", "it": "Life at Shoreline, wrapped in artful calm and cinematic sea light."}, "tagline": {"en": "SHORELINE VIBES", "it": "SHORELINE VIBES"}, "description": {"en": "Drift through curated spaces, coastal textures, and boutique rhythms designed for guests who savor design-forward stays.", "it": "Drift through curated spaces, coastal textures, and boutique rhythms designed for guests who savor design-forward stays."}}, "featured": {"title": {"en": "Featured Apartments", "it": "Appartamenti in Evidenza"}, "description": {"en": "Experience Venice like never before in our carefully curated collection of artistic apartments.", "it": "Vivi Venezia come mai prima d'ora nella nostra collezione curata di appartamenti artistici."}}}	52	691769f3-9978-472b-9fb5-62c15543d7d9	2026-04-20 05:18:04.637734+00
c20b3423-a1c5-4cbc-a391-c80ddfcdb5a6	2c909497-399d-4e25-9cde-58a3673bcedd	homepage	{"hero": {"title": {"en": "Discover Artistic Living Spaces", "it": "Scopri Spazi di Vita Artistici"}, "ctaText": {"en": "Explore Apartments", "it": "Esplora Appartamenti"}, "subtitle": {"en": "Luxury apartments designed for art lovers and creative souls", "it": "Appartamenti di lusso progettati per amanti dell'arte e anime creative"}, "backgroundImages": ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1920"]}, "about": {"title": {"en": "About Venice Parcley", "it": "Chi Siamo"}, "content": {"en": "We connect art lovers with extraordinary living spaces in Venice, offering a unique blend of luxury accommodation and artistic inspiration.", "it": "Connettiamo gli amanti dell'arte con spazi abitativi straordinari a Venezia, offrendo un mix unico di alloggi di lusso e ispirazione artistica."}}, "intro": {"title": {"en": "Life at Shoreline, wrapped in artful calm and cinematic sea light.", "it": "Life at Shoreline, wrapped in artful calm and cinematic sea light."}, "tagline": {"en": "SHORELINE VIBES", "it": "SHORELINE VIBES"}, "description": {"en": "Drift through curated spaces, coastal textures, and boutique rhythms designed for guests who savor design-forward stays.", "it": "Drift through curated spaces, coastal textures, and boutique rhythms designed for guests who savor design-forward stays."}}, "featured": {"title": {"en": "Featured Apartments", "it": "Appartamenti in Evidenza"}, "description": {"en": "Experience Venice like never before in our carefully curated collection of artistic apartments.", "it": "Vivi Venezia come mai prima d'ora nella nostra collezione curata di appartamenti artistici."}}}	56	691769f3-9978-472b-9fb5-62c15543d7d9	2026-04-20 07:52:30.551824+00
\.


--
-- Data for Name: content_sections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.content_sections (id, key, payload, status, version, created_by, updated_by, created_at, updated_at) FROM stdin;
2c909497-399d-4e25-9cde-58a3673bcedd	homepage	{"hero": {"title": {"en": "Discover Artistic Living Spaces", "it": "Scopri Spazi di Vita Artistici"}, "ctaText": {"en": "Explore Apartments", "it": "Esplora Appartamenti"}, "subtitle": {"en": "Luxury apartments designed for art lovers and creative souls", "it": "Appartamenti di lusso progettati per amanti dell'arte e anime creative"}, "backgroundImages": ["https://images.unsplash.com/photo-1545324418-cc1a3fa00c00?w=1920", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920"]}, "about": {"title": {"en": "About Venice Parsley", "it": "Chi Siamo"}, "content": {"en": "Extraordinary living spaces in Venice, offering a unique blend of luxury accommodation and artistic inspiration.", "it": "Spazi abitativi straordinari a Venezia, offrendo un mix unico di alloggi di lusso e ispirazione artistica."}}, "intro": {"title": {"en": "Life at Shoreline, wrapped in artful calm and cinematic sea light.", "it": "Life at Shoreline, wrapped in artful calm and cinematic sea light."}, "tagline": {"en": "SHORELINE VIBES", "it": "SHORELINE VIBES"}, "description": {"en": "Drift through curated spaces, coastal textures, and boutique rhythms designed for guests who savor design-forward stays.", "it": "Drift through curated spaces, coastal textures, and boutique rhythms designed for guests who savor design-forward stays."}}, "featured": {"title": {"en": "Featured Apartments", "it": "Appartamenti in Evidenza"}, "description": {"en": "Experience Venice like never before in our carefully curated collection of artistic apartments.", "it": "Vivi Venezia come mai prima d'ora nella nostra collezione curata di appartamenti artistici."}}}	published	73	\N	691769f3-9978-472b-9fb5-62c15543d7d9	2026-04-19 13:25:13.489014+00	2026-04-21 02:32:50.803537+00
\.


--
-- Data for Name: database-schema; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."database-schema" (id, created_at) FROM stdin;
\.


--
-- Data for Name: loyalty_points; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.loyalty_points (id, user_id, points, type, booking_id, description, created_at) FROM stdin;
\.


--
-- Data for Name: menu_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.menu_items (id, label, href, is_active, sort_order, created_at, updated_at, content, map_embed) FROM stdin;
cd12998a-97a6-4bd7-ba6b-7ae2a96867d8	How to get here	/how-to-get-here	t	4	2026-04-17 13:45:21.941841+00	2026-04-21 06:42:02.123164+00	✈️ From Venice Marco Polo Airport:\nOPTION 1 — Water Taxi (fast + cinematic ~30 min)\nDirect to the canal dock just 20 meters from the home door.\nA bit expensive, but it feels like arriving in a film\n\nOPTION 2 — Alilaguna Boat (practical + scenic\n~ 50 min)\nTake the Blue line toward central Venice\nGet off at F.ta Nove and walk ~3 minutes.\n\n🚆 From Venice Santa Lucia train Station:\nOPTION 1 — Vaporetto (water bus -30 minutes)\nLine 1 or 2 along the Grand Canal\nGet off at Rialto, then walk ~7 minutes\nLine 4.2 or 5.2 \nGet off at F.ta Nove then walk ~3 minutes\n\nOPTION 2 — Walk (if you travel light \n~40 min)\nA maze, but a beautiful one\n\nTip: Follow GPS, but don’t trust it blindly. In Venice, being slightly lost is not a problem… It’s part of the design.	<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2679.1311996027594!2d12.340713100000002!3d45.4412177!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x477eb1315b93fbe1%3A0x611547f40d2da94!2sVenice%20Parsley!5e1!3m2!1sen!2sid!4v1776737193593!5m2!1sen!2sid" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
c4420c8a-0aa0-468f-89da-63a3c2ee5fe6	About	/about	t	1	2026-04-17 13:45:21.941841+00	2026-04-22 14:53:47.540737+00	Ciao !! xx\n\nSiamo Marcello e Michela (Martino, Metello e Mario i nostri figli) viviamo e lavoriamo a Ubud, Bali (Indonesia) .... e siamo innamorati di Venezia !\n\nI nostri appartamenti sono nel cuore della Venezia popolare a due passi da Rialto (7 minuti), Piazza S. Marco (15 minuti) e Basilica SS. Giovanni e Paolo (3 minuti). Posizione perfetta per visitare tutta la città. \nGli appartamenti sono in una zona estremamente silenziosa e tranquilla. La nostra calle è chiusa, si affaccia sulla laguna nord di Venezia e quindi l’unico passaggio pedonale è dei pochi residenti soltanto. Non ci sono attività commerciali o ristoranti nelle immediate vicinanze … dormirete sonni tranquilli!! \n\nTroverete una cucina moderna e attrezzata e Wi-Fi veloce. \nCa' BIRI e Ca' TERA' hanno due camere da letto in ogni appartamento di cui una flessibile che si trasforma da matrimoniale (o 2 letti singoli) in soggiorno con due divani (fateci sapere la vostra disposizione preferita).\nOgni camera da letto è dotata di smart TV  e aria condizionata. \nCa' ASIA, invece, ha 3 camere da letto e 3 bagni e una grande sala TV con altana esclusiva, perfetta per colazioni e aperitivi o solamente per osservare con serenità la città dall'alto.\nLettino e seggiolone per bambini sono a disposizione, previa richiesta, senza costi aggiuntivi.\n\nVicinissimi all’imbarcadero del vaporetto di Fondamenta Nove (3 minuti – tutte le destinazioni e aliscafo da e per l’aeroporto) e circondati da ottimi ristoranti e bar. Accanto all’appartamento anche farmacia e lavanderia automatica (3 minuti).\nCom’e stato il tuo soggiorno?\n\nCerchiamo in tutti i modi di migliorare il nostro servizio e ci farebbe molto piacere sapere cosa pensi!\n\nSe Venice Parsley ha raggiunto (o superato) le tue aspettative, una recensione positiva sarebbe veramente importante per noi:\n\nGoogle review\n\nSe ci fosse invece qualcosa da migliorare scrivici un'email e faremo il possibile per perfezionare il nostro servizio seguendo i tuoi preziosi consigli.\n\n	
a6d821f6-6b3d-4399-baed-0d950baeb9d4	Neighbourhood	/neighbourhood	t	3	2026-04-17 13:45:21.941841+00	2026-04-21 02:09:22.038184+00	Cannareggio is a very large district on the northernmost part of the historic center of Venice.\n\n\nIt is, partially, a busy area, as many cross it only to go from the land landings to Rialto and San Marco, leaving out the most internal and particular part of the district.\n\n\nIt is an area absolutely worth discovering because it reserves secluded and little-frequented stunning corners, lived only by Venetians in their daily life. The places of interest are countless: the Ghetto, the churches of Sant'Alvise, the Madonna dell'Orto, the Jesuits, Fondamenta de la Sensa, the Sacca della Misericordia, etc.\n\n\nCannareggio is full of excellent restaurants and bacari (a type of popular Venetian tavern with a wide selection of wines by the glass and the typical "cicchetti" snacks) ... close to home you will find many ... and we will recommend the best ones!!!\n	https://maps.app.goo.gl/ctSnjyxuq5GytmQPA
e5d047f4-f373-48b4-a109-0b2c4aa5bf5c	Contact	/contact	t	5	2026-04-17 13:45:21.941841+00	2026-04-21 02:29:43.017611+00	Rio Terà dei Biri o del Parsemolo, 5384, \n30121 Venezia VE, Italy\n\nTel. +393470630960\nE-mail info@veniceparsley.com	<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2679.1311996027594!2d12.340713100000002!3d45.4412177!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x477eb1315b93fbe1%3A0x611547f40d2da94!2sVenice%20Parsley!5e1!3m2!1sen!2sid!4v1776737193593!5m2!1sen!2sid" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
aeca895b-d39d-435c-bb8e-0d5968accebc	Apartments	/apartments	t	2	2026-04-17 13:45:21.941841+00	2026-04-18 09:59:53.395248+00	apartments page	\N
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profiles (id, email, full_name, phone, role, preferred_driver_id, notification_preferences, created_at, updated_at) FROM stdin;
9ed09247-a87c-4024-9376-3e3ca428cabb	tes@admin.com	tess	\N	admin	\N	{"sms": false, "email": true}	2026-04-12 07:14:52.806348+00	2026-04-12 07:42:46.481216+00
691769f3-9978-472b-9fb5-62c15543d7d9	made@made.com	made	\N	admin	\N	{"sms": false, "email": true}	2026-04-12 07:44:08.455027+00	2026-04-12 08:00:54.175412+00
590ccd8f-fc79-40f8-9083-f382ba41c5a0	wayan@wayan.com	wayan	\N	admin	\N	{"sms": false, "email": true}	2026-04-12 08:23:44.989335+00	2026-04-12 08:26:28.263873+00
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settings (id, key, value, created_at, updated_at) FROM stdin;
d92506bf-5551-4ff7-98d4-49bf286b8e82	theme_colors	{"footer_color": "#1b211a", "header_bg_left": "#003049", "connector_color": "from-black-400 to-beige-500", "header_bg_right": "#1b211a"}	2026-04-17 13:45:21.941841+00	2026-04-17 13:45:21.941841+00
2d1bcc38-decb-428c-a525-00ba1a2166bd	logo_settings	{"logo_active": false}	2026-04-17 13:45:21.941841+00	2026-04-17 13:45:21.941841+00
\.


--
-- Name: database-schema_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."database-schema_id_seq"', 1, false);


--
-- Name: apartments apartments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.apartments
    ADD CONSTRAINT apartments_pkey PRIMARY KEY (id);


--
-- Name: apartments apartments_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.apartments
    ADD CONSTRAINT apartments_slug_key UNIQUE (slug);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: content_revisions content_revisions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_revisions
    ADD CONSTRAINT content_revisions_pkey PRIMARY KEY (id);


--
-- Name: content_sections content_sections_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_sections
    ADD CONSTRAINT content_sections_key_key UNIQUE (key);


--
-- Name: content_sections content_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_sections
    ADD CONSTRAINT content_sections_pkey PRIMARY KEY (id);


--
-- Name: database-schema database-schema_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."database-schema"
    ADD CONSTRAINT "database-schema_pkey" PRIMARY KEY (id);


--
-- Name: loyalty_points loyalty_points_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_points
    ADD CONSTRAINT loyalty_points_pkey PRIMARY KEY (id);


--
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: settings settings_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_key_key UNIQUE (key);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: idx_bookings_apartment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_apartment ON public.bookings USING btree (apartment_id);


--
-- Name: idx_bookings_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_dates ON public.bookings USING btree (check_in_date, check_out_date);


--
-- Name: idx_bookings_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_status ON public.bookings USING btree (status);


--
-- Name: idx_bookings_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_user ON public.bookings USING btree (user_id);


--
-- Name: idx_content_revisions_section; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_revisions_section ON public.content_revisions USING btree (section_id, version DESC);


--
-- Name: idx_content_sections_key_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_sections_key_status ON public.content_sections USING btree (key, status);


--
-- Name: idx_loyalty_points_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_loyalty_points_user ON public.loyalty_points USING btree (user_id);


--
-- Name: idx_menu_items_active_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menu_items_active_order ON public.menu_items USING btree (is_active, sort_order);


--
-- Name: idx_profiles_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_email ON public.profiles USING btree (email);


--
-- Name: apartments update_apartments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_apartments_updated_at BEFORE UPDATE ON public.apartments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: content_sections update_content_sections_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_content_sections_updated_at BEFORE UPDATE ON public.content_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: menu_items update_menu_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: bookings bookings_apartment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_apartment_id_fkey FOREIGN KEY (apartment_id) REFERENCES public.apartments(id);


--
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: content_revisions content_revisions_published_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_revisions
    ADD CONSTRAINT content_revisions_published_by_fkey FOREIGN KEY (published_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: content_revisions content_revisions_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_revisions
    ADD CONSTRAINT content_revisions_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.content_sections(id) ON DELETE CASCADE;


--
-- Name: content_sections content_sections_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_sections
    ADD CONSTRAINT content_sections_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: content_sections content_sections_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_sections
    ADD CONSTRAINT content_sections_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: loyalty_points loyalty_points_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_points
    ADD CONSTRAINT loyalty_points_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: loyalty_points loyalty_points_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_points
    ADD CONSTRAINT loyalty_points_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: content_sections Admins can manage content sections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage content sections" ON public.content_sections USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: menu_items Admins can manage menu items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage menu items" ON public.menu_items USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: settings Admins can manage settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage settings" ON public.settings USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: content_revisions Admins can read revisions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can read revisions" ON public.content_revisions FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: apartments Apartments are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Apartments are viewable by everyone" ON public.apartments FOR SELECT USING ((is_active = true));


--
-- Name: menu_items Menu items are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Menu items are viewable by everyone" ON public.menu_items FOR SELECT USING (true);


--
-- Name: content_sections Published content is viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Published content is viewable by everyone" ON public.content_sections FOR SELECT USING ((status = 'published'::text));


--
-- Name: settings Settings are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Settings are viewable by everyone" ON public.settings FOR SELECT USING (true);


--
-- Name: bookings Users can create their own bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own bookings" ON public.bookings FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: loyalty_points Users can insert their own loyalty points; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own loyalty points" ON public.loyalty_points FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: bookings Users can update their own bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own bookings" ON public.bookings FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: bookings Users can view their own bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: loyalty_points Users can view their own loyalty points; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own loyalty points" ON public.loyalty_points FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: apartments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.apartments ENABLE ROW LEVEL SECURITY;

--
-- Name: bookings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

--
-- Name: content_revisions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.content_revisions ENABLE ROW LEVEL SECURITY;

--
-- Name: content_sections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.content_sections ENABLE ROW LEVEL SECURITY;

--
-- Name: database-schema; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."database-schema" ENABLE ROW LEVEL SECURITY;

--
-- Name: loyalty_points; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;

--
-- Name: menu_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict rIbwMLOooXsQTSu5fM5IQt2dfic3dyrCaA882KtUm0npAt5xdixts469Y6tz9FN

