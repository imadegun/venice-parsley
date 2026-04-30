// Simple script to create Venice Tips menu item
// Run this in browser console

const menuItem = {
  title: { en: 'Venice Tips and Suggestions', it: 'Consigli e Suggerimenti di Venezia' },
  href: '/venice-tips-and-suggestions',
  is_active: true,
  sort_order: 6,
  content: null,
  map_embed: null,
  image_url: null,
  documents: [],
  downloads_enabled: false
};

console.log('Creating menu item:', menuItem);
console.log('JSON payload:', JSON.stringify(menuItem));

fetch('/api/admin/menu', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(menuItem)
})
.then(response => {
  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  return response.text().then(text => {
    console.log('Response body:', text);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    try {
      return JSON.parse(text);
    } catch (e) {
      return text;
    }
  });
})
.then(data => {
  console.log('✅ Success:', data);
})
.catch(error => {
  console.error('❌ Error:', error.message);
});