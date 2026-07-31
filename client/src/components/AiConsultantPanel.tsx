import { useState } from "react";
import {
    Sparkles,
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    Info,
    TrendingUp,
    Copy,
    Check,
    Zap,
    ShieldAlert,
    Gauge,
    FileCode2,
    Layers
} from "lucide-react";

export interface AnalysisData {
    _id: string;
    url: string;
    overallScore: number;
    status: string;
    createdAt: string;
    loadTime: number;
    pageSize: number;
    wordCount: number;
    categories: {
        seo: number;
        performance: number;
        accessibility: number;
        bestPractices: number;
    };
    metaData: {
        title: string;
        description: string;
        canonical: string;
        robots: string;
        ogTitle: string;
        ogDescription: string;
        ogImage: string;
        twitterCard: string;
        viewport: string;
        charset: string;
    };
    headings: {
        h1: number;
        h2: number;
        h3: number;
        h4: number;
        h5: number;
        h6: number;
        h1Texts: string[];
    };
    links: {
        internal: number;
        external: number;
        total: number;
    };
    images: {
        total: number;
        missingAlt: number;
        withAlt: number;
    };
    keywords: { word: string; count: number; density: number }[];
    issues: { severity: string; category: string; message: string; recommendation: string }[];
    consultantReport?: {
        healthSummary?: string;
        estimatedScore?: number;
        priorityFixes?: string[];
        recommendations?: {
            issue: string;
            whyItMatters: string;
            howToFix: string;
            expectedImpact: string;
            priority: 'critical' | 'high' | 'medium' | 'low';
            category: string;
        }[];
    };
}

export interface RecommendationItem {
    id: string;
    issue: string;
    whyItMatters: string;
    howToFix: string;
    expectedImpact: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    metricTag: string;
    pointGain: number;
    codeSnippet?: string;
}

