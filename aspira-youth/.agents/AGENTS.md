# Aspira Youth Project Rules

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4, `clsx`, `tailwind-merge`
- **Backend / BaaS**: Firebase (Firestore, Storage, Auth)
- **Icons**: `lucide-react`
- **Animations**: `framer-motion`
- **Rich Text**: `react-quill-new`
- **Utilities**: `date-fns` for dates, `browser-image-compression` for images

## Code Style & Architecture
- Use **Next.js App Router** conventions (`src/app`).
- Write modern **TypeScript**.
- For UI components, utilize Tailwind CSS for responsive and modern designs.
- When creating components that merge class names, use `clsx` and `tailwind-merge`.
- When uploading images to Firebase Storage, always use `browser-image-compression` to optimize image sizes before upload.
- For rich text content, use `react-quill-new` and ensure the output is properly formatted and sanitized.
- Use `framer-motion` for micro-animations and smooth page transitions to create a premium feel.

## Firebase Conventions
- Keep client-side Firebase access restricted to appropriate security rules.
- Ensure environment variables are properly loaded for Firebase initialization.
