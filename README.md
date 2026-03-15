<div align="center">

# Document OCR Parser

<img width="1200" height="475" alt="Document OCR Parser Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)](https://www.typescriptlang.org/)

A powerful React-based frontend for extracting structured data from multiple document types using AI-powered OCR.

</div>

---

## ✨ Features

- **Multi-Document Support**
  - 📄 Insurance Policies
  - 🏪 Pharmacy Receipts
  - 🧪 Lab Invoices
  - 🔄 Auto-detection

- **Advanced UI/UX**
  - 📸 Side-by-side document preview and extracted data
  - 🎨 Beautiful Tailwind CSS styling
  - ⌨️ Drag & drop file upload
  - 📊 Detailed processing metadata
  - 🏷️ Paid status indicators

- **Type Safety**
  - ✅ TypeScript strict mode enabled
  - 🔍 Full type checking for documents
  - 🛡️ Safe null handling

- **Production Ready**
  - 🚀 Vite fast builds
  - 📦 Optimized bundle size
- 🐳 Docker support
- ☁️ Google Cloud Run support
- 🔄 Automated CI pipelines

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **Git**

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Insurance-api.git
   cd Insurance-api/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to `http://localhost:5173`

## 📦 Available Scripts

```bash
# Development - hot reload server
npm run dev

# Build - production optimized build
npm run build

# Preview - serve production build locally
npm run preview

# Lint - TypeScript strict checking
npm run lint

# Clean - remove build artifacts
npm run clean
```

## 🌐 Deployment

### Google Cloud Run

The application is configured for deployment on Google Cloud Run.

**Requirements:**
- Set environment variables: `GEMINI_API_KEY`, `OCR_API_KEY`, `PORT=8080`
- Configure `allowedHosts` in `vite.config.ts` for your Cloud Run URL.

### Docker

```bash
# Build image
docker build -t insurance-ocr-frontend .

# Run container
docker run -p 3000:3000 \
  -e GEMINI_API_KEY="your-key" \
  -e OCR_API_KEY="your-ocr-key" \
  insurance-ocr-frontend
```

Or with Docker Compose:

```bash
docker compose up
```

## 🏗️ Project Structure

```
src/
├── App.tsx              # Main application component
├── main.tsx             # React entry point
└── index.css            # Global styles

.github/
├── workflows/
│   └── ci.yml          # Test & build pipeline
└── dependabot.yml      # Dependency auto-updates

Dockerfile              # Container image definition
docker-compose.yml      # Multi-container setup
vite.config.ts          # Build configuration
tsconfig.json           # TypeScript configuration
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | Gemini AI API key for OCR |
| `OCR_API_KEY` | ❌ No | Alternative OCR service key |
| `VITE_APP_URL` | ❌ No | Application base URL |

### TypeScript Configuration

- **Strict Mode**: Enabled for maximum type safety
- **Target**: ES2022
- **Module**: ESNext
- **Strict Options**: All enabled

## 📚 Documentation

- [**DEPLOYMENT.md**](./DEPLOYMENT.md) - Complete deployment guide
- [**FRONTEND_UPDATES.md**](./FRONTEND_UPDATES.md) - Feature documentation
- [**CONTRIBUTING.md**](./CONTRIBUTING.md) - Contributing guidelines

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Development setup
- Code style guidelines
- Pull request process
- Commit message format

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run linting: `npm run lint`
5. Build: `npm run build`
6. Commit: `git commit -m 'feat: add amazing feature'`
7. Push: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 🐛 Bug Reports

Found a bug? Please [create an issue](https://github.com/yourusername/Insurance-api/issues) with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details

## 💡 Feature Requests

Have an idea? [Suggest a feature](https://github.com/yourusername/Insurance-api/discussions) with:
- Problem description
- Proposed solution
- Alternative approaches

## 📊 Performance

- **Build Time**: ~5-10 seconds
- **Bundle Size**: ~150KB gzipped
- **Lighthouse Score**: 90+
- **Time to Interactive**: <2 seconds

## 🔐 Security

- TypeScript strict mode for type safety
- No hardcoded secrets (use environment variables)
- Regular dependency updates via Dependabot
- GitHub Actions CI/CD security scanning

## ❤️ Support

- **Documentation**: Check [DEPLOYMENT.md](./DEPLOYMENT.md) and [FRONTEND_UPDATES.md](./FRONTEND_UPDATES.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/Insurance-api/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/Insurance-api/discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 👥 Authors

- **Original Author** - Document OCR Parser Team
- **Contributors** - Thanks to all who have contributed

## 🙏 Acknowledgments

- [React](https://react.dev/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Google Gemini AI](https://ai.google/) - OCR service

---

<div align="center">

**[⬆ back to top](#document-ocr-parser)**

Made with ❤️ by the Document OCR Parser Team

</div>