function generateConsultantAnalysis(analysis: AnalysisData) {
    const recs: RecommendationItem[] = [];
    const priorityFixes: string[] = [];
    let potentialPointsGain = 0;

    const categories = analysis.categories || { seo: 0, performance: 0, accessibility: 0, bestPractices: 0 };
    const metaData = analysis.metaData || { title: "", description: "", canonical: "", robots: "", ogTitle: "", ogDescription: "", ogImage: "", twitterCard: "", viewport: "", charset: "" };
    const headings = analysis.headings || { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0, h1Texts: [] };
    const links = analysis.links || { internal: 0, external: 0, total: 0 };
    const images = analysis.images || { total: 0, missingAlt: 0, withAlt: 0 };
    const keywords = analysis.keywords || [];
    const wordCount = analysis.wordCount || 0;
    const loadTime = analysis.loadTime || 0;
    const pageSize = analysis.pageSize || 0;
    const overallScore = analysis.overallScore || 0;

    // 1. Canonical URL Metric
    if (!metaData.canonical || metaData.canonical.trim() === "") {
        recs.push({
            id: "rec-canonical",
            issue: "Missing Canonical Link Tag (rel=\"canonical\")",
            whyItMatters: "Without a canonical tag, search engine bots may index duplicate versions of your URL (HTTP vs HTTPS, trailing slashes, or www subdomains), diluting your domain authority and page rank.",
            howToFix: "Add a self-referencing canonical URL tag in the <head> section of your page HTML.",
            expectedImpact: "+5 SEO Score | Prevents duplicate content penalties & consolidates link equity.",
            priority: "critical",
            category: "Meta & Indexing",
            metricTag: "Canonical URL",
            pointGain: 5,
            codeSnippet: `<link rel="canonical" href="${metaData.canonical || analysis.url}" />`
        });
        priorityFixes.push("Add canonical URL tag");
        potentialPointsGain += 5;
    }

    // 2. Heading Structure - H1 Metric
    if (headings.h1 === 0) {
        recs.push({
            id: "rec-h1-missing",
            issue: "Missing Primary H1 Heading Tag",
            whyItMatters: "The <h1> element is the primary on-page heading used by Google to determine the core subject matter of the page. Omitting it weakens keyword relevance.",
            howToFix: "Add exactly one prominent <h1> tag containing your primary target keyword phrase near the top of your main content body.",
            expectedImpact: "+6 SEO Score | Improves topical relevance and search keyword placement.",
            priority: "critical",
            category: "Structure & Headings",
            metricTag: "Heading Structure",
            pointGain: 6,
            codeSnippet: `<h1>${metaData.title ? metaData.title.split('-')[0].trim() : 'Primary Keyword Headline'}</h1>`
        });
        priorityFixes.push("Add missing H1 tag");
        potentialPointsGain += 6;
    } else if (headings.h1 > 1) {
        recs.push({
            id: "rec-h1-multiple",
            issue: `Multiple H1 Tags Found (${headings.h1} H1 elements)`,
            whyItMatters: "Multiple <h1> tags create semantic confusion for search crawlers, diluting the main focal point of your page's heading hierarchy.",
            howToFix: "Keep only one top-level <h1> heading per page. Convert secondary major headings to <h2> or <h3> elements.",
            expectedImpact: "+4 SEO Score | Restores semantic structure for search crawlers.",
            priority: "critical",
            category: "Structure & Headings",
            metricTag: "Heading Structure",
            pointGain: 4,
            codeSnippet: `<!-- Keep single <h1>, convert rest to <h2> -->\n<h1>Main Title</h1>\n<h2>Subsection Topic</h2>`
        });
        priorityFixes.push("Fix multiple H1 tags hierarchy");
        potentialPointsGain += 4;
    }

    // 3. Meta Title Metric
    if (!metaData.title || metaData.title.trim() === "") {
        recs.push({
            id: "rec-title-missing",
            issue: "Missing Document Meta Title Tag",
            whyItMatters: "The <title> tag is the single most significant on-page SEO element. It defines your headline in Search Engine Result Pages (SERPs) and browser tabs.",
            howToFix: "Include a descriptive, click-worthy <title> tag between 50 and 60 characters containing your main target keyword.",
            expectedImpact: "+8 SEO Score | Essential ranking factor for keyword indexing.",
            priority: "critical",
            category: "Meta & Indexing",
            metricTag: "Meta Tags",
            pointGain: 8,
            codeSnippet: `<title>Primary Target Keyword - Brand Name</title>`
        });
        priorityFixes.push("Add meta title tag");
        potentialPointsGain += 8;
    } else if (metaData.title.length < 30 || metaData.title.length > 60) {
        recs.push({
            id: "rec-title-length",
            issue: `Sub-optimal Title Length (${metaData.title.length} characters)`,
            whyItMatters: "Titles under 30 characters miss valuable keyword opportunities. Titles over 60 characters get truncated with '...' in Google search snippets.",
            howToFix: "Optimize title length to be between 50 and 60 characters to ensure maximum keyword density without getting truncated.",
            expectedImpact: "+3 SEO Score | Prevents SERP truncation & improves CTR.",
            priority: "medium",
            category: "Meta & Indexing",
            metricTag: "Meta Tags",
            pointGain: 3,
            codeSnippet: `<title>${metaData.title.substring(0, 55)}...</title>`
        });
        potentialPointsGain += 3;
    }

    // 4. Meta Description Metric
    if (!metaData.description || metaData.description.trim() === "") {
        recs.push({
            id: "rec-desc-missing",
            issue: "Missing Meta Description Tag",
            whyItMatters: "Without a meta description, Google auto-extracts random body snippets that often look messy in search results, lowering organic Click-Through Rate (CTR).",
            howToFix: "Add a compelling meta description tag of 150-160 characters summarizing page value with a clear call-to-action.",
            expectedImpact: "+5 SEO Score | Drives higher organic search click-through rate.",
            priority: "high",
            category: "Meta & Indexing",
            metricTag: "Meta Tags",
            pointGain: 5,
            codeSnippet: `<meta name="description" content="Discover key insights and solutions. Explore our comprehensive guide designed to help you achieve optimal results." />`
        });
        priorityFixes.push("Add meta description");
        potentialPointsGain += 5;
    }

    // 5. Images ALT Text Metric
    if (images.missingAlt > 0) {
        const isCritical = images.missingAlt > 3 || (images.total > 0 && images.missingAlt / images.total > 0.5);
        recs.push({
            id: "rec-images-alt",
            issue: `${images.missingAlt} Image${images.missingAlt > 1 ? 's' : ''} Missing ALT Text`,
            whyItMatters: "Search engine crawlers cannot 'see' images. They rely on alt attributes to index images in Google Images and for WCAG accessibility compliance.",
            howToFix: "Add descriptive, keyword-relevant alt attributes to every image element on the page.",
            expectedImpact: "+4 to +6 Accessibility & Image SEO Score | Unlocks Google Image Search traffic.",
            priority: isCritical ? "critical" : "high",
            category: "Media & Accessibility",
            metricTag: "Images",
            pointGain: 5,
            codeSnippet: `<img src="hero-banner.jpg" alt="SEO Analysis Dashboard Overview" />`
        });
        priorityFixes.push("Add ALT text to images");
        potentialPointsGain += 5;
    }

    // 6. Page Speed / Load Time Metric
    if (loadTime > 3500) {
        recs.push({
            id: "rec-load-time-slow",
            issue: `Slow Server & Page Load Time (${(loadTime / 1000).toFixed(2)}s)`,
            whyItMatters: "Google explicitly uses Core Web Vitals and load speed as a ranking factor. 53% of mobile users abandon sites that take longer than 3 seconds to load.",
            howToFix: "Minify CSS/JS assets, compress images to WebP/AVIF formats, enable HTTP/2, and leverage CDN browser caching.",
            expectedImpact: "+7 Performance & SEO Score | Lowers bounce rate & improves Core Web Vitals.",
            priority: loadTime > 5000 ? "critical" : "high",
            category: "Performance & Speed",
            metricTag: "Page Speed",
            pointGain: 6,
            codeSnippet: `<!-- Compress images and load scripts with defer -->\n<script src="app.js" defer></script>`
        });
        priorityFixes.push("Compress images & optimize page speed");
        potentialPointsGain += 6;
    }

    if (pageSize > 1500000) {
        recs.push({
            id: "rec-page-size",
            issue: `Large Page Resource Payload (${Math.round(pageSize / 1024)} KB)`,
            whyItMatters: "Excessive page payloads slow down DOM parsing and consume excessive user bandwidth on mobile devices.",
            howToFix: "Minify HTML inline code, remove unused DOM elements, and lazy-load below-the-fold media assets.",
            expectedImpact: "+3 Performance Score | Faster DOM content loaded time.",
            priority: "medium",
            category: "Performance & Speed",
            metricTag: "Performance",
            pointGain: 3
        });
        potentialPointsGain += 3;
    }

    // 7. Content Length / Word Count Metric
    if (wordCount < 300) {
        recs.push({
            id: "rec-content-thin",
            issue: `Thin Content Warning (${wordCount} words)`,
            whyItMatters: "Pages with fewer than 300 words are categorized as 'thin content' by Google Helpful Content Guidelines, making them difficult to rank.",
            howToFix: "Expand page content to at least 600 to 1,200 words. Add structured subheadings, FAQs, and detailed explanations.",
            expectedImpact: "+6 SEO Score | Increases topical authority and long-tail keyword reach.",
            priority: "high",
            category: "Content Depth",
            metricTag: "Content Length",
            pointGain: 6
        });
        priorityFixes.push("Increase content length");
        potentialPointsGain += 6;
    } else if (wordCount >= 300 && wordCount < 600) {
        recs.push({
            id: "rec-content-moderate",
            issue: `Moderate Content Depth (${wordCount} words)`,
            whyItMatters: "While not penalized for thin content, 300-600 words is often outranked by comprehensive competitor guides covering topic details in depth.",
            howToFix: "Add 2-3 additional H2 topic sections addressing user intent and common search queries.",
            expectedImpact: "+3 SEO Score | Helps outrank competitor guides.",
            priority: "medium",
            category: "Content Depth",
            metricTag: "Content Length",
            pointGain: 3
        });
        potentialPointsGain += 3;
    }

    // 8. Internal Links Metric
    if (links.internal === 0) {
        recs.push({
            id: "rec-links-internal-zero",
            issue: "Zero Internal Links Found",
            whyItMatters: "Pages without internal links are 'orphan pages'. Search engine crawlers struggle to discover and evaluate orphan page authority.",
            howToFix: "Add 3-5 contextual hyperlinks pointing to relevant articles, category pages, or documentation on your domain.",
            expectedImpact: "+5 SEO Score | Eliminates orphan status & distributes PageRank.",
            priority: "critical",
            category: "Architecture & Links",
            metricTag: "Internal Links",
            pointGain: 5,
            codeSnippet: `<a href="/services/seo-audit">Explore our SEO Audit Tool</a>`
        });
        priorityFixes.push("Add internal navigation links");
        potentialPointsGain += 5;
    } else if (links.internal < 5) {
        recs.push({
            id: "rec-links-internal-low",
            issue: `Low Internal Link Count (${links.internal} links)`,
            whyItMatters: "Sparse internal links restrict user navigation flow and reduce crawl efficiency across your site structure.",
            howToFix: "Incorporate related content recommendation links at the end of key content sections.",
            expectedImpact: "+3 SEO Score | Enhances crawl depth and internal PageRank flow.",
            priority: "medium",
            category: "Architecture & Links",
            metricTag: "Internal Links",
            pointGain: 3
        });
        potentialPointsGain += 3;
    }

    // 9. Mobile Viewport Meta Metric
    if (!metaData.viewport || metaData.viewport.trim() === "") {
        recs.push({
            id: "rec-viewport-missing",
            issue: "Missing Mobile Viewport Meta Tag",
            whyItMatters: "Google uses mobile-first indexing. Without a viewport tag, mobile browsers render desktop views, failing mobile usability standards.",
            howToFix: "Add the standard responsive viewport meta tag to your <head>.",
            expectedImpact: "+7 Accessibility & Mobile SEO Score | Crucial for mobile-first indexing.",
            priority: "critical",
            category: "Best Practices",
            metricTag: "Best Practices",
            pointGain: 7,
            codeSnippet: `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`
        });
        priorityFixes.push("Add mobile viewport tag");
        potentialPointsGain += 7;
    }

    // 10. Keyword Density Metric
    if (keywords.length === 0) {
        recs.push({
            id: "rec-keywords-empty",
            issue: "No Defined Topic Keywords Detected",
            whyItMatters: "Without distinct primary and secondary keywords, search algorithms cannot assign clear topical authority to your document.",
            howToFix: "Identify 1 target keyword and 3 LSI synonyms. Integrate them naturally into headings, opening paragraphs, and meta tags.",
            expectedImpact: "+4 SEO Score | Establishes clear query intent matching.",
            priority: "medium",
            category: "Content Depth",
            metricTag: "Keyword Density",
            pointGain: 4
        });
        potentialPointsGain += 4;
    } else if (keywords.some(k => k.density > 4.0)) {
        const stuffed = keywords.filter(k => k.density > 4.0).map(k => k.word).join(", ");
        recs.push({
            id: "rec-keywords-stuffing",
            issue: `High Keyword Density / Stuffing Risk (${stuffed})`,
            whyItMatters: "Keyword density over 4% risks triggering Google Search Spam filters for keyword stuffing and creates unnatural user reading experiences.",
            howToFix: "Replace repetitive instances of overused words with natural synonyms, contextual variations, and pronouns.",
            expectedImpact: "+4 SEO Score | Protects page from automated algorithmic spam demotions.",
            priority: "high",
            category: "Content Depth",
            metricTag: "Keyword Density",
            pointGain: 4
        });
        priorityFixes.push("Reduce keyword stuffing density");
        potentialPointsGain += 4;
    }

    // 11. Accessibility Score Metric
    if (categories.accessibility < 75) {
        recs.push({
            id: "rec-access-low",
            issue: `Low Accessibility Score (${categories.accessibility}/100)`,
            whyItMatters: "Low accessibility hinders users with screen readers or visual impairments. Search engines favor accessible, compliant websites.",
            howToFix: "Ensure high color contrast ratios, add aria-labels to interactive elements, and fix missing image alt texts.",
            expectedImpact: "+5 Accessibility & UX Score | Standard compliance improvement.",
            priority: categories.accessibility < 50 ? "critical" : "high",
            category: "Best Practices",
            metricTag: "Accessibility",
            pointGain: 5
        });
        priorityFixes.push("Improve accessibility score & contrast");
        potentialPointsGain += 5;
    }

    // 12. Open Graph & Social Meta Metric
    if (!metaData.ogTitle || !metaData.ogImage) {
        recs.push({
            id: "rec-og-missing",
            issue: "Incomplete Open Graph Social Tags",
            whyItMatters: "Social platforms (LinkedIn, Twitter, Facebook, WhatsApp) use Open Graph tags to render rich preview cards. Missing tags reduce social CTR.",
            howToFix: "Add og:title, og:description, and og:image tags pointing to a high-resolution preview graphic.",
            expectedImpact: "+3 Best Practices Score | Generates rich social sharing previews.",
            priority: "medium",
            category: "Meta & Indexing",
            metricTag: "Best Practices",
            pointGain: 3,
            codeSnippet: `<meta property="og:title" content="${metaData.title || 'Page Title'}" />\n<meta property="og:image" content="https://yourdomain.com/og-image.jpg" />`
        });
        potentialPointsGain += 3;
    }

    // 13. External Links / Citations Metric
    if (links.external === 0) {
        recs.push({
            id: "rec-links-external-zero",
            issue: "No Outbound Authority Citations",
            whyItMatters: "Linking out to trusted industry studies or authoritative reference documentation signals thorough research and trustworthiness to search algorithms.",
            howToFix: "Add 2-3 links to reputable external sources or official reference sites relevant to your topic.",
            expectedImpact: "+2 SEO Score | Enhances domain trust signals.",
            priority: "low",
            category: "Architecture & Links",
            metricTag: "External Links",
            pointGain: 2
        });
        potentialPointsGain += 2;
    }

    // Calculate Estimated Score After Fixes
    const rawEstScore = overallScore + Math.max(potentialPointsGain, recs.length * 3);
    const estimatedScore = Math.min(98, Math.max(overallScore + 4, rawEstScore));
    const estimatedImprovement = Math.max(0, estimatedScore - overallScore);

    // Default Priority Fixes fallback if list is short
    if (priorityFixes.length === 0) {
        priorityFixes.push("Optimize Heading Hierarchy", "Improve Page Load Performance", "Enhance Meta Description", "Refactor Image Attributes");
    }

    // Determine Health Grade
    let healthGrade: 'Excellent' | 'Good' | 'Needs Work' | 'Critical Action' = 'Good';
    const criticalCount = recs.filter(r => r.priority === 'critical').length;
    if (overallScore >= 85 && criticalCount === 0) {
        healthGrade = 'Excellent';
    } else if (overallScore >= 70 && criticalCount <= 1) {
        healthGrade = 'Good';
    } else if (overallScore >= 50 && criticalCount <= 3) {
        healthGrade = 'Needs Work';
    } else {
        healthGrade = 'Critical Action';
    }

    // Health Summary Paragraph
    let healthSummary = `The automated AI SEO audit evaluated all 13 core metrics for ${new URL(analysis.url).hostname}. `;
    if (healthGrade === 'Excellent') {
        healthSummary += `The website displays strong overall SEO health with an overall score of ${overallScore}/100. Addressing minor optimization recommendations could elevate the domain score to ${estimatedScore}/100.`;
    } else if (healthGrade === 'Good') {
        healthSummary += `The website performs moderately well (${overallScore}/100) but has ${recs.length} actionable optimization opportunities. Implementing top priority fixes is estimated to boost the score to ${estimatedScore}/100 (+${estimatedImprovement} pts).`;
    } else if (healthGrade === 'Needs Work') {
        healthSummary += `The site currently scores ${overallScore}/100 and exhibits ${criticalCount} critical blocker${criticalCount === 1 ? '' : 's'} that hinder maximum organic visibility. Resolving priority issues can boost the score to ${estimatedScore}/100.`;
    } else {
        healthSummary += `Urgent attention required. The website scores ${overallScore}/100 with ${criticalCount} critical issues affecting indexing, accessibility, and crawlability. Completing recommended fixes can improve the score to ${estimatedScore}/100 (+${estimatedImprovement} pts).`;
    }

    return {
        healthSummary,
        healthGrade,
        currentScore: overallScore,
        estimatedScore,
        estimatedImprovement,
        priorityFixes,
        criticalProblems: recs.filter(r => r.priority === 'critical'),
        recommendations: recs,
        metricsAnalyzedCount: 13
    };
}

