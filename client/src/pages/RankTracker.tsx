/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Target,
    Plus,
    RefreshCw,
    Trash2,
    TrendingUp,
    TrendingDown,
    Minus,
    ExternalLink,
    Clock,
    Loader2,
    X,
    Search,
    Globe,
    AlertCircle,
    Eye,
    EyeOff,
    Filter,
    ArrowUpDown,
    Trophy,
    Sparkles
} from "lucide-react";
import { useApp } from "../context/AppContext";
import EmptyState from "../components/EmptyState";

interface KeywordItem {
    _id: string;
    keyword: string;
    url: string;
    domain: string;
    currentPosition: number | null;
    currentPage: number | null;
    bestPosition: number | null;
    positionChange: number;
    active: boolean;
    lastChecked: string | null;
    status: string;
    createdAt: string;
    competitors: {
        position: number;
        url: string;
        domain: string;
        title: string;
        snippet: string;
    }[];
}

export default function RankTracker() {
    const { api } = useApp();

    const [keywords, setKeywords] = useState<KeywordItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newKeyword, setNewKeyword] = useState("");
    const [newUrl, setNewUrl] = useState("");
    const [adding, setAdding] = useState(false);
    const [addError, setAddError] = useState("");
    const [refreshing, setRefreshing] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    const fetchKeywords = async () => {
        try {
            const res = await api.get("/api/rank");
            if (res.data.success) {
                setKeywords(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching keywords:", error);
        }
        setLoading(false);
    };

    const handleAdd = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!newKeyword.trim() || !newUrl.trim()) return;

        setAdding(true);
        setAddError("");
        try {
            const res = await api.post("/api/rank/add", { keyword: newKeyword.trim(), url: newUrl.trim() });
            if (res.data.success) {
                setKeywords((prev) => [res.data.data, ...prev]);
                setNewKeyword("");
                setNewUrl("");
                setShowAddModal(false);

                const id = res.data.data._id;
                const pollInterval = setInterval(async () => {
                    try {
                        const check = await api.get(`/api/rank/${id}`);
                        if (check.data.tracking.status !== "checking") {
                            clearInterval(pollInterval);
                            setKeywords((prev) => prev.map((k) => (k._id === id ? check.data.tracking : k)));
                        }
                    } catch (error) {
                        console.error(error);
                    }
                }, 3000);
            }
        } catch (err: any) {
            setAddError(err.response?.data?.message || "Failed to add keyword");
        }
        setAdding(false);
    };

    const handleRefresh = async (id: string) => {
        setRefreshing(id);
        try {
            await api.post(`/api/rank/${id}/refresh`);
            setKeywords((prev) => prev.map((k) => (k._id === id ? { ...k, status: "checking" } : k)));

            const pollInterval = setInterval(async () => {
                try {
                    const check = await api.get(`/api/rank/${id}`);
                    if (check.data.tracking.status !== "checking") {
                        clearInterval(pollInterval);
                        setKeywords((prev) => prev.map((k) => (k._id === id ? check.data.tracking : k)));
                        setRefreshing(null);
                    }
                } catch (error) {
                    console.error(error);
                }
            }, 3000);
        } catch (err) {
            console.error("Refresh failed: ", err);
            setRefreshing(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this keyword tracking?")) return;
        setDeleting(id);

        try {
            await api.delete(`/api/rank/${id}`);
            setKeywords((prev) => prev.filter((k) => k._id !== id));
        } catch (err) {
            console.error("Delete failed: ", err);
        }
        setDeleting(null);
    };

    const handleToggle = async (id: string) => {
        try {
            const res = await api.put(`/api/rank/${id}/toggle`);
            if (res.data.success) {
                setKeywords((prev) => prev.map((k) => (k._id === id ? { ...k, active: res.data.tracking.active } : k)));
            }
        } catch (err) {
            console.error("Toggle failed: ", err);
        }
    };

    const getPositionBadge = (pos: number | null) => {
        if (pos === null) return { text: "Not Ranked", class: "text-muted-foreground bg-muted/50 border border-border" };
        if (pos <= 3) return { text: `#${pos}`, class: "text-emerald-400 bg-emerald-500/15 border border-emerald-500/30" };
        if (pos <= 10) return { text: `#${pos}`, class: "text-[#3B82F6] bg-primary/15 border border-primary/30" };
        if (pos <= 20) return { text: `#${pos}`, class: "text-amber-400 bg-amber-500/15 border border-amber-500/30" };
        return { text: `#${pos}`, class: "text-danger bg-danger/15 border border-danger/30" };
    };

    let processedData = [...(keywords || [])];

    if (searchQuery) {
        processedData = processedData.filter((k) => k.keyword.toLowerCase().includes(searchQuery.toLowerCase()) || k.domain.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (statusFilter !== "all") {
        if (statusFilter === "active") {
            processedData = processedData.filter((k) => k.active === true);
        } else if (statusFilter === "paused") {
            processedData = processedData.filter((k) => k.active === false);
        }
    }

    processedData.sort((a: any, b: any) => {
        if (sortBy === "newest") {
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        } else if (sortBy === "rank_asc") {
            return (a.currentPosition || 999) - (b.currentPosition || 999);
        } else if (sortBy === "rank_desc") {
            return (b.currentPosition || 0) - (a.currentPosition || 0);
        } else if (sortBy === "change") {
            return (b.positionChange || 0) - (a.positionChange || 0);
        }
        return 0;
    });

    useEffect(() => {
        (async () => await fetchKeywords())();
    }, []);

    return (
        <div className="min-h-screen pt-16 md:pt-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                            <span className="gradient-text">Rank Tracker</span>
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">Track keyword rankings on Google daily with AI insights and competitor analysis.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-primary px-5 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all flex items-center gap-2 self-start shadow-sm"
                        id="add-keyword-btn"
                        style={{ color: "var(--background)" }}
                    >
                        <Plus size={18} />
                        Track Keyword
                    </button>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2 flex-1 border border-border">
                        <Search size={18} className="text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search keywords or domains..."
                            className="bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none flex-1"
                            id="rank-search-input"
                        />
                    </div>

                    <div className="flex gap-3">
                        <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2 border border-border">
                            <Filter size={16} className="text-muted-foreground" />
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-transparent text-sm text-foreground outline-none cursor-pointer">
                                <option value="all" className="bg-background">All Status</option>
                                <option value="active" className="bg-background">Active</option>
                                <option value="paused" className="bg-background">Paused</option>
                            </select>
                        </div>
                        <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2 border border-border">
                            <ArrowUpDown size={16} className="text-muted-foreground" />
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent text-sm text-foreground outline-none cursor-pointer">
                                <option value="newest" className="bg-background">Newest First</option>
                                <option value="rank_asc" className="bg-background">Highest Ranked</option>
                                <option value="rank_desc" className="bg-background">Lowest Ranked</option>
                                <option value="change" className="bg-background">Biggest Gain</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Keywords List */}
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : processedData.length === 0 ? (
                    <EmptyState type="ranks" onAction={() => setShowAddModal(true)} />
                ) : (
                    <div className="space-y-4">
                        {processedData.map((kw) => {
                            const posBadge = getPositionBadge(kw.currentPosition);
                            const pageNum = kw.currentPage || (kw.currentPosition ? Math.ceil(kw.currentPosition / 10) : 1);
                            const bestPos = kw.bestPosition || kw.currentPosition || 10;

                            return (
                                <div
                                    key={kw._id}
                                    className={`glass rounded-2xl p-5 hover:border-primary/40 transition-all border border-border ${!kw.active ? "opacity-60" : ""}`}
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-5 justify-between">
                                        {/* Rank Badge + Info */}
                                        <div className="flex items-center gap-4">
                                            <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${posBadge.class}`}>
                                                {kw.status === "checking" ? <Loader2 size={24} className="animate-spin text-primary" /> : kw.currentPosition ? `#${kw.currentPosition}` : "—"}
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Link to={`/rank/${kw._id}`} className="text-base font-bold text-foreground hover:text-primary transition-colors truncate">
                                                        Keyword: "{kw.keyword}"
                                                    </Link>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${kw.active ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-muted text-muted-foreground"}`}>
                                                        {kw.active ? "🟢 Tracking Active" : "⏸ Paused"}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1 font-medium text-foreground">
                                                        <Globe size={12} />
                                                        {kw.domain}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold text-[10px]">
                                                        Google Page {pageNum}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {kw.lastChecked ? `Checked ${new Date(kw.lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Just added"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stats Row */}
                                        <div className="flex items-center gap-6 text-center shrink-0">
                                            <div className="text-center">
                                                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Position Change</span>
                                                {kw.positionChange !== 0 ? (
                                                    <span className={`text-sm font-bold flex items-center justify-center gap-1 ${kw.positionChange > 0 ? "text-emerald-400" : "text-danger"}`}>
                                                        {kw.positionChange > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                        {kw.positionChange > 0 ? `+${kw.positionChange}` : kw.positionChange}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-semibold text-foreground">Baseline Established</span>
                                                )}
                                            </div>

                                            <div className="text-center">
                                                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Best Position</span>
                                                <span className="text-sm font-bold text-amber-400 flex items-center justify-center gap-1">
                                                    <Trophy size={14} />
                                                    #{bestPos}
                                                </span>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-1.5 pl-2 border-l border-border">
                                                <Link to={`/rank/${kw._id}`} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-all" title="View Detailed Report">
                                                    <ExternalLink size={16} />
                                                </Link>
                                                <button onClick={() => handleRefresh(kw._id)} disabled={refreshing === kw._id || kw.status === "checking"} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-all disabled:opacity-30" title="Refresh Rankings">
                                                    <RefreshCw size={16} className={refreshing === kw._id || kw.status === "checking" ? "animate-spin" : ""} />
                                                </button>
                                                <button onClick={() => handleToggle(kw._id)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-all" title={kw.active ? "Pause Tracking" : "Resume Tracking"}>
                                                    {kw.active ? <Eye size={16} className="text-emerald-400" /> : <EyeOff size={16} className="text-muted-foreground" />}
                                                </button>
                                                <button onClick={() => handleDelete(kw._id)} disabled={deleting === kw._id} className="p-2 rounded-lg hover:bg-danger/10 text-muted-foreground hover:text-danger transition-all disabled:opacity-50" title="Delete">
                                                    {deleting === kw._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <Target size={18} className="text-primary" />
                                Track New Keyword
                            </h2>
                            <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                                <X size={20} />
                            </button>
                        </div>

                        {addError && (
                            <div className="px-4 py-3 rounded-xl severity-critical text-xs flex items-center gap-2">
                                <AlertCircle size={16} className="shrink-0" />
                                {addError}
                            </div>
                        )}

                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label htmlFor="modal-keyword" className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                                    Keyword
                                </label>
                                <div className="relative">
                                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        id="modal-keyword"
                                        type="text"
                                        value={newKeyword}
                                        onChange={(e) => setNewKeyword(e.target.value)}
                                        placeholder='e.g., "full stack"'
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm outline-none focus:border-primary/50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="modal-url" className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                                    Website Domain / URL
                                </label>
                                <div className="relative">
                                    <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        id="modal-url"
                                        type="text"
                                        value={newUrl}
                                        onChange={(e) => setNewUrl(e.target.value)}
                                        placeholder="e.g., greatstack.dev"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm outline-none focus:border-primary/50"
                                    />
                                </div>
                            </div>

                            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground flex items-start gap-2">
                                <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
                                <p>We'll check Google for your keyword, rank position, page number, and top 10 competitors automatically.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={adding}
                                className="w-full py-3 rounded-xl bg-primary font-semibold text-sm text-primary-foreground flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                                style={{ color: "var(--background)" }}
                            >
                                {adding ? <Loader2 size={18} className="animate-spin" /> : <>Start Tracking</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
