# Khanect Automation Agency

<div align="center">

AI-powered automation agency platform featuring an intelligent n8n chatbot, secure client portal, and comprehensive analytics dashboard.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://khanect.com)
[![GitHub](https://img.shields.io/github/license/MohsinMMK/Khanect-Automation-Agency)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev/)

</div>

## 📋 Overview

Khanect is a modern AI automation agency platform that helps businesses streamline their operations through intelligent automation solutions. The platform features:

- **AI-Powered Chatbot**: n8n webhook-based intelligent assistant for business consultations
- **Client Portal**: Secure authentication system with invite-only access
- **Analytics Dashboard**: Real-time ROI tracking and performance metrics
- **Industry Solutions**: Tailored automation solutions for multiple industries
- **Service Showcase**: Interactive display of automation services and pricing

## ✨ Features

### 🤖 AI Business Consultant
- Intelligent chatbot powered by n8n workflows
- Natural language processing for business queries
- Session-based conversation persistence
- Real-time response streaming

### 👥 Client Portal
- Invite-only authentication system via Supabase
- Row-Level Security (RLS) for data protection
- Status-based access control (active, inactive, pending)
- Client-specific ROI dashboards with interactive charts

### 🎨 Modern UI/UX
- Smooth scrolling with Lenis
- Responsive design for all devices
- Tailwind CSS for styling
- Interactive animations and transitions

### 🧪 Testing Suite
- Comprehensive test coverage with Vitest
- React Testing Library integration
- Component, integration, and utility tests
- Coverage reporting

## 🛠️ Tech Stack

- **Frontend**: React 19.2, TypeScript 5.8
- **Styling**: Tailwind CSS 4.1
- **Build Tool**: Vite 6.2
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **AI Backend**: n8n Webhook Integration
- **Charts**: Recharts
- **Testing**: Vitest, React Testing Library
- **Smooth Scroll**: Lenis

## 📦 Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm** or **yarn**
- **Supabase Account** (for authentication and database)
- **n8n Instance** (for chatbot functionality)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MohsinMMK/Khanect-Automation-Agency.git
   cd Khanect-Automation-Agency
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # n8n Chatbot Webhook
   VITE_N8N_WEBHOOK_URL=your_n8n_webhook_url
   ```

   See [.env.example](.env.example) for reference.

4. **Set up Supabase**
   
   Follow the [Authentication Setup Guide](docs/AUTH_SETUP.md) to configure your Supabase database and authentication.

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (with hot reload) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage report |

## 📁 Project Structure

```
khanect-ai/
├── public/                 # Static assets
│   └── favicon.svg        # Khanect lightning bolt icon
├── src/
│   ├── components/        # React components
│   │   ├── __tests__/    # Component tests
│   │   ├── icons/        # Custom SVG icon components
│   │   ├── AiConsultant.tsx
│   │   ├── ClientPortal.tsx
│   │   ├── LandingPage.tsx
│   │   └── ...
│   ├── data/             # Static data and configurations
│   │   ├── faqs.ts
│   │   ├── industries.ts
│   │   ├── pricing.ts
│   │   └── services.ts
│   ├── lib/              # Third-party library configurations
│   │   └── supabase.ts
│   ├── services/         # API service layers
│   │   └── chatbotService.ts
│   ├── test/            # Test configuration
│   │   └── setup.ts
│   ├── utils/           # Utility functions
│   │   ├── env.ts
│   │   └── validation.ts
│   ├── App.tsx          # Main app component
│   ├── index.tsx        # Entry point
│   └── types.ts         # TypeScript type definitions
├── scripts/             # Utility scripts
│   └── create_invite.js # Create client invites
├── docs/               # Documentation
│   └── AUTH_SETUP.md   # Authentication setup guide
├── .env.example        # Environment variables template
├── .env.local         # Local environment variables (gitignored)
└── vite.config.ts     # Vite configuration
```

## 🧪 Testing

The project includes comprehensive test coverage:

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Generate coverage report
npm run test:coverage
```

### Test Coverage Includes:
- ✅ Component rendering and interactions
- ✅ User event simulations
- ✅ Utility function validation
- ✅ Environment variable handling
- ✅ Supabase integration

## 🔐 Authentication

The platform uses an **invite-only** authentication system:

1. **Admin creates invites** using the `create_invite.js` script
2. **Users receive emails** with password reset links
3. **Status-based access control** ensures only active clients can log in
4. **Row Level Security (RLS)** protects client data in Supabase

For detailed setup instructions, see [docs/AUTH_SETUP.md](docs/AUTH_SETUP.md).

### Creating Client Invites

```bash
node scripts/create_invite.js email@example.com "Business Name" "Full Name" "+1234567890"
```

## 🌐 Deployment

The application can be deployed to various platforms:

### GitHub Pages
Push to the `main` branch and GitHub Actions will handle deployment.

### Hostinger (or any Node.js hosting)
1. Build the project: `npm run build`
2. Upload the `dist/` folder to your hosting provider
3. Configure environment variables on the hosting platform

### Vercel / Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Configure environment variables in the platform settings

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [khanect.com](https://khanect.com)
- **Repository**: [GitHub](https://github.com/MohsinMMK/Khanect-Automation-Agency)
- **Issues**: [Report a bug](https://github.com/MohsinMMK/Khanect-Automation-Agency/issues)

## 👨‍💻 Author

**Mohsin MMK**
- GitHub: [@MohsinMMK](https://github.com/MohsinMMK)
- Email: mohsinkhanking1999@gmail.com

---

<div align="center">

**Built with ❤️ by Khanect Automation Agency**

⚡ Powered by AI | 🚀 Built for Scale | 🔒 Secure by Design

</div>