export default function AiConsultantPanel({ analysis }: { analysis: AnalysisData }) {
    const reportData = generateConsultantAnalysis(analysis);
    const categories = analysis.categories || { seo: 0, performance: 0, accessibility: 0, bestPractices: 0 };
    const metaData = analysis.metaData || { title: "", description: "", canonical: "", robots: "", ogTitle: "", ogDescription: "", ogImage: "", twitterCard: "", viewport: "", charset: "" };
    const headings = analysis.headings || { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0, h1Texts: [] };
    const links = analysis.links || { internal: 0, external: 0, total: 0 };
    const images = analysis.images || { total: 0, missingAlt: 0, withAlt: 0 };
    const keywords = analysis.keywords || [];
    const wordCount = analysis.wordCount || 0;
    const loadTime = analysis.loadTime || 0;

    const [selectedPriority, setSelectedPriority] = useState<string>("all");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Filter Recommendations
    const filteredRecommendations = reportData.recommendations.filter(rec => {
        const matchesPriority = selectedPriority === "all" || rec.priority === selectedPriority;
        const matchesCategory = selectedCategory === "all" || rec.category === selectedCategory;
        return matchesPriority && matchesCategory;
    });

    const priorityBadgeStyles: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode; label: string }> = {
        critical: {
            bg: "bg-red-500/10",
            text: "text-red-400",
            border: "border-red-500/30",
            icon: <AlertCircle size={14} />,
            label: "Critical"
        },
        high: {
            bg: "bg-amber-500/10",
            text: "text-amber-400",
            border: "border-amber-500/30",
            icon: <AlertTriangle size={14} />,
            label: "High"
        },
        medium: {
            bg: "bg-purple-500/10",
            text: "text-purple-400",
            border: "border-purple-500/30",
            icon: <Info size={14} />,
            label: "Medium"
        },
        low: {
            bg: "bg-emerald-500/10",
            text: "text-emerald-400",
            border: "border-emerald-500/30",
            icon: <CheckCircle2 size={14} />,
            label: "Low"
        }
    };

    const categoriesList = Array.from(new Set(reportData.recommendations.map(r => r.category)));

    const getGradeBadge = (grade: string) => {
        switch (grade) {
            case 'Excellent':
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Grade: Excellent</span>;
            case 'Good':
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">Grade: Good</span>;
            case 'Needs Work':
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">Grade: Needs Work</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30">Grade: Critical Action</span>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header Banner */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
                    <Sparkles size={160} className="text-primary" />
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                                <Sparkles size={20} />
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-wider text-primary">RankPilot AI Consultant</span>
                            {getGradeBadge(reportData.healthGrade)}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground">AI SEO Consultant</h2>
                        <p className="text-sm text-muted-foreground max-w-2xl">
                            Comprehensive evaluation across all 13 collected SEO metrics with priority recommendations and score impact projections.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-xl p-3 shrink-0 self-start md:self-auto">
                        <Gauge size={18} className="text-accent" />
                        <span className="text-xs font-medium text-foreground">13/13 Metrics Evaluated</span>
                    </div>
                </div>
            </div>

            {/* Score Impact & Priority Fixes Section (User Prompt Requirement 3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Score Comparison Box */}
                <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <TrendingUp size={18} className="text-primary" />
                            Score Impact Projection
                        </h3>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            +{reportData.estimatedImprovement} pts potential
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 my-4">
                        {/* Current Score */}
                        <div className="bg-muted/40 border border-border rounded-xl p-4 text-center">
                            <p className="text-xs text-muted-foreground mb-1">Current Score</p>
                            <p className={`text-4xl font-bold ${reportData.currentScore >= 80 ? 'text-emerald-400' : reportData.currentScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                {reportData.currentScore}
                            </p>
                        </div>

                        {/* Estimated Score After Fixes */}
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
                            <p className="text-xs text-emerald-400/80 font-medium mb-1">Estimated Score</p>
                            <p className="text-4xl font-bold text-emerald-400">
                                {reportData.estimatedScore}
                            </p>
                        </div>
                    </div>

                    <div className="text-xs text-muted-foreground border-t border-border pt-3 mt-2 flex items-center gap-1.5">
                        <Zap size={14} className="text-amber-400 shrink-0" />
                        <span>Implementing priority fixes elevates your overall domain authority grade.</span>
                    </div>
                </div>

                {/* Website Health Summary Box */}
                <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                            <ShieldAlert size={18} className="text-accent" />
                            Website Health Summary
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {reportData.healthSummary}
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
                        <div className="text-center">
                            <p className="text-xl font-bold text-red-400">{reportData.recommendations.filter(r => r.priority === 'critical').length}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Critical</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold text-amber-400">{reportData.recommendations.filter(r => r.priority === 'high').length}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">High</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold text-purple-400">{reportData.recommendations.filter(r => r.priority === 'medium').length}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Medium</p>
                        </div>
                    </div>
                </div>

                {/* Priority Fixes Checklist */}
                <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-emerald-400" />
                        Priority Fixes Checklist
                    </h3>
                    <div className="space-y-2.5">
                        {reportData.priorityFixes.slice(0, 5).map((fix, idx) => (
                            <div key={idx} className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/30 border border-border/50 text-sm text-foreground">
                                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                                    ✓
                                </span>
                                <span className="font-medium truncate">{fix}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Critical Problems Section (if any critical exist) */}
            {reportData.criticalProblems.length > 0 && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertCircle size={20} className="text-red-400" />
                        <h3 className="text-lg font-bold text-red-400">Top Critical Problems ({reportData.criticalProblems.length})</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reportData.criticalProblems.map((prob) => (
                            <div key={prob.id} className="bg-card border border-red-500/30 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                                        Critical Fix Required
                                    </span>
                                    <span className="text-xs text-muted-foreground">{prob.metricTag}</span>
                                </div>
                                <h4 className="text-sm font-semibold text-foreground mb-1">{prob.issue}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-2">{prob.whyItMatters}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Priority-Based Recommendations Section */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-foreground">Priority Recommendations</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Actionable fixes grouped by severity, including technical root cause, resolution steps, and expected SEO impact.
                        </p>
                    </div>

                    {/* Priority & Category Filters */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {["all", "critical", "high", "medium", "low"].map((p) => {
                            const count = p === "all" ? reportData.recommendations.length : reportData.recommendations.filter(r => r.priority === p).length;
                            return (
                                <button
                                    key={p}
                                    onClick={() => setSelectedPriority(p)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                                        selectedPriority === p
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    }`}
                                    style={selectedPriority === p ? { color: "var(--background)" } : {}}
                                >
                                    {p} ({count})
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Sub Filter by Category */}
                {categoriesList.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        <span className="text-xs text-muted-foreground shrink-0">Category:</span>
                        <button
                            onClick={() => setSelectedCategory("all")}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                                selectedCategory === "all" ? "bg-muted text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            All Categories
                        </button>
                        {categoriesList.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                                    selectedCategory === cat ? "bg-muted text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {/* Recommendation Cards Grid */}
                {filteredRecommendations.length > 0 ? (
                    <div className="space-y-4">
                        {filteredRecommendations.map((rec) => {
                            const style = priorityBadgeStyles[rec.priority] || priorityBadgeStyles.low;
                            return (
                                <div
                                    key={rec.id}
                                    className={`bg-card border ${style.border} rounded-2xl p-6 transition-all hover:shadow-md relative overflow-hidden`}
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                                        <div className="space-y-1 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {/* Color-Coded Priority Badge */}
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
                                                    {style.icon}
                                                    {style.label} Priority
                                                </span>
                                                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-muted border border-border text-muted-foreground">
                                                    {rec.category}
                                                </span>
                                                <span className="text-xs text-muted-foreground/80">
                                                    Metric: <strong className="text-foreground">{rec.metricTag}</strong>
                                                </span>
                                            </div>

                                            {/* Issue Title */}
                                            <h4 className="text-lg font-semibold text-foreground pt-1">{rec.issue}</h4>
                                        </div>

                                        {/* Expected Impact Badge */}
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-left lg:text-right shrink-0">
                                            <p className="text-[10px] text-emerald-400/80 uppercase font-semibold tracking-wider">Expected Impact</p>
                                            <p className="text-xs font-bold text-emerald-400 mt-0.5">{rec.expectedImpact}</p>
                                        </div>
                                    </div>

                                    {/* 4 Required Card Sections */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-4 mt-4">
                                        {/* 1. Why It Matters */}
                                        <div className="bg-muted/30 border border-border/60 rounded-xl p-4 space-y-1">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                                <Info size={14} className="text-accent" />
                                                <span>Why It Matters</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                                                {rec.whyItMatters}
                                            </p>
                                        </div>

                                        {/* 2. How to Fix */}
                                        <div className="bg-muted/30 border border-border/60 rounded-xl p-4 space-y-1">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                                <FileCode2 size={14} className="text-primary" />
                                                <span>How to Fix</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                                                {rec.howToFix}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Code Snippet Box (if available) */}
                                    {rec.codeSnippet && (
                                        <div className="mt-4 bg-black/40 border border-border rounded-xl p-3.5 relative font-mono text-xs text-emerald-300 overflow-x-auto">
                                            <button
                                                onClick={() => handleCopy(rec.codeSnippet!, rec.id)}
                                                className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-card/80 hover:bg-card text-muted-foreground hover:text-foreground border border-border transition-all flex items-center gap-1 text-[10px]"
                                            >
                                                {copiedId === rec.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                                <span>{copiedId === rec.id ? "Copied" : "Copy"}</span>
                                            </button>
                                            <pre className="pr-16 whitespace-pre-wrap break-all">{rec.codeSnippet}</pre>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-2xl p-12 text-center">
                        <CheckCircle2 size={40} className="mx-auto text-emerald-400 mb-3" />
                        <h4 className="text-base font-semibold text-foreground mb-1">No Recommendations in this Filter</h4>
                        <p className="text-xs text-muted-foreground">Try selecting a different priority or category filter.</p>
                    </div>
                )}
            </div>

            {/* All 13 Analyzed Metrics Audit Matrix */}
            <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Layers size={18} className="text-primary" />
                        13 Core SEO Metrics Audit Checklist
                    </h3>
                    <span className="text-xs text-muted-foreground">Verified by RankPilot Engine</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {[
                        { label: "1. SEO Score", val: `${categories.seo}/100`, ok: categories.seo >= 80 },
                        { label: "2. Accessibility", val: `${categories.accessibility}/100`, ok: categories.accessibility >= 75 },
                        { label: "3. Performance", val: `${categories.performance}/100`, ok: categories.performance >= 70 },
                        { label: "4. Best Practices", val: `${categories.bestPractices}/100`, ok: categories.bestPractices >= 80 },
                        { label: "5. Heading Structure", val: `H1: ${headings.h1}`, ok: headings.h1 === 1 },
                        { label: "6. Meta Tags", val: metaData.title ? "Present" : "Missing", ok: !!metaData.title },
                        { label: "7. Images ALT", val: `${images.withAlt}/${images.total} alt`, ok: images.missingAlt === 0 },
                        { label: "8. Internal Links", val: `${links.internal} links`, ok: links.internal >= 5 },
                        { label: "9. External Links", val: `${links.external} links`, ok: links.external >= 1 },
                        { label: "10. Canonical URL", val: metaData.canonical ? "Valid" : "Missing", ok: !!metaData.canonical },
                        { label: "11. Keyword Density", val: `${keywords.length} keywords`, ok: keywords.length > 0 },
                        { label: "12. Content Length", val: `${wordCount} words`, ok: wordCount >= 500 },
                        { label: "13. Page Speed", val: `${(loadTime / 1000).toFixed(2)}s`, ok: loadTime < 3500 },
                    ].map((item, idx) => (
                        <div key={idx} className="bg-muted/30 border border-border rounded-xl p-3 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">{item.label}</p>
                                <p className="text-[11px] text-muted-foreground truncate">{item.val}</p>
                            </div>
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.ok ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
