# Add PureCinematicGallery to About page & redesign Buy Tickets page

## Goal Description
We will integrate the newly created `PureCinematicGallery` component into the About page, ensuring it renders correctly and provides a premium cinematic experience. After integration, we will run the development server (`npm run dev`) to preview the changes locally and fine‑tune layout, animation, and cursor interactions. Finally, we will apply a similar premium visual redesign to the **Buy Tickets** page, creating a dedicated component that mirrors the cinematic style while respecting all constraints (no changes to routing, authentication, payment, etc.).

## User Review Required
- **Buy Tickets page redesign scope**: Confirm the visual direction (e.g., hero video, photo strip, interactive elements) and any specific assets you want to use.
- **Animation preferences**: Let us know if you prefer certain reveal effects over others (mask, curtain, zoom, blur, slide, clip‑path) for the About page photos.
- **Cursor interaction**: Confirm if the custom "VIEW" cursor should appear on desktop only and its style.
- **Responsive behavior**: Any breakpoints or mobile‑specific adjustments you’d like?

> [!IMPORTANT] Ensure the redesign does not modify any global layout, navigation, authentication, payment integration, or data models.

## Open Questions
- Do you want the Buy Tickets page to include a similar video centerpiece as the About page, or a different hero?
- Should the Buy Tickets page reuse the same photo assets, or have a distinct set?
- Are there any brand colors or gradients you want to emphasize on the Buy Tickets page?
- Do you need any custom CTA styling for the ticket purchase button beyond existing global styles?

## Proposed Changes
---
### About Page (src/app/about/page.tsx)
- Import `PureCinematicGallery`.
- Replace the archival video section (lines 103‑116) with `<PureCinematicGallery />`.
- Adjust surrounding spacing/layout to match the new component.
- Ensure the page imports `React` if needed.

### Buy Tickets Page (src/app/buy-tickets/page.tsx or appropriate route)
- Create new component `PremiumTicketGallery.tsx` (similar to `PureCinematicGallery` but tailored for ticketing visuals).
- Update the Buy Tickets page to import and render this component, replacing the existing static layout.
- Add any required CSS classes to `globals.css` for the premium theme (e.g., gradients, glassmorphism).

### Shared Components / Styles
- Add any required Tailwind utility classes or custom CSS for glass‑morphism and gradient backgrounds.
- Create a reusable `CinematicSection` wrapper if needed for both pages.

## Verification Plan
### Automated Tests
- Run `npm run lint` to ensure no TypeScript or ESLint errors.
- Run `npm run build` in CI mode to verify the build succeeds.

### Manual Verification
- Execute `npm run dev` and open `http://localhost:3001/about` to confirm the gallery displays, animations trigger, and the lightbox works.
- Open the Buy Tickets page (`http://localhost:3001/buy-tickets`) and verify the premium redesign appears and is responsive.
- Test cursor "VIEW" interaction on desktop and ensure it hides on mobile.
- Check for any layout shifts or performance issues (e.g., lazy loading of images).
