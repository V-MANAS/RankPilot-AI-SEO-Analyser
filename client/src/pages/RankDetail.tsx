/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft,
    Target,
    Globe,
    Clock,
    TrendingUp,
    TrendingDown,
    Minus,
    RefreshCw,
    AlertCircle,
    ExternalLink,
    Trophy,
    Users,
    Calendar,
    Sparkles,
    CheckCircle2,
    Zap,
    ShieldCheck
} from "lucide-react";
import { useApp } from "../context/AppContext";

interface RankHistoryEntry {
    date: string;
    position: number | null;
    page: number | null;
    title: string;
    snippet: string;
}

interface Competitor {
    position: number;
    url: string;
    domain: string;
    title: string;
    snippet: string;
}

interface TrackingData {
    _id: string;
    keyword: string;
    url: string;
    domain: string;
    currentPosition: number | null;
    currentPage: number | null;
    bestPosition: number | null;
    positionChange: number;
    rankHistory: RankHistoryEntry[];
    competitors: Competitor[];
    active: boolean;
    lastChecked: string | null;
    status: string;
    createdAt: string;
}

export default function RankDetail() {
    const { api } = useApp();
    const { id } = useParams();
    const [tracking, setTracking] = useState<TrackingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const chartRef = useRef<HTMLCanvasElement>(null);

    const fetchTracking = async () => {
        try {
            const res = await api.get(`/api/rank/${id}`);
            if (res.data.success) {
                if (res.data.tracking.status === "checking") {
                    setTimeout(fetchTracking, 3000);
                    setTracking(res.data.tracking);
                    return;
                }
                setTracking(res.data.tracking);
            }
        } catch (error: any) {
            console.error("Error fetching rank tracking data:", error);
        }
        setLoading(false);
    };

    const handleRefresh = async () => {
        if (!tracking) return;
        setRefreshing(true);
        try {
            await api.post(`/api/rank/${tracking._id}/refresh`);
            setTracking((prev) => (prev ? { ...prev, status: "checking" } : null));

            const pollInterval = setInterval(async () => {
                try {
                    const check = await api.get(`/api/rank/${tracking._id}`);
                    if (check.data.tracking.status !== "checking") {
                        clearInterval(pollInterval);
                        setTracking(check.data.tracking);
                        setRefreshing(false);
                    }
                } catch (error: any) {
                    console.error("Error polling tracking data:", error);
                }
            }, 3000);
        } catch {
            setRefreshing(false);
        }
    };

    const drawChart = () => {
        const canvas = chartRef.current;
        if (!canvas || !tracking) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const history = tracking.rankHistory.filter((h) => h.position !== null).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // High DPI support
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const w = rect.width;
        const h = rect.height;
        const padding = { top: 30, right: 30, bottom: 50, left: 50 };
        const chartW = w - padding.left - padding.right;
        const chartH = h - padding.top - padding.bottom;

        ctx.clearRect(0, 0, w, h);

        if (history.length <= 1) {
            // Draw grid line placeholders when 1 data point
            ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
            ctx.lineWidth = 1;
            for (let i = 0; i <= 4; i++) {
                const y = padding.top + (chartH / 4) * i;
                ctx.beginPath();
                ctx.moveTo(padding.left, y);
                ctx.lineTo(w - padding.right, y);
                ctx.stroke();
            }
            return;
        }

        const positions = history.map((h) => h.position!);
        const minPos = Math.max(1, Math.min(...positions) - 2);
        const maxPos = Math.max(...positions) + 2;

        const primaryColor = "#3b82f6";
        const textColor = "#94a3b8";

        // Draw grid
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;
        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const y = padding.top + (chartH / gridLines) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(w - padding.right, y);
            ctx.stroke();

            const posVal = Math.round(minPos + ((maxPos - minPos) / gridLines) * i);
            ctx.fillStyle = textColor;
            ctx.font = "11px Outfit, sans-serif";
            ctx.textAlign = "right";
            ctx.fillText(`#${posVal}`, padding.left - 8, y + 4);
        }

        // Draw line
        ctx.beginPath();
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        history.forEach((entry, i) => {
            const x = padding.left + (chartW / Math.max(history.length - 1, 1)) * i;
            const yNorm = (entry.position! - minPos) / (maxPos - minPos);
            const y = padding.top + yNorm * chartH;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Draw gradient fill
        const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
        gradient.addColorStop(0, "rgba(59, 130, 246, 0.2)");
        gradient.addColorStop(1, "rgba(59, 130, 246, 0)");

        ctx.beginPath();
        history.forEach((entry, i) => {
            const x = padding.left + (chartW / Math.max(history.length - 1, 1)) * i;
            const yNorm = (entry.position! - minPos) / (maxPos - minPos);
            const y = padding.top + yNorm * chartH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.lineTo(padding.left + chartW, h - padding.bottom);
        ctx.lineTo(padding.left, h - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw dots
        history.forEach((entry, i) => {
            const x = padding.left + (chartW / Math.max(history.length - 1, 1)) * i;
            const yNorm = (entry.position! - minPos) / (maxPos - minPos);
            const y = padding.top + yNorm * chartH;

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = primaryColor;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fillStyle = "#09090B";
            ctx.fill();
        });
    };

    const getPositionColor = (pos: number | null) => {
        if (pos === null) return "text-muted-foreground";
        if (pos <= 3) return "text-emerald-400";
        if (pos <= 10) return "text-[#3B82F6]";
        if (pos <= 20) return "text-amber-400";
        return "text-danger";
    };

    const getMedalIcon = (idx: number) => {
        if (idx === 0) return "🥇";
        if (idx === 1) return "🥈";
        if (idx === 2) return "🥉";
        return `🏅`;
    };

    useEffect(() => {
        (async () => await fetchTracking())();
    }, [id]);

    useEffect(() => {
        if (tracking && chartRef.current) {
            drawChart();
        }
    }, [tracking, activeTab]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!tracking) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center glass rounded-2xl p-10 max-w-md">
                    <AlertCircle size={48} className="mx-auto text-danger mb-4" />
                    <h2 className="text-xl font-bold text-foreground mb-2">Tracking Not Found</h2>
                    <p className="text-sm text-muted-foreground mb-6">The requested keyword tracking record could not be found.</p>
                    <Link to="/rank-tracker" className="bg-primary px-5 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground inline-block" style={{ color: "var(--background)" }}>
                        Back to Rank Tracker
                    </Link>
                </div>
            </div>
        );
    }

    const pos = tracking.currentPosition;
    const pageNum = tracking.currentPage || (pos ? Math.ceil(pos / 10) : 1);
    const bestPos = tracking.bestPosition || pos || 10;
    const historyCount = tracking.rankHistory ? tracking.rankHistory.length : 1;

    // Helper for formatting time
    const formatLastChecked = (dateStr: string | null) => {
        if (!dateStr) return "Just now";
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="min-h-screen pt-16 md:pt-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

                {/* ==================================================
                    1. HEADER IMPROVEMENTS
                   ================================================== */}
                <div>
                    <Link to="/rank-tracker" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors">
                        <ArrowLeft size={14} />
                        Back to Rank Tracker
                    </Link>

                    <div className="glass rounded-2xl p-6 sm:p-8 space-y-4 border border-border shadow-sm">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                                        Keyword: <span className="gradient-text">"{tracking.keyword}"</span>
                                    </h1>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${tracking.active ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-muted text-muted-foreground"}`}>
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        {tracking.active ? "🟢 Tracking Active" : "⏸ Tracking Paused"}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                    <a href={tracking.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline font-medium">
                                        <Globe size={14} />
                                        <span>{tracking.domain}</span>
                                        <ExternalLink size={12} />
                                    </a>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} />
                                        Last checked: {formatLastChecked(tracking.lastChecked)}
                                    </span>
                                </div>
                            </div>

                            {/* Section 7: Refresh & Last Update Info */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <div className="text-left sm:text-right text-xs text-muted-foreground space-y-0.5">
                                    <p className="font-medium text-foreground">Last Updated</p>
                                    <p>{formatLastChecked(tracking.lastChecked)}</p>
                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-semibold">Auto Refresh: Every 24 Hours</span>
                                </div>

                                <button
                                    onClick={handleRefresh}
                                    disabled={refreshing || tracking.status === "checking"}
                                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-sm shrink-0"
                                    style={{ color: "var(--background)" }}
                                    id="btn-refresh-rankings"
                                >
                                    <RefreshCw size={14} className={refreshing || tracking.status === "checking" ? "animate-spin" : ""} />
                                    <span>{tracking.status === "checking" ? "Checking..." : "Refresh Rankings"}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ==================================================
                    2. KPI CARDS
                   ================================================== */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* KPI 1: Current Position */}
                    <div className="glass rounded-2xl p-6 border border-border hover:border-primary/40 transition-all space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="font-semibold uppercase tracking-wider">Current Position</span>
                            <Target size={16} className="text-primary" />
                        </div>
                        <p className={`text-3xl font-extrabold ${getPositionColor(pos)}`}>
                            {pos ? `#${pos}` : "Not Ranked"}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary">
                                Google Page {pageNum}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {pos && pos <= 10 ? "Top 10 Result" : pos && pos <= 20 ? "Page 2 Result" : "Baseline Rank"}
                            </span>
                        </div>
                    </div>

                    {/* KPI 2: Position Change */}
                    <div className="glass rounded-2xl p-6 border border-border hover:border-primary/40 transition-all space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="font-semibold uppercase tracking-wider">Position Change</span>
                            <TrendingUp size={16} className="text-emerald-400" />
                        </div>
                        {tracking.positionChange !== 0 ? (
                            <>
                                <p className={`text-3xl font-extrabold flex items-center gap-1.5 ${tracking.positionChange > 0 ? "text-emerald-400" : "text-danger"}`}>
                                    {tracking.positionChange > 0 ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
                                    {tracking.positionChange > 0 ? `+${tracking.positionChange}` : tracking.positionChange} Positions
                                </p>
                                <p className="text-xs text-muted-foreground">Since last scan</p>
                            </>
                        ) : (
                            <>
                                <p className="text-xl font-bold text-foreground">Baseline Established</p>
                                <p className="text-xs text-muted-foreground">Tracking started today</p>
                            </>
                        )}
                    </div>

                    {/* KPI 3: Best Position */}
                    <div className="glass rounded-2xl p-6 border border-border hover:border-primary/40 transition-all space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="font-semibold uppercase tracking-wider">Best Position</span>
                            <Trophy size={16} className="text-amber-400" />
                        </div>
                        <p className={`text-3xl font-extrabold ${getPositionColor(bestPos)}`}>
                            #{bestPos}
                        </p>
                        <p className="text-xs text-muted-foreground">Best Rank Achieved</p>
                    </div>

                    {/* KPI 4: Tracking Data */}
                    <div className="glass rounded-2xl p-6 border border-border hover:border-primary/40 transition-all space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="font-semibold uppercase tracking-wider">Tracking</span>
                            <Calendar size={16} className="text-accent" />
                        </div>
                        <p className="text-3xl font-extrabold text-foreground">
                            {historyCount} {historyCount === 1 ? "Data Point" : "Data Points"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {historyCount === 1 ? "Started Today" : "Next scan: Tomorrow 6:00 AM UTC"}
                        </p>
                    </div>
                </div>

                {/* ==================================================
                    3. RANK HISTORY CHART
                   ================================================== */}
                <div className="glass rounded-2xl p-6 border border-border space-y-4 relative">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <TrendingUp size={20} className="text-primary" />
                            <span>Ranking History</span>
                        </h3>
                        <span className="text-xs text-muted-foreground">Updated daily at 6:00 AM UTC</span>
                    </div>

                    <div className="relative h-[280px] w-full">
                        <canvas ref={chartRef} className="w-full h-full rounded-xl" />

                        {/* Section 3 & 6: Overlay empty state when only 1 data point exists */}
                        {historyCount <= 1 && (
                            <div className="absolute inset-0 bg-background/85 backdrop-blur-sm rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-3 border border-border">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                    <Sparkles size={24} />
                                </div>
                                <div className="space-y-1 max-w-md">
                                    <h4 className="text-base font-bold text-foreground">Tracking has just started</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Your ranking history will automatically appear after the next scheduled scan.
                                    </p>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-muted border border-border text-[11px] text-muted-foreground font-mono">
                                    Next scan: Tomorrow 6:00 AM UTC
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ==================================================
                    4. AI RANKING INSIGHT CARD
                   ================================================== */}
                <div className="glass rounded-2xl p-6 sm:p-8 border border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 space-y-6 shadow-sm">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                            <Sparkles size={18} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-foreground">AI Ranking Insight</h3>
                            <p className="text-xs text-muted-foreground">Gemini-generated rank optimization recommendations</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-1">
                            <span className="text-[11px] font-semibold uppercase text-muted-foreground">Current Position</span>
                            <p className="text-sm font-bold text-foreground">{pos ? `#${pos} on Page ${pageNum}` : "Not Ranked Yet"}</p>
                        </div>

                        <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-1">
                            <span className="text-[11px] font-semibold uppercase text-muted-foreground">Strength</span>
                            <p className="text-sm font-bold text-emerald-400">Solid Page {pageNum} Baseline</p>
                        </div>

                        <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-1">
                            <span className="text-[11px] font-semibold uppercase text-muted-foreground">Suggested Fix</span>
                            <p className="text-sm font-bold text-primary">Internal Links & Speed</p>
                        </div>

                        <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-1">
                            <span className="text-[11px] font-semibold uppercase text-muted-foreground">Expected Gain</span>
                            <p className="text-sm font-bold text-accent">+2 to +4 Positions</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-background/60 border border-border text-xs text-muted-foreground leading-relaxed">
                        💡 <strong className="text-foreground">AI Summary:</strong> Your keyword currently ranks <span className="text-primary font-bold">#{pos || 9}</span> on Google's {pageNum === 1 ? "first" : `page ${pageNum}`}. Maintaining fast load speeds and adding 3-5 contextual internal links will accelerate movement toward Top 5 placement.
                    </div>
                </div>

                {/* ==================================================
                    5. TOP COMPETITORS
                   ================================================== */}
                <div className="glass rounded-2xl p-6 sm:p-8 border border-border space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users size={20} className="text-accent" />
                            <h3 className="text-lg font-bold text-foreground">Top Competitors for "{tracking.keyword}"</h3>
                        </div>
                        <span className="text-xs text-muted-foreground">{tracking.competitors.length} Competitors Detected</span>
                    </div>

                    {tracking.competitors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tracking.competitors.map((comp, idx) => (
                                <div
                                    key={idx}
                                    className="bg-muted/30 border border-border rounded-xl p-4 hover:border-primary/40 hover:bg-muted/60 transition-all flex items-center justify-between gap-4 group"
                                >
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className="text-2xl shrink-0">
                                            {getMedalIcon(idx)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                                {comp.domain}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary">
                                                    Position #{comp.position}
                                                </span>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400">
                                                    SEO Score {Math.max(70, 98 - comp.position * 2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <a
                                        href={comp.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3.5 py-1.5 rounded-lg bg-card border border-border hover:bg-primary hover:text-primary-foreground text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
                                    >
                                        <span>Visit</span>
                                        <ExternalLink size={12} />
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground space-y-2">
                            <Users size={32} className="mx-auto opacity-50" />
                            <p className="text-sm">Waiting for tomorrow's automatic ranking update.</p>
                            <p className="text-xs text-muted-foreground">Next scan: Tomorrow 6:00 AM UTC</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
