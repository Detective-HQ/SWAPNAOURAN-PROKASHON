# **App Name**: Swapno Uran Prakashan

## Core Features:

- User Authentication & Authorization: Enable secure user sign-up and login (email/password) with JWT authentication to protect routes and user-specific content.
- Physical Book Browsing: Implement an infinite scroll card grid to display physical books, including book cover, title, author, publisher, and price, with an 'Add to Cart' button.
- Ebook Store with Secure Viewer: Provide a dedicated section for digital books (PDFs) with a secure viewer that unlocks after purchase, preventing direct downloads before transaction completion.
- Shopping Cart & Checkout System: Allow users to add/remove physical books from a shopping cart and proceed through a multi-step checkout flow integrated with payment services like Razorpay or Stripe.
- User Profile & Order History: Display a user's profile information (username, email), a comprehensive order history, list of purchased ebooks, and total spending analytics.
- Publisher Photo Gallery (Photo Time): Showcase publishers through a visually dynamic Pinterest-style Masonry Grid layout, accommodating various image sizes and featuring hover overlays for publisher names.
- AI Book Recommendation Tool: Utilize an AI tool to suggest personalized book recommendations to users based on their browsing activity and past purchases, enhancing content discovery.

## Style Guidelines:

- The palette strictly adheres to Bauhaus primaries: Primary Red (#D02020) for main actions, Primary Blue (#1040C0) for accents, and Primary Yellow (#F0C020) for highlights. The canvas background is Off-white (#F0F0F0) with Stark Black (#121212) for foreground elements and borders.
- Headline and body font: 'Outfit' (geometric sans-serif), leveraging its clean geometry for a constructivist feel. Typography features extreme scaling contrast for display (text-6xl to text-8xl) and body text (text-base to text-lg), with specific weights and tight tracking for headlines. Note: currently only Google Fonts are supported.
- Icons from `lucide-react` are styled with 2px to 3px stroke widths, integrated within bordered geometric containers (circles, squares) and colored to match section accents or white on colored backgrounds, ensuring strong visual presence.
- The layout is treated as a geometric composition, using a mobile-first responsive grid strategy. Sections are defined by 'bold color blocking' as backgrounds (e.g., hero, stats) and strong horizontal rhythm from 4px black borders, with geometric elements (circles, squares, triangles) integral to design, including the navigation logo.
- Animations are 'mechanical, snappy, geometric' with fast transitions (`duration-200` to `duration-300`, `ease-out`). Interactions include physical button 'presses' (translating and removing shadow), subtle card lifts on hover, and explicit icon rotations for expanded content, avoiding soft or organic movements.