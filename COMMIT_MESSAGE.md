feat: Add shopping cart system, complete traceability and UX improvements

## New Features

### Shopping Cart and Orders System
- Added `useCart` hook with localStorage persistence
- Cart page (/cart) with item management
- Cart integration in marketplace
- Notification badge with item count in navbar
- Cardano wallet validation before payment
- Payment blocked if wallet not connected with visual alert

### Complete Product Traceability
- `ProductTraceability` component with detailed timeline
- Blockchain hash display with copy and CardanoScan link
- Organic certification badge
- Producer information and location
- Supply chain timeline (7 steps)

### Order Traceability in Dashboard
- `OrderTraceability` component with visual progression
- 7 tracking steps: Order → Preparation → Harvest → Processing → Packaging → Shipping → Delivery
- Animated progress bar with status indicators
- Formatted dates for each completed step
- Progress counter (e.g., 5/7)

### Leaflet Location Map
- Leaflet integration to display product locations
- Custom marker with Terra Congo colors
- 2km radius circle around marker
- Enhanced popup with Google Maps and OpenStreetMap links
- Custom zoom controls
- Full dark mode support
- Location badge and "Open" button

### Enhanced Marketplace
- Multiple images per product support with gallery
- `ImageGallery` component with navigation and thumbnails
- Functional quantity selector
- "Add to cart" and "Buy now" buttons
- Toast notifications for user actions

### User Dashboard
- "My NFT Collection" section with statistics
- Display of owned NFTs with rarity badges
- Statistics: Total NFTs, Value, Legendary, Education Fund
- Recent NFTs preview in overview
- Order traceability with visual progression

### NFT Marketplace
- Image animation during audio playback
- `AudioPlayer` component for "song" type NFTs
- Audio visualizer with animated bars
- "Playing..." badge with indicators
- Shimmer and bounce effects during playback

### Authentication and UX
- Unified `AuthMenu` component to manage Google/Wallet connection
- `UserAvatar` component with user photo display
- Improved language selector
- Integrated dark mode toggle
- SessionProvider for NextAuth

## Technical Improvements

- SSR handling for Leaflet with dynamic loading
- Fixed hydration errors
- Optimized imports and exports
- Improved error handling for async components
- Custom CSS styles for Leaflet and dark mode

## Modified/Created Files

New components:
- apps/web/components/audio-player.tsx
- apps/web/components/auth-menu.tsx
- apps/web/components/image-gallery.tsx
- apps/web/components/order-traceability.tsx
- apps/web/components/product-card.tsx
- apps/web/components/product-location-map.tsx
- apps/web/components/product-traceability.tsx
- apps/web/components/user-avatar.tsx
- apps/web/hooks/use-cart.ts

New pages:
- apps/web/app/cart/page.tsx
- apps/web/app/dashboard/page.tsx
- apps/web/app/marketplace/page.tsx
- apps/web/app/marketplace/nft/page.tsx
- apps/web/app/settings/page.tsx

