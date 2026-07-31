# 🚀 RankPilot - AI-Powered SEO Analytics Platform

<!-- <p align="center">
  <img src="./docs/logo.png" alt="RankPilot Logo" width="180"/>
</p> -->

<p align="center">
  <strong>Analyze • Compare • Optimize</strong>
</p>

<p align="center">
An AI-powered SEO analytics platform that helps users analyze website SEO, compare competitors, track keyword rankings, and generate actionable optimization reports using Browser Automation, Playwright, Gemini AI, and MongoDB.
</p>

---

## 🌟 Features

### 🔍 Website SEO Analysis
Analyze any website in real-time and generate a comprehensive SEO audit.

- Overall SEO Score
- Performance Analysis
- Accessibility Analysis
- Best Practices
- Heading Structure
- Meta Tags
- Image ALT Analysis
- Internal & External Links
- Keyword Analysis
- Page Speed Insights

---

### 🤖 AI SEO Consultant

Receive AI-powered optimization recommendations.

- Website Health Summary
- Priority-based Issue Detection
- Why It Matters
- Expected SEO Impact
- Step-by-step Fix Suggestions
- Code Examples
- Estimated SEO Score Improvement

---

### 🏆 Competitor Analysis

Compare two websites side-by-side.

Features include:

- Overall Winner Detection
- SEO Score Comparison
- Performance Comparison
- Accessibility Comparison
- Best Practices Comparison
- Meta Tag Comparison
- Heading Structure Comparison
- Keyword Comparison
- Internal & External Link Comparison
- AI Comparison Summary
- Difference Analysis
- PDF Export

---

### 📊 Dashboard Analytics

Interactive dashboard displaying:

- Average SEO Score
- Average Performance
- Average Accessibility
- Average Page Speed
- Weekly SEO Trends
- Most Common SEO Issues
- Top Performing Website
- Recent Activity Timeline

---

### 📈 Rank Tracker

Track keyword rankings over time.

- Keyword Position Tracking
- Competitor Rankings
- Ranking History
- Ranking Insights
- Historical Performance

---

### 📚 Historical Analytics

Visualize website performance trends.

- SEO Score Trend
- Performance Trend
- Accessibility Trend
- Best Practices Trend
- Highest Score
- Lowest Score
- Average Score
- Most Common Issues

---

### 📄 Professional PDF Reports

Generate downloadable reports including:

- Complete SEO Audit
- AI Recommendations
- Competitor Comparison
- Technical Issues
- Optimization Suggestions

---

### ⚡ Intelligent Multi-Strategy Scraper

To ensure reliable analysis, RankPilot uses multiple scraping strategies.

```
Browserbase Cloud Browser
        │
        ▼
If unavailable
        │
        ▼
Local Playwright Browser
        │
        ▼
If browser rendering fails
        │
        ▼
HTTP Parser Fallback
```

This fallback mechanism minimizes failures and improves the reliability of SEO analysis.

---

# 🏗️ System Architecture

```
                 React Frontend
                       │
                       ▼
                Express REST API
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
 Browserbase      Playwright      Gemini AI
        │              │              │
        └──────────────┼──────────────┘
                       │
                SEO Analysis Engine
                       │
                       ▼
                   MongoDB Atlas
                       │
                       ▼
      Dashboard • Reports • History • Rank Tracker
```

---

# 🛠 Tech Stack

## Frontend

- React.js
- Tailwind CSS
- React Router
- Axios
- Framer Motion
- Recharts

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

## Browser Automation

- Playwright
- Browserbase

## Artificial Intelligence

- Google Gemini API

## PDF Generation

- jsPDF
- html2canvas

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/V-MANAS/RankPilot.git
cd RankPilot
```

## Install Frontend

```bash
cd client
npm install
```

## Install Backend

```bash
cd server
npm install
```

## Configure Environment Variables

Create a `.env` file inside the server directory.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

GEMINI_API_KEY=your_gemini_api_key

BROWSERBASE_API_KEY=your_browserbase_api_key

BROWSERBASE_PROJECT_ID=your_browserbase_project_id
```

---

## Run Frontend

```bash
npm run dev
```

## Run Backend

```bash
npm start
```

---

# 📂 Folder Structure

```
RankPilot
│
├── client
│   ├── components
│   ├── pages
│   ├── services
│   ├── hooks
│   └── assets
│
├── server
│   ├── controllers
│   ├── routes
│   ├── middleware
│   ├── models
│   ├── services
│   ├── utils
│   └── config
│
└── docs
    ├── homepage.png
    ├── dashboard.png
    ├── consultant.png
    ├── competitor.png
    ├── history.png
    └── ranktracker.png
```

---

# 💡 Challenges Solved

- Built an AI-powered SEO auditing platform using browser automation.
- Implemented an intelligent multi-strategy scraping pipeline with automatic fallback.
- Integrated Gemini AI for contextual SEO recommendations.
- Designed interactive analytics dashboards with historical insights.
- Developed competitor benchmarking with AI-generated comparison summaries.
- Generated professional downloadable PDF reports.

---

# 🔮 Future Enhancements

- Scheduled SEO Monitoring
- Email Reports
- Lighthouse Integration
- Team Collaboration
- Multi-language SEO Analysis

---

# 👨‍💻 Author

**Manas Varade**

- GitHub: https://github.com/V-MANAS
- LinkedIn: https://www.linkedin.com/in/manas-varade-239a9b2a3/

---

# ⭐ Support

If you found this project useful, consider giving it a **⭐ Star** on GitHub.
