# Next.js Supabase Authentication System

Modern authentication system built with Next.js 16, Supabase, Shadcn UI, and TypeScript. Features beautiful, accessible UI components with context-based state management, custom hooks, and a clean component architecture. Perfect starter template for projects requiring user authentication.

## ✨ Features

- 🔐 **Complete Authentication Flow** - Login, signup, password recovery with OTP verification
- ✉️ **Email Verification** - 6-digit OTP code verification using Resend
- 📧 **Custom Email Templates** - Beautiful emails built with React-Email
- 🛡️ **Middleware Protection** - Automatic redirect for unverified users
- 🎨 **Beautiful UI** - Built with Shadcn UI components
- ✅ **Zod Validation** - Type-safe form and data validation
- 🎯 **TypeScript** - Fully typed for better developer experience
- ⚡ **Next.js 16** - Latest Next.js features with App Router
- 🗄️ **Supabase** - Powerful backend-as-a-service
- 📱 **Responsive Design** - Works seamlessly on all devices
- ♿ **Accessibility** - WCAG compliant components
- 🗺️ **Centralized Routing** - All routes defined in app/routes.ts
- 🎭 **Clean Architecture** - Well-organized component structure

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm
- Supabase account and project
- Resend account for email delivery
- Docker Desktop (optional, for containerization)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/gal1aoui/Next.js-Supabase-Authentication-System.git
cd Next.js-Supabase-Authentication-System
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Rename `.env.example.local` to `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publish_key
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=onboarding@resend.dev
```

Get these values from your [Supabase Project Settings](https://app.supabase.com) → API.

4. **Run the development server**

```bash
npm run dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Project Structure

```
.
├── app/                # Next.js App Router
│   ├── layout.tsx      # Root layout
│   ├── not-found.tsx   # Not found page
│   ├── (auth)/         # Authentication pages
│   ├── (root)/         # Dashboard pages
│   ├── routes.ts       # App routes
│   └── ...
├── components/         # React components
│   ├── ui/             # Shadcn UI components
│   ├── emails/         # Mailing components
│   ├── Logo.tsx/       # App logo component
│   └── ...
├── lib/                # Utility functions
│   ├── supabase/       # Supabase setup
│   └── ...
├── hooks/              # Custom React hooks
├── services/           # App services provider
├── contexts/           # React context providers
├── types/              # TypeScript type definitions
└── public/             # Static assets
```

## 📦 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Authentication:** [Supabase Auth](https://supabase.com/docs/guides/auth)
- **Database:** [Supabase](https://supabase.com/)
- **Email Service:** [Resend](https://resend.com/)
- **Email Templates:** [React Email](https://react.email/)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Validation:** [Zod](https://zod.dev/)
- **Font:** [Geist](https://vercel.com/font)
- **Linter/Formatter:** [Biome.js](https://biomejs.dev/)
- **Containerization:** [Docker](https://www.docker.com/)

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run Biome linter
npm run format       # Format code with Biome
npm run check        # Run Biome checks (lint + format check)

# Docker (optional)
# Build
docker build -t image-name:latest .
# Run
docker run -p 3000:3000 --env-file .env.local image-name:latest
```

## 🗃️ Supabase Setup

1. Create a new project on [Supabase](https://app.supabase.com/)
2. Go to Authentication → Sign In/Providers and disable Confirm email
3. Configure email templates within project `components/emails` (optional)
4. Rename `.env.example.local` to `.env.local` and paste your keys

## 🎨 Customization

### Theme

Customize the theme by editing `app/globals.css`. The project uses CSS variables for theming:

```css
:root {
  --background: ...;
  --foreground: ...;
  /* Add your custom variables */
}
```

#### GitHub Container Registry (Optional)

Publish your Docker image to GitHub Packages for easy distribution and deployment:

1. **Build and tag your image:**
```bash
docker build -t ghcr.io/your-username/your-image-name:latest .
```

2. **Login to GitHub Container Registry:**
```bash
docker login ghcr.io
# Username: your-github-username
# Password: ********
# for the password you can generate a new token with write:packages rights enabled
```

3. **Push to registry:**
```bash
docker push ghcr.io/your-username/your-image-name:latest
```

4. **Pull and run on any server:**
```bash
docker pull ghcr.io/your-username/your-image-name:latest
docker run -d -p 3000:3000 --env-file .env.local ghcr.io/your-username/your-image-name:latest
```

**Benefits of GitHub Packages:**
- Free for public repositories
- Integrated with your GitHub repository
- Version control for Docker images
- Easy team collaboration
- Automated builds with GitHub Actions

### Components

All UI components are located in `components/` and can be customized individually.

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Supabase Documentation](https://supabase.com/docs) - Learn about Supabase features
- [Shadcn UI Documentation](https://ui.shadcn.com/) - Browse available components
- [Biome.js Documentation](https://biomejs.dev/) - Learn about linting and formatting

## 🚀 Deployment

### Vercel (Recommended)

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js).

1. Push your code to GitHub
2. Import your repository on Vercel
3. Add environment variables in Vercel project settings
4. Deploy!

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Other Platforms

This application can be deployed to any platform that supports Next.js:

- [Netlify](https://www.netlify.com/)
- [Railway](https://railway.app/)
- [Render](https://render.com/)
- [AWS Amplify](https://aws.amazon.com/amplify/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin main`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Achref Gallaoui**

- GitHub: [@gal1aoui](https://github.com/gal1aoui)

## ⭐ Show your support

Give a ⭐️ if this project helped you!

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

Made with ❤️ using Next.js and Supabase