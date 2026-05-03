-- Venice Parsley Seed Data
-- This file contains sample data for all tables except bookings
-- Run this after creating the database schema

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert sample apartments (without actual images - replace with your own)
INSERT INTO apartments (id, slug, name, description, short_description, max_guests, bedrooms, base_price_cents, image_url, gallery_images, amenities, location_details, is_active) VALUES
('739ebdf8-5ad7-46fb-aa3f-bae49305ec0d', 'ca-asia-app-1', 'Ca'' Asia - App. 1', 'A luxury residence (110 mt2) with refined design, crafted by a renowned architect and enriched with touches inspired by the elegance of Venice and the aesthetics of Asia...', 'Luxury residence with Venetian and Asian design influences', 4, 2, 65000, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'], ARRAY['WiFi', 'Air conditioning', 'Kitchen', 'Smart TV'], '{"address": "Cannaregio, Venice", "coordinates": {"lat": 45.4416, "lng": 12.3155}}', true),
('3f667c8f-1e9a-4385-9ed8-2b0cf44446d4', 'ca-biri-apt-2', 'Ca'' Biri - Apt. 2', 'A charming and contemporary apartment set in the authentic heart of Venice...', 'Charming contemporary apartment in Venice heart', 4, 2, 25000, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400', ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'], ARRAY['WiFi', 'Air conditioning', 'Kitchen', 'Smart TV'], '{"address": "Santa Croce, Venice", "coordinates": {"lat": 45.4378, "lng": 12.3215}}', true),
('d0e3aa54-8367-4f32-a6a6-d656bac9db01', 'ca-tera-apt-3', 'Ca'' Tera'' - Apt. 3', 'A charming and contemporary apartment set in the authentic heart of Venice...', 'Contemporary apartment with modern amenities', 4, 2, 95000, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400', ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'], ARRAY['WiFi', 'Air conditioning', 'Kitchen', 'Smart TV'], '{"address": "Dorsoduro, Venice", "coordinates": {"lat": 45.4315, "lng": 12.3267}}', true);

-- Insert menu items
INSERT INTO menu_items (label, href, is_active, sort_order) VALUES
('About', '/about', true, 1),
('Apartments', '/apartments', true, 2),
('Neighbourhood', '/neighbourhood', true, 3),
('How to get here', '/how-to-get-here', true, 4),
('Contact with map', '/contact', true, 5);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
('theme_colors', '{"header_bg_left": "#003049", "header_bg_right": "#1b211a", "footer_color": "#1b211a"}'),
('site_name', '"Venice Parsley"'),
('contact_email', '"info@veniceparsley.com"'),
('contact_phone', '""');

-- Insert initial content sections (homepage)
-- Synced with real homepage content as of May 2026
INSERT INTO content_sections (key, payload, status, version) VALUES
('homepage', '{
  "hero": {
    "title": {"en": "Discover Artistic Living Spaces", "it": "Scopri Spazi di Vita Artistici"},
    "subtitle": {"en": "Luxury apartments designed for art lovers and creative souls", "it": "Appartamenti di lusso progettati per amanti dell''arte e anime creative"},
    "ctaText": {"en": "Explore Apartments", "it": "Esplora Appartamenti"},
    "backgroundImages": [
      "https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/homepage-hero/0db998d0-570f-4cdd-a9af-ae80a724fb81-1776638272353.jpg",
      "https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/homepage-hero/937b3611-3033-4fc3-a59c-4cd366605329-1776638273628.jpg",
      "https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/homepage-hero/19791fc6-fa7f-42ae-9ea6-f3a07610aeff-1776638275170.jpg",
      "https://zhdmgvhwrmstapywvfmu.supabase.co/storage/v1/object/public/apartment-images/apartments/homepage-hero/be12c7e0-6a95-4ca6-89d7-073f42f23626-1776662266188.webp"
    ]
  },
  "intro": {
    "title": {"en": "An elegant, quiet retreat nestled between Venetian history and beauty.", "it": "Un elegante e tranquillo rifugio tra la storia e la bellezza di Venezia."},
    "tagline": {"en": "IN THE HEART OF VENICE", "it": "NEL CUORE DI VENEZIA"},
    "description": {"en": "Three modern apartments, thoughtfully and beautifully styled, tucked into the authentic heart of Venetian life. Just a short stroll from Rialto (7 minutes) and St. Mark's Square (15 minutes), they offer the perfect base to explore the entire city.", "it": "Tre moderni - e deliziosamente decorati - appartamenti nel cuore della Venezia popolare a due passi da Rialto (7 minuti) e Piazza S. Marco (15 minuti). Posizione perfetta per visitare tutta la città."}
  },
  "featured": {
    "title": {"en": "Our apartments", "it": "I nostri appartamenti "},
    "description": {"en": "Live Venice. Don't just visit it.", "it": "Abita Venezia, non limitarti a visitarla."}
  },
  "about": {
    "title": {"en": "About Venice Parcley", "it": "Chi Siamo"},
    "content": {"en": "We connect art lovers with extraordinary living spaces in Venice, offering a unique blend of luxury accommodation and artistic inspiration.", "it": "Connettiamo gli amanti dell'arte con spazi abitativi straordinari a Venezia, offrendo un mix unico di alloggi di lusso e ispirazione artistica."}
  }
}', 'published', 1);

INSERT INTO content_sections (key, payload, status, version) VALUES
('about', '{
  "title": {"en": "About Venice Parsley", "it": "Chi Siamo"},
  "content": {"en": "We are passionate about connecting art lovers with extraordinary living spaces in Venice. Our carefully curated collection of apartments offers a unique blend of luxury accommodation and artistic inspiration.", "it": "Siamo appassionati di collegare gli amanti dell''arte con spazi abitativi straordinari a Venezia. La nostra collezione curata di appartamenti offre un mix unico di alloggi di lusso e ispirazione artistica."},
  "mission": {"en": "Our mission is to provide unforgettable experiences that combine Venetian heritage with contemporary comfort.", "it": "La nostra missione è fornire esperienze indimenticabili che combinano il patrimonio veneziano con il comfort contemporaneo."}
}', 'published', 1);

INSERT INTO content_sections (key, payload, status, version) VALUES
('contact', '{
  "title": {"en": "Contact Us", "it": "Contattaci"},
  "address": "Venice, Italy",
  "email": "info@veniceparsley.com",
  "phone": "+39 041 123 4567",
  "description": {"en": "Get in touch with us for any inquiries about our apartments or booking assistance.", "it": "Mettiti in contatto con noi per qualsiasi domanda sui nostri appartamenti o assistenza alla prenotazione."}
}', 'published', 1);