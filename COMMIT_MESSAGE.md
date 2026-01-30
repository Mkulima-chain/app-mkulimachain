feat: Add payment method selection, shipping options, wallet auto-reconnect and seller chat

## New Features

### Payment Method Selection
- Added payment method selection in cart page
- Support for ADA (Cardano) payment with wallet connection requirement
- Support for Mobile Money (Airtel, Orange, Vodacom M-Pesa)
- Phone number input required for Mobile Money payments
- Payment validation before checkout
- Visual indicators for selected payment method

### Shipping Company Selection
- Added shipping company selection in cart
- Option to let seller choose the shipping company
- Option for buyer to select preferred shipping company
- List of transport companies (DHL, FedEx, UPS, TNT, local companies)
- Validation ensures shipping option is selected before checkout
- Shipping information included in order confirmation

### Wallet Auto-Reconnect
- Automatic wallet reconnection after page refresh
- Wallet connection state persisted in localStorage
- Checks if wallet is still available before reconnecting
- Handles errors gracefully (locked wallet, extension uninstalled)
- Silent reconnection without user interaction required

### Seller Chat System
- Product chat component for buyer-seller communication
- Chat modal accessible from product detail page
- Real-time message interface with avatars and timestamps
- Auto-scroll to latest messages
- Typing indicator for seller responses
- Intelligent auto-responses based on message content
- Support for common questions (price, shipping, quality, stock)
- Full dark mode support

## Bug Fixes

### Leaflet Map Icon Error
- Fixed "Cannot read properties of undefined (reading 'createIcon')" error
- Improved custom icon creation with proper error handling
- Added delay to ensure Leaflet is fully loaded before creating icons
- Conditional rendering of Marker only when icon is ready

### Wallet Auto-Reconnect Loop
- Fixed infinite loop in wallet auto-reconnect component
- Removed state dependency that caused re-renders
- Used useRef to prevent multiple reconnection attempts
- Improved timeout management

## Technical Improvements

- Enhanced cart page with payment and shipping selection
- Improved error handling for async wallet operations
- Better user experience with visual feedback
- Consistent styling across all new components
- Proper cleanup of timeouts and event listeners

## Modified/Created Files

New components:
- apps/web/components/product-chat.tsx
- apps/web/components/providers/wallet-auto-reconnect.tsx

Modified files:
- apps/web/app/cart/page.tsx (payment and shipping selection)
- apps/web/app/marketplace/page.tsx (chat integration)
- apps/web/app/layout.tsx (wallet auto-reconnect provider)
- apps/web/components/product-location-map.tsx (icon error fix)
- apps/web/components/providers/wallet-auto-reconnect.tsx (loop fix)
