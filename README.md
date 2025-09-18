# Next.js + Shadcn UI Project

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) and configured with [Shadcn UI](https://ui.shadcn.com/) components.

## 🚀 Features

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Shadcn UI** components library
- **ESLint** for code quality
- **Dark mode** support

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd shad-label
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

5. Visit [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to see the complete dashboard template.

## 🎨 Shadcn UI Components

This project comes pre-configured with a complete dashboard template and many Shadcn UI components:

### Dashboard Template
- **Complete Dashboard** - Full-featured dashboard with sidebar, charts, and data tables
- **Interactive Charts** - Area charts with interactive features
- **Data Tables** - Sortable and filterable data tables
- **Sidebar Navigation** - Collapsible sidebar with navigation
- **Responsive Design** - Mobile-friendly layout

### UI Components
- **Button** - Various button styles and sizes
- **Card** - Container components with header, content, and description
- **Input** - Form input components
- **Label** - Form label components
- **Avatar** - User profile images
- **Badge** - Status indicators
- **Table** - Data display tables
- **Chart** - Data visualization components
- **Sidebar** - Navigation sidebar
- **Tabs** - Tabbed content organization
- **Dropdown Menu** - Context menus
- **Tooltip** - Hover information
- **Sheet** - Slide-out panels
- **Drawer** - Mobile-friendly drawers
- **Skeleton** - Loading placeholders
- **Toast** - Notification system

### Adding More Components

To add more Shadcn UI components, use the CLI:

```bash
npx shadcn@latest add [component-name]
```

For example:
```bash
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add toast
```

### Available Components

Visit the [Shadcn UI Components](https://ui.shadcn.com/docs/components) page to see all available components.

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css      # Global styles and CSS variables
│   ├── layout.tsx       # Root layout component
│   └── page.tsx         # Home page
├── components/
│   └── ui/              # Shadcn UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── label.tsx
└── lib/
    └── utils.ts         # Utility functions
```

## 🎯 Usage Examples

### Using Button Component

```tsx
import { Button } from "@/components/ui/button";

export default function MyComponent() {
  return (
    <div>
      <Button>Default Button</Button>
      <Button variant="outline">Outline Button</Button>
      <Button variant="destructive">Destructive Button</Button>
    </div>
  );
}
```

### Using Card Component

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MyCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here</p>
      </CardContent>
    </Card>
  );
}
```

## 🎨 Theming

The project uses CSS variables for theming. You can customize the theme by modifying the variables in `src/app/globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... other variables */
}
```

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Shadcn UI Documentation](https://ui.shadcn.com/) - learn about Shadcn UI components
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - learn about Tailwind CSS
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - learn about TypeScript

## 🚀 Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
