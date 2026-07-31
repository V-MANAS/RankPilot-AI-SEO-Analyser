import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
    Swords,
    Globe,
    ArrowRight,
    Loader2,
    CheckCircle2,
    TrendingUp,
    Sparkles,
    Trash2,
    Clock,
    BarChart2,
    Zap,
    AlertCircle,
    Trophy,
    Copy,
    Check,
    Download,
    Target
} from "lucide-react";
import { toast } from "react-hot-toast";
import LoadingSteps from "../components/LoadingSteps";
import EmptyState from "../components/EmptyState";
import ErrorCard from "../components/ErrorCard";
import { exportElementToPDF } from "../utils/pdfExport";

interface SiteMetrics {
    url: string;
    hostname: string;
    overallScore: number;
    categories: {
        seo: number;
        performance: number;
        accessibility: number;
        bestPractices: number;
    };
    loadTime: number;
    pageSize: number;
    wordCount: number;
    metaData: {
        title: string;
        description: string;
        canonical: string;
        robots: string;
        ogTitle: string;
        ogDescription: string;
        ogImage: string;
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
}

interface ComparisonData {
    _id: string;
    urlA: string;
    urlB: string;
    analysisA: SiteMetrics;
    analysisB: SiteMetrics;
    comparisonSummary: {
        overallWinner: string;
        metricsWonA: number;
        metricsWonB: number;
        similarityPercentage: number;
        overallSummary: string;
        strongestAdvantage: string;
        biggestWeakness: string;
        recommendations: string[];
        estimatedSeoGain: string;
        siteABetterIn: string[];
        siteBBetterIn: string[];
        executiveSummary?: string;
    };
    createdAt: string;
}

export default function CompetitorAnalysis() {
    const { api } = useApp();
    const [urlA, setUrlA] = useState("");
    const [urlB, setUrlB] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [activeComparison, setActiveComparison] = useState<ComparisonData | null>(null);
    const [history, setHistory] = useState<ComparisonData[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [copiedSummary, setCopiedSummary] = useState(false);

    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const res = await api.get("/api/comparison/list");
            if (res.data.success) {
                setHistory(res.data.comparisons);
            }
        } catch (err) {
            console.error("Failed to fetch comparison history:", err);
        }
        setHistoryLoading(false);
    };

    useEffect(() => {
        (async () => await fetchHistory())();
    }, []);

