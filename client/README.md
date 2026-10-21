# PropEstate frontend

React and Vite client for the PropEstate real-estate listing platform.

## Development

1. Set `VITE_API_URL` to the API base URL, including `/api` (for example, `http://localhost:5000/api`).
2. Install dependencies with `npm install`.
3. Start the client with `npm run dev`.

## Property listings

Visitors can browse approved listings, search by keyword, and filter by city, listing type, property type, price, area, bedrooms, and bathrooms. Listing details include photos, agent contact information, and a Leaflet/OpenStreetMap location view when coordinates are available.

Agents and admins can create listings, upload up to 10 photos, set a map pin, and manage their listings from **My Properties**. New agent listings require admin approval before they are shown publicly.

The map uses OpenStreetMap tiles and does not require a Google Maps API key.

## Bookings, enquiries, and wishlist

Signed-in buyers can request a future property visit, contact the listing agent, and save properties to their wishlist. Buyers can cancel pending or confirmed visits. Agents can review their visit requests, confirm or decline pending requests, and mark confirmed visits as completed. Confirming a visit sends an email to the buyer using the server's `EMAIL_USER` and `EMAIL_PASS` settings.

Buyers can view their bookings and sent enquiries from the account menu. Agents can use the same menu to review visit requests and property enquiries.

## Reviews, dashboards, and administration

Buyers can leave one 1–5 star review for a property after an agent marks their visit completed. Agent and buyer dashboards show role-specific totals. Admins can moderate property submissions and view platform analytics, with a CSV export that opens in Excel-compatible spreadsheet software and a print view that can be saved as PDF from the browser.
