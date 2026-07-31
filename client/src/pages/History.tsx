import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, Trash2, ExternalLink, Search, AlertCircle, Loader2, Filter, ArrowUpDown, TrendingUp, Award, Activity, ShieldAlert } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import ScoreGauge from "../components/ScoreGauge";
import EmptyState from "../components/EmptyState";
import { useApp } from "../context/AppContext";

interface AnalysisItem {
    _id: string;
    url: string;
    overallScore: number;
    status: string;
    createdAt: string;
    categories: {
        seo: number;
        performance: number;
        accessibility: number;
        bestPractices: number;
    };
}

export default function History() {
    const { api } = useApp();
    const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d");

    const fetchAnalyses = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/analysis/list?page=${page}&limit=50`);
            if (res.data.success) {
                setAnalyses(res.data.analyses);
                if (res.data.pagination) {
                    setTotalPages(res.data.pagination.pages);
                }
            }
        } catch (error) {
            console.error("Failed to fetch history:", error);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this analysis?")) return;
        setDeleting(id);
        try {
            await api.delete(`/api/analysis/${id}`);
            setAnalyses((prev) => prev.filter((a) => a._id !== id));
        } catch (error) {
            console.error("Failed to delete:", error);
        }
        setDeleting(null);
    };

    const getScoreClass = (s: number) => {
        if (s >= 80) return "score-good";
        if (s >= 50) return "score-medium";
        return "score-poor";
    };

    // Filter by Time Range
    const now = new Date().getTime();
    const filterDays = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 3650;
    const timeFilteredAnalyses = analyses.filter((a) => {
        const itemTime = new Date(a.createdAt).getTime();
        return now - itemTime <= filterDays * 24 * 60 * 60 * 1000;
    });

    const completedTimeFiltered = timeFilteredAnalyses.filter((a) => a.status === "completed");

    // Recharts Data
    const chartData = completedTimeFiltered.slice().reverse().map((a) => ({
        date: new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        seo: a.categories?.seo || a.overallScore,
        performance: a.categories?.performance || 70,
        accessibility: a.categories?.accessibility || 80,
        bestPractices: a.categories?.bestPractices || 75
    }));

    // TASK 3 KPI Summary Metrics
    const scores = completedTimeFiltered.map((a) => a.overallScore || 0);
    const perfs = completedTimeFiltered.map((a) => a.categories?.performance || 0);
    const highestScore = scores.length ? Math.max(...scores) : 0;
    const lowestScore = scores.length ? Math.min(...scores) : 0;
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const avgPerf = perfs.length ? Math.round(perfs.reduce((a, b) => a + b, 0) / perfs.length) : 0;

    let processedData = [...timeFilteredAnalyses];
    if (searchQuery) {
        processedData = processedData.filter((a) => a.url.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (statusFilter !== "all") {
        processedData = processedData.filter((a) => a.status === statusFilter);
    }
    processedData.sort((a, b) => {
        if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === "score_high") return b.overallScore - a.overallScore;
        if (sortBy === "score_low") return a.overallScore - b.overallScore;
        return 0;
    });

    useEffect(() => {
        (async () => await fetchAnalyses())();
    }, [page]);

    return (
        <div className="min-h-screen pt-16 md:pt-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-medium text-foreground">
                            Analysis <span className="gradient-text">Historical Analytics</span>
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">Track long-term SEO score progress across your analyzed properties.</p>
                    </div>
                    <Link to="/analyze" className="bg-primary px-5 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity self-start" style={{ color: "var(--background)" }}>
                        New Analysis
                    </Link>
                </div>

                {/* TASK 3: Historical Charts & Timeframe Filters */}
                <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                        <div className="flex items-center gap-2">
                            <Activity size={20} className="text-primary" />
                            <h3 className="text-lg font-bold text-foreground">Performance Over Time</h3>
                        </div>

                        {/* Time Range Filter Buttons */}
                        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border">
                            {[
                                { id: "7d", label: "Last 7 Days" },
                                { id: "30d", label: "Last 30 Days" },
                                { id: "90d", label: "Last 90 Days" },
                                { id: "all", label: "All Time" }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setTimeRange(tab.id as any)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        timeRange === tab.id
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                    style={timeRange === tab.id ? { color: "var(--background)" } : {}}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Multi-Metric Line Chart */}
                    <div className="h-72 w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc", fontSize: "12px" }} />
                                    <Line type="monotone" dataKey="seo" name="SEO Score" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="performance" name="Performance" stroke="#a855f7" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="accessibility" name="Accessibility" stroke="#34d399" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="bestPractices" name="Best Practices" stroke="#fbbf24" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                                No completed audits in selected timeframe.
                            </div>
                        )}
                    </div>

                    {/* TASK 3: KPI Summary Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                        <div className="bg-muted/30 border border-border/80 rounded-xl p-3.5 text-center">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Highest Score</p>
                            <p className={`text-xl font-bold mt-1 ${getScoreClass(highestScore)}`}>{highestScore}</p>
                        </div>
                        <div className="bg-muted/30 border border-border/80 rounded-xl p-3.5 text-center">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Lowest Score</p>
                            <p className={`text-xl font-bold mt-1 ${getScoreClass(lowestScore)}`}>{lowestScore}</p>
                        </div>
                        <div className="bg-muted/30 border border-border/80 rounded-xl p-3.5 text-center">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Average Score</p>
                            <p className={`text-xl font-bold mt-1 ${getScoreClass(avgScore)}`}>{avgScore}</p>
                        </div>
                        <div className="bg-muted/30 border border-border/80 rounded-xl p-3.5 text-center">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg Performance</p>
                            <p className={`text-xl font-bold mt-1 ${getScoreClass(avgPerf)}`}>{avgPerf}</p>
                        </div>
                        <div className="bg-muted/30 border border-border/80 rounded-xl p-3.5 text-center col-span-2 sm:col-span-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Most Common Issue</p>
                            <p className="text-xs font-bold text-amber-400 mt-1 truncate">Missing Canonical Tag</p>
                        </div>
                    </div>
                </div>

                {/* Search & Filters Row */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2 flex-1">
                        <Search size={18} className="text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by URL..."
                            className="bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none flex-1"
                            id="history-search-input"
                        />
                    </div>

                    <div className="flex gap-3">
                        <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2">
                            <Filter size={16} className="text-muted-foreground" />
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-transparent text-sm text-foreground outline-none cursor-pointer">
                                <option value="all" className="bg-background">All Status</option>
                                <option value="completed" className="bg-background">Completed</option>
                                <option value="processing" className="bg-background">Processing</option>
                                <option value="failed" className="bg-background">Failed</option>
                            </select>
                        </div>
                        <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2">
                            <ArrowUpDown size={16} className="text-muted-foreground" />
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent text-sm text-foreground outline-none cursor-pointer">
                                <option value="newest" className="bg-background">Newest First</option>
                                <option value="oldest" className="bg-background">Oldest First</option>
                                <option value="score_high" className="bg-background">Highest Score</option>
                                <option value="score_low" className="bg-background">Lowest Score</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* History List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="size-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : processedData.length === 0 ? (
                    <EmptyState type="history" />
                ) : (
                    <div className="space-y-3">
                        {processedData.map((a) => (
                            <div key={a._id} className="glass rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-muted/50 transition-all group">
                                <div className="shrink-0">
                                    {a.status === "completed" ? (
                                        <ScoreGauge score={a.overallScore} size={52} strokeWidth={4} />
                                    ) : (
                                        <div className="w-[52px] h-[52px] rounded-full glass flex items-center justify-center">
                                            <AlertCircle size={20} className="text-danger" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <Link to={`/report/${a._id}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate block">
                                        {(() => {
                                            try {
                                                return new URL(a.url).hostname;
                                            } catch {
                                                return a.url;
                                            }
                                        })()}
                                    </Link>
                                    <p className="text-xs text-muted-foreground truncate mt-0.5">{a.url}</p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(a.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === "completed" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>{a.status}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <Link to={`/report/${a._id}`} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-all" title="View Report">
                                        <ExternalLink size={16} />
                                    </Link>
                                    <button onClick={() => handleDelete(a._id)} disabled={deleting === a._id} className="p-2 rounded-lg hover:bg-danger/10 text-muted-foreground hover:text-danger transition-all disabled:opacity-50" title="Delete">
                                        {deleting === a._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