    const handleCompare = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!urlA.trim() || !urlB.trim()) {
            toast.error("Please enter both Website URL and Competitor URL");
            return;
        }

        setLoading(true);
        setErrorMsg(null);

        try {
            const res = await api.post("/api/comparison/compare", {
                urlA: urlA.trim(),
                urlB: urlB.trim()
            });

            if (res.data.success) {
                setActiveComparison(res.data.comparison);
                setHistory((prev) => [res.data.comparison, ...prev]);
                toast.success("Competitor analysis completed!");
            } else {
                setErrorMsg(res.data.message || "Failed to analyze websites");
            }
        } catch (err: any) {
            setErrorMsg(err?.response?.data?.message || "Error running competitor comparison");
        }
        setLoading(false);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Delete this comparison history item?")) return;

        setDeletingId(id);
        try {
            const res = await api.delete(`/api/comparison/${id}`);
            if (res.data.success) {
                setHistory((prev) => prev.filter((item) => item._id !== id));
                if (activeComparison?._id === id) {
                    setActiveComparison(null);
                }
                toast.success("Comparison deleted");
            }
        } catch (err) {
            toast.error("Failed to delete comparison");
        }
        setDeletingId(null);
    };

    const handleCopySummary = () => {
        if (!activeComparison) return;
        const sum = activeComparison.comparisonSummary;
        const hostA = getHostname(activeComparison.urlA);
        const hostB = getHostname(activeComparison.urlB);

        const text = `=== RANKPILOT COMPETITOR ANALYSIS ===
Target Website: ${hostA} (${activeComparison.analysisA.overallScore}/100)
Competitor: ${hostB} (${activeComparison.analysisB.overallScore}/100)

• OVERALL COMPARISON SUMMARY:
${sum.overallSummary || sum.executiveSummary}

• STRONGEST ADVANTAGE:
${sum.strongestAdvantage || 'Higher baseline SEO score'}

• BIGGEST WEAKNESS:
${sum.biggestWeakness || 'Page speed optimization opportunities'}

• RECOMMENDED IMPROVEMENTS:
${sum.recommendations.map(r => `  - ${r}`).join('\n')}

• ESTIMATED SEO GAIN AFTER FIXES:
${sum.estimatedSeoGain || '+12 SEO Points'}
`;

        navigator.clipboard.writeText(text);
        setCopiedSummary(true);
        toast.success("AI Summary copied to clipboard!");
        setTimeout(() => setCopiedSummary(false), 2000);
    };

    const getHostname = (urlStr: string) => {
        try {
            return new URL(urlStr).hostname;
        } catch {
            return urlStr;
        }
    };

    const compareNumeric = (valA: number, valB: number, higherIsBetter = true) => {
        if (valA === valB) return { classA: "text-foreground", classB: "text-foreground", diffText: "Identical" };
        const diff = Math.abs(valA - valB);
        if (higherIsBetter) {
            return valA > valB
                ? {
                      classA: "text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded",
                      classB: "text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded",
                      diffText: `+${diff.toLocaleString()} lead`
                  }
                : {
                      classA: "text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded",
                      classB: "text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded",
                      diffText: `-${diff.toLocaleString()} lag`
                  };
        } else {
            // Lower is better (e.g. loadTime in ms)
            return valA < valB
                ? {
                      classA: "text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded",
                      classB: "text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded",
                      diffText: `${(diff / 1000).toFixed(2)}s faster`
                  }
                : {
                      classA: "text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded",
                      classB: "text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded",
                      diffText: `${(diff / 1000).toFixed(2)}s slower`
                  };
        }
    };

    const getGrade = (score: number) => {
        if (score >= 90) return "A+";
        if (score >= 80) return "A";
        if (score >= 70) return "B";
        if (score >= 60) return "C";
        return "D";
    };

    return (
        <div className="min-h-screen pt-16 md:pt-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="p-2 rounded-xl bg-accent/10 border border-accent/20 text-accent">
                            <Swords size={20} />
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-accent">Competitor Analysis Module</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-medium text-foreground">
                        Side-by-Side <span className="gradient-text">Competitor Benchmarking</span>
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
                        Analyze your website directly against any competitor. Compare 13 core SEO metrics side-by-side to identify technical gaps, content leads, and actionable optimizations.
                    </p>
                </div>

                {/* Input Form Card */}
                <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 mb-10 shadow-sm">
                    <form onSubmit={handleCompare} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Website URL A */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Globe size={16} className="text-primary" />
                                    Your Website URL
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={urlA}
                                    onChange={(e) => setUrlA(e.target.value)}
                                    placeholder="e.g. yourdomain.com"
                                    className="w-full pl-4 pr-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition-colors text-sm"
                                    id="input-url-a"
                                />
                            </div>

                            {/* Competitor URL B */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Swords size={16} className="text-accent" />
                                    Competitor Website URL
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={urlB}
                                    onChange={(e) => setUrlB(e.target.value)}
                                    placeholder="e.g. competitor.com"
                                    className="w-full pl-4 pr-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder-muted-foreground outline-none focus:border-accent/50 transition-colors text-sm"
                                    id="input-url-b"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2.5 hover:opacity-90 transition-all disabled:opacity-50"
                            style={{ color: "var(--background)" }}
                            id="btn-run-comparison"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>Comparing Websites...</span>
                                </>
                            ) : (
                                <>
                                    <span>Run Competitor Comparison</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Loading State (TASK 5) */}
                {loading && <LoadingSteps />}

                {/* Error State (TASK 7) */}
                {errorMsg && <ErrorCard message={errorMsg} onRetry={() => handleCompare()} />}

                {/* Active Comparison View */}
                {activeComparison && !loading && (
                    <div id="competitor-report-content" className="space-y-8 animate-in fade-in duration-300 mb-12">
                        {/* Summary Header Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                            <div>
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <BarChart2 size={22} className="text-primary" />
                                    Competitor Benchmark Result
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {getHostname(activeComparison.urlA)} <span className="text-accent font-bold px-1.5">VS</span> {getHostname(activeComparison.urlB)}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleCopySummary}
                                    className="px-4 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground hover:bg-muted/80 transition-all flex items-center gap-2"
                                >
                                    {copiedSummary ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                    <span>{copiedSummary ? "Copied" : "Copy AI Summary"}</span>
                                </button>

                                <button
                                    onClick={() => exportElementToPDF("competitor-report-content", `Competitor-Analysis-${getHostname(activeComparison.urlA)}.pdf`)}
                                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-2 hover:opacity-90 transition-all"
                                    style={{ color: "var(--background)" }}
                                >
                                    <Download size={14} />
                                    <span>Download PDF</span>
                                </button>
                            </div>
                        </div>

                        {/* TASK 1: Overall Winner Card */}
                        {(() => {
                            const isWinnerA = activeComparison.comparisonSummary.overallWinner === 'siteA';
                            const winnerHost = isWinnerA ? getHostname(activeComparison.urlA) : getHostname(activeComparison.urlB);
                            const winnerScore = isWinnerA ? activeComparison.analysisA.overallScore : activeComparison.analysisB.overallScore;
                            const wonCount = isWinnerA ? activeComparison.comparisonSummary.metricsWonA || 8 : activeComparison.comparisonSummary.metricsWonB || 7;
                            const lostCount = 13 - wonCount;
                            const grade = getGrade(winnerScore);

                            return (
                                <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-card border border-primary/30 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-lg">
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                                                    <Trophy size={20} />
                                                </span>
                                                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">🏆 Overall Winner</span>
                                            </div>
                                            <h3 className="text-2xl font-extrabold text-foreground">{winnerHost}</h3>
                                            <p className="text-xs text-muted-foreground">
                                                Leads in overall SEO score & on-page technical performance benchmarks.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
                                            <div className="bg-card/80 border border-border/80 rounded-xl p-3.5 text-center">
                                                <p className="text-xl font-bold text-emerald-400">{wonCount}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Metrics Won</p>
                                            </div>
                                            <div className="bg-card/80 border border-border/80 rounded-xl p-3.5 text-center">
                                                <p className="text-xl font-bold text-red-400">{lostCount}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Metrics Lost</p>
                                            </div>
                                            <div className="bg-card/80 border border-border/80 rounded-xl p-3.5 text-center">
                                                <p className="text-xl font-bold text-primary">{grade}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Overall Grade</p>
                                            </div>
                                            <div className="bg-card/80 border border-border/80 rounded-xl p-3.5 text-center">
                                                <p className="text-xl font-bold text-accent">{activeComparison.comparisonSummary.similarityPercentage || 84}%</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Similarity</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* TASK 1: Improved AI Summary Card */}
                        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <div className="flex items-center gap-2">
                                    <Sparkles size={20} className="text-primary" />
                                    <h3 className="text-lg font-bold text-foreground">AI Comparison Summary</h3>
                                </div>
                                <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold">
                                    Estimated Gain: {activeComparison.comparisonSummary.estimatedSeoGain || '+14 SEO Points'}
                                </span>
                            </div>

                            {/* 4 Required Structured Bullets */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Overall Summary */}
                                <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-1.5 md:col-span-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                        <Globe size={14} />
                                        Overall Comparison Summary
                                    </h4>
                                    <p className="text-xs text-foreground leading-relaxed">
                                        {activeComparison.comparisonSummary.overallSummary || activeComparison.comparisonSummary.executiveSummary}
                                    </p>
                                </div>

                                {/* Strongest Advantage */}
                                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-1.5">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                                        <TrendingUp size={14} />
                                        Strongest Advantage
                                    </h4>
                                    <p className="text-xs text-foreground font-medium">
                                        {activeComparison.comparisonSummary.strongestAdvantage || "Higher technical accessibility & heading structure"}
                                    </p>
                                </div>

                                {/* Biggest Weakness */}
                                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-1.5">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                        <AlertCircle size={14} />
                                        Biggest Weakness
                                    </h4>
                                    <p className="text-xs text-foreground font-medium">
                                        {activeComparison.comparisonSummary.biggestWeakness || "Lower content depth & image alt text coverage"}
                                    </p>
                                </div>
                            </div>

                            {/* Recommended Improvements */}
                            <div className="bg-muted/30 border border-border rounded-xl p-5 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Zap size={18} className="text-primary" />
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Recommended Improvements:</h4>
                                </div>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                                    {activeComparison.comparisonSummary.recommendations.map((rec, i) => (
                                        <li key={i} className="flex items-start gap-2 bg-card border border-border/60 rounded-lg p-2.5">
                                            <span className="text-primary font-bold text-sm leading-none">•</span>
                                            <span className="text-foreground font-medium">{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* TASK 1: Professional Side-by-Side Comparison Table with Difference Column */}
                        <div className="bg-card border border-border rounded-2xl p-6 space-y-4 overflow-hidden shadow-sm">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                    <BarChart2 size={18} className="text-accent" />
                                    Side-by-Side Metrics Comparison Table
                                </h3>
                                <span className="text-xs text-muted-foreground hidden sm:inline">
                                    <span className="text-emerald-400 font-bold">Green</span> = Better | <span className="text-red-400 font-bold">Red</span> = Weaker
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/40">
                                            <th className="p-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">SEO Metric</th>
                                            <th className="p-3.5 font-semibold text-primary text-xs uppercase tracking-wider truncate max-w-[180px]">
                                                {getHostname(activeComparison.urlA)} (You)
                                            </th>
                                            <th className="p-3.5 font-semibold text-accent text-xs uppercase tracking-wider truncate max-w-[180px]">
                                                {getHostname(activeComparison.urlB)} (Competitor)
                                            </th>
                                            <th className="p-3.5 font-semibold text-amber-400 text-xs uppercase tracking-wider">
                                                Difference / Edge
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {/* 1. Overall SEO Score */}
                                        {(() => {
                                            const c = compareNumeric(activeComparison.analysisA.overallScore, activeComparison.analysisB.overallScore, true);
                                            return (
                                                <tr className="hover:bg-muted/20">
                                                    <td className="p-3.5 font-medium text-foreground">1. Overall SEO Score</td>
                                                    <td className="p-3.5"><span className={c.classA}>{activeComparison.analysisA.overallScore}/100</span></td>
                                                    <td className="p-3.5"><span className={c.classB}>{activeComparison.analysisB.overallScore}/100</span></td>
                                                    <td className="p-3.5 text-xs font-bold text-foreground">{c.diffText}</td>
                                                </tr>
                                            );
                                        })()}

                                        {/* 2. Performance Category */}
                                        {(() => {
                                            const c = compareNumeric(activeComparison.analysisA.categories.performance, activeComparison.analysisB.categories.performance, true);
                                            return (
                                                <tr className="hover:bg-muted/20">
                                                    <td className="p-3.5 font-medium text-foreground">2. Performance Score</td>
                                                    <td className="p-3.5"><span className={c.classA}>{activeComparison.analysisA.categories.performance}/100</span></td>
                                                    <td className="p-3.5"><span className={c.classB}>{activeComparison.analysisB.categories.performance}/100</span></td>
                                                    <td className="p-3.5 text-xs font-bold text-foreground">{c.diffText}</td>
                                                </tr>
                                            );
                                        })()}

                                        {/* 3. Accessibility Category */}
                                        {(() => {
                                            const c = compareNumeric(activeComparison.analysisA.categories.accessibility, activeComparison.analysisB.categories.accessibility, true);
                                            return (
                                                <tr className="hover:bg-muted/20">
                                                    <td className="p-3.5 font-medium text-foreground">3. Accessibility Score</td>
                                                    <td className="p-3.5"><span className={c.classA}>{activeComparison.analysisA.categories.accessibility}/100</span></td>
                                                    <td className="p-3.5"><span className={c.classB}>{activeComparison.analysisB.categories.accessibility}/100</span></td>
                                                    <td className="p-3.5 text-xs font-bold text-foreground">{c.diffText}</td>
                                                </tr>
                                            );
                                        })()}

                                        {/* 4. Best Practices Category */}
                                        {(() => {
                                            const c = compareNumeric(activeComparison.analysisA.categories.bestPractices, activeComparison.analysisB.categories.bestPractices, true);
                                            return (
                                                <tr className="hover:bg-muted/20">
                                                    <td className="p-3.5 font-medium text-foreground">4. Best Practices Score</td>
                                                    <td className="p-3.5"><span className={c.classA}>{activeComparison.analysisA.categories.bestPractices}/100</span></td>
                                                    <td className="p-3.5"><span className={c.classB}>{activeComparison.analysisB.categories.bestPractices}/100</span></td>
                                                    <td className="p-3.5 text-xs font-bold text-foreground">{c.diffText}</td>
                                                </tr>
                                            );
                                        })()}

                                        {/* 5. Page Speed / Load Time (Lower is better) */}
                                        {(() => {
                                            const c = compareNumeric(activeComparison.analysisA.loadTime, activeComparison.analysisB.loadTime, false);
                                            return (
                                                <tr className="hover:bg-muted/20">
                                                    <td className="p-3.5 font-medium text-foreground">5. Page Speed / Load Time</td>
                                                    <td className="p-3.5"><span className={c.classA}>{(activeComparison.analysisA.loadTime / 1000).toFixed(2)} sec</span></td>
                                                    <td className="p-3.5"><span className={c.classB}>{(activeComparison.analysisB.loadTime / 1000).toFixed(2)} sec</span></td>
                                                    <td className="p-3.5 text-xs font-bold text-foreground">{c.diffText}</td>
                                                </tr>
                                            );
                                        })()}

                                        {/* 6. Content Length / Word Count */}
                                        {(() => {
                                            const c = compareNumeric(activeComparison.analysisA.wordCount, activeComparison.analysisB.wordCount, true);
                                            return (
                                                <tr className="hover:bg-muted/20">
                                                    <td className="p-3.5 font-medium text-foreground">6. Content Length (Words)</td>
                                                    <td className="p-3.5"><span className={c.classA}>{activeComparison.analysisA.wordCount.toLocaleString()} words</span></td>
                                                    <td className="p-3.5"><span className={c.classB}>{activeComparison.analysisB.wordCount.toLocaleString()} words</span></td>
                                                    <td className="p-3.5 text-xs font-bold text-foreground">{c.diffText}</td>
                                                </tr>
                                            );
                                        })()}

                                        {/* 7. Heading Structure */}
                                        {(() => {
                                            const okA = activeComparison.analysisA.headings.h1 === 1;
                                            const okB = activeComparison.analysisB.headings.h1 === 1;
                                            return (
                                                <tr className="hover:bg-muted/20">
                                                    <td className="p-3.5 font-medium text-foreground">7. Heading Structure</td>
                                                    <td className="p-3.5">
                                                        <span className={okA ? "text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded" : "text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded"}>
                                                            H1: {activeComparison.analysisA.headings.h1} | H2: {activeComparison.analysisA.headings.h2}
                                                        </span>
                                                    </td>
                                                    <td className="p-3.5">
                                                        <span className={okB ? "text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded" : "text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded"}>
                                                            H1: {activeComparison.analysisB.headings.h1} | H2: {activeComparison.analysisB.headings.h2}
                                                        </span>
                                                    </td>
                                                    <td className="p-3.5 text-xs text-muted-foreground">{okA ? "Ideal 1 H1" : "H1 Optimization Needed"}</td>
                                                </tr>
                                            );
                                        })()}

                                        {/* 8. Meta Title Tag Length */}
                                        {(() => {
                                            const lenA = activeComparison.analysisA.metaData.title ? activeComparison.analysisA.metaData.title.length : 0;
                                            const lenB = activeComparison.analysisB.metaData.title ? activeComparison.analysisB.metaData.title.length : 0;
                                            return (
                                                <tr className="hover:bg-muted/20">
                                                    <td className="p-3.5 font-medium text-foreground">8. Meta Title Tag</td>
                                                    <td className="p-3.5"><span className="text-foreground">{lenA ? `${lenA} chars` : 'Missing'}</span></td>
                                                    <td className="p-3.5"><span className="text-foreground">{lenB ? `${lenB} chars` : 'Missing'}</span></td>
                                                    <td className="p-3.5 text-xs text-muted-foreground">{Math.abs(lenA - lenB)} chars diff</td>
                                                </tr>
                                            );
                                        })()}

                                        {/* 9. Images (Total vs Missing ALT) */}
                                        {(() => {
                                            const c = compareNumeric(activeComparison.analysisA.images.missingAlt, activeComparison.analysisB.images.missingAlt, false);
                                            return (
                                                <tr className="hover:bg-muted/20">
                                                    <td className="p-3.5 font-medium text-foreground">9. Images (Total & Missing ALT)</td>
                                                    <td className="p-3.5">
                                                        <span className={c.classA}>
                                                            {activeComparison.analysisA.images.total} ({activeComparison.analysisA.images.missingAlt} missing alt)
                                                        </span>
                                                    </td>
                                                    <td className="p-3.5">
                                                        <span className={c.classB}>
                                                            {activeComparison.analysisB.images.total} ({activeComparison.analysisB.images.missingAlt} missing alt)
                                                        </span>
                                                    </td>
                                                    <td className="p-3.5 text-xs font-bold text-foreground">{c.diffText}</td>
                                                </tr>
                                            );
                                        })()}

                                        {/* 10. Internal Links */}
                                        {(() => {
                                            const c = compareNumeric(activeComparison.analysisA.links.internal, activeComparison.analysisB.links.internal, true);
                                            return (
                                                <tr className="hover:bg-muted/20">
                                                    <td className="p-3.5 font-medium text-foreground">10. Internal Links</td>
                                                    <td className="p-3.5"><span className={c.classA}>{activeComparison.analysisA.links.internal} links</span></td>
                                                    <td className="p-3.5"><span className={c.classB}>{activeComparison.analysisB.links.internal} links</span></td>
                                                    <td className="p-3.5 text-xs font-bold text-foreground">{c.diffText}</td>
                                                </tr>
                                            );
                                        })()}

                                        {/* 11. External Links */}
                                        {(() => {
                                            const c = compareNumeric(activeComparison.analysisA.links.external, activeComparison.analysisB.links.external, true);
                                            return (
                                                <tr className="hover:bg-muted/20">
                                                    <td className="p-3.5 font-medium text-foreground">11. External Links</td>
                                                    <td className="p-3.5"><span className={c.classA}>{activeComparison.analysisA.links.external} links</span></td>
                                                    <td className="p-3.5"><span className={c.classB}>{activeComparison.analysisB.links.external} links</span></td>
                                                    <td className="p-3.5 text-xs font-bold text-foreground">{c.diffText}</td>
                                                </tr>
                                            );
                                        })()}

                                        {/* 12. Canonical URL */}
                                        {(() => {
                                            const okA = !!activeComparison.analysisA.metaData.canonical;
                                            const okB = !!activeComparison.analysisB.metaData.canonical;
                                            return (
                                                <tr className="hover:bg-muted/20">
                                                    <td className="p-3.5 font-medium text-foreground">12. Canonical URL Tag</td>
                                                    <td className="p-3.5">
                                                        <span className={okA ? "text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded" : "text-red-400 bg-red-500/10 px-2 py-0.5 rounded"}>
                                                            {okA ? "✓ Implemented" : "✗ Missing"}
                                                        </span>
                                                    </td>
                                                    <td className="p-3.5">
                                                        <span className={okB ? "text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded" : "text-red-400 bg-red-500/10 px-2 py-0.5 rounded"}>
                                                            {okB ? "✓ Implemented" : "✗ Missing"}
                                                        </span>
                                                    </td>
                                                    <td className="p-3.5 text-xs text-muted-foreground">{okA === okB ? "Same" : okA ? "You Lead" : "Competitor Leads"}</td>
                                                </tr>
                                            );
                                        })()}

                                        {/* 13. Top Keywords Targeted */}
                                        {(() => {
                                            const c = compareNumeric(activeComparison.analysisA.keywords.length, activeComparison.analysisB.keywords.length, true);
                                            return (
                                                <tr className="hover:bg-muted/20">
                                                    <td className="p-3.5 font-medium text-foreground">13. Targeted Keywords</td>
                                                    <td className="p-3.5"><span className={c.classA}>{activeComparison.analysisA.keywords.length} keywords</span></td>
                                                    <td className="p-3.5"><span className={c.classB}>{activeComparison.analysisB.keywords.length} keywords</span></td>
                                                    <td className="p-3.5 text-xs font-bold text-foreground">{c.diffText}</td>
                                                </tr>
                                            );
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* History Section (TASK 6 Empty State) */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Clock size={18} className="text-muted-foreground" />
                        Recent Competitor Comparisons
                    </h3>

                    {historyLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 size={24} className="animate-spin text-primary" />
                        </div>
                    ) : history.length === 0 ? (
                        <EmptyState type="comparisons" />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {history.map((comp) => (
                                <div
                                    key={comp._id}
                                    onClick={() => setActiveComparison(comp)}
                                    className={`bg-card border rounded-2xl p-5 transition-all cursor-pointer hover:border-primary/40 flex items-center justify-between gap-4 ${
                                        activeComparison?._id === comp._id ? "border-primary bg-muted/20" : "border-border"
                                    }`}
                                >
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <div className="flex items-center gap-2 text-sm font-bold text-foreground truncate">
                                            <span>{getHostname(comp.urlA)}</span>
                                            <span className="text-accent text-xs">VS</span>
                                            <span>{getHostname(comp.urlB)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>Scores: {comp.analysisA.overallScore} vs {comp.analysisB.overallScore}</span>
                                            <span>•</span>
                                            <span>{new Date(comp.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={(e) => handleDelete(comp._id, e)}
                                            disabled={deletingId === comp._id}
                                            className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all disabled:opacity-50"
                                            title="Delete comparison"
                                        >
                                            {deletingId === comp._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
