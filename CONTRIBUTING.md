# Contributing to Coastal Resilience Platform

Thank you for your interest in contributing to the Coastal Resilience Platform! This project is developed for the Government of India to help coastal communities during disasters.

## 🤝 How to Contribute

### 1. Fork & Clone
```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/coastal-resilience-platform.git
cd coastal-resilience-platform
```

### 2. Set Up Development Environment
```bash
# Install dependencies
npm install
cd frontend && npm install
cd ../ml-service && pip install -r requirements.txt

# Start development servers
docker-compose up -d
```

### 3. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 4. Make Changes
- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure security best practices

### 5. Test Your Changes
```bash
# Run tests
npm test
cd frontend && npm test

# Check linting
npm run lint

# Test production build
docker-compose -f docker-compose.prod.yml up --build
```

### 6. Submit Pull Request
```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

## 📋 Guidelines

### Code Style
- Use TypeScript for frontend
- Follow ESLint rules
- Use meaningful variable names
- Add comments for complex logic

### Security
- Never commit sensitive data
- Use environment variables
- Follow OWASP guidelines
- Test for vulnerabilities

### Government Compliance
- Ensure accessibility (WCAG 2.1 AA)
- Support multiple languages
- Follow Indian IT standards
- Maintain data privacy

## 🐛 Bug Reports

Use GitHub Issues with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details

## 💡 Feature Requests

For new features:
- Check existing issues first
- Describe the use case
- Consider government requirements
- Propose implementation approach

## 📞 Contact

- **Technical Issues**: Create GitHub issue
- **Security Issues**: Email security@coastal-resilience.gov.in
- **General Questions**: discussions@coastal-resilience.gov.in

Thank you for contributing to disaster management in India! 🇮🇳