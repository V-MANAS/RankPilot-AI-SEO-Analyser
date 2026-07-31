import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SearchIcon, ArrowRightIcon, GlobeIcon, BrainIcon, ShieldCheckIcon, SwordsIcon, TargetIcon, BarChart3Icon, FileTextIcon } from "lucide-react";

export default function Home() {
    const [url, setUrl] = useState("");
    const navigate = useNavigate();

    const handleAnalyze = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            navigate(`/analyze?url=${encodeURIComponent(url.trim())}`);
        } else {
            navigate("/analyze");
        }
    };

    return (
        <div className="min-h-screen pt-16 md:pt-24 bg-background">
            {/* Hero Section */}
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-6">
                    <BrainIcon size={14} />
                    <span>AI-Powered SEO Analytics Platform</span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-medium text-foreground mb-6 leading-tight">
                    Analyze & Optimize Your Website's <span className="gradient-text">SEO Performance</span>
                </h1>

                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
                    Get instant technical SEO audits, AI-driven recommendations, competitor benchmarking, and daily rank tracking in under 30 seconds.
                </p>

                {/* Search Bar Input */}
                <form onSubmit={handleAnalyze} className="max-w-xl mx-auto mb-12">
                    <div className="border border-primary/20 rounded-full p-1.5 px-2 flex items-center gap-2 bg-card shadow-lg">
                        <div className="flex items-center gap-3 flex-1 px-3">
                            <SearchIcon size={20} className="text-muted-foreground shrink-0" />
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Enter website URL (e.g., example.com)"
                                className="w-full bg-transparent text-foreground placeholder-muted-foreground outline-none text-base py-3"
                                id="home-url-input"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-primary px-6 py-3 rounded-full flex items-center gap-2 text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
                            style={{ color: "var(--background)" }}
                            id="home-submit-btn"
                        >
                            Analyze <ArrowRightIcon className="size-4 shrink-0" />
                        </button>
                    </div>
                </form>

                {/* Example Pills */}
                <div className="text-sm text-muted-foreground">
                    Try analyzing:{" "}
                    {["stripe.com", "github.com", "vercel.com"].map((ex, i) => (
                        <button
                            key={ex}
                            onClick={() => setUrl(ex)}
                            className="text-primary hover:underline mx-1"
                        >
                            {ex}{i < 2 ? "," : ""}
                        </button>
                    ))}
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-4 py-16 border-t border-border/50">
                <div className="text-center mb-12">
                    <h2 className="text-2xl sm:text-3xl font-medium text-foreground mb-3">
                        Comprehensive SEO Toolkit
                    </h2>
                    <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                        Everything you need to audit, track, and outrank your competitors online.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass p-6 rounded-2xl hover:border-primary/40 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                            <GlobeIcon size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Technical SEO Audits</h3>
                        <p className="text-sm text-muted-foreground">
                            Deep scan heading structure, meta tags, canonical URLs, image alt attributes, and link distributions.
                        </p>
                    </div>

                    <div className="glass p-6 rounded-2xl hover:border-primary/40 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-4">
                            <BrainIcon size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">AI SEO Consultant</h3>
                        <p className="text-sm text-muted-foreground">
                            Get prioritized recommendations, score impact estimates, and ready-to-use code fixes generated by Gemini AI.
                        </p>
                    </div>

                    <div className="glass p-6 rounded-2xl hover:border-primary/40 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                            <SwordsIcon size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Competitor Analysis</h3>
                        <p className="text-sm text-muted-foreground">
                            Compare two websites side-by-side, highlight advantages, calculate metrics won, and export AI winner summaries.
                        </p>
                    </div>

                    <div className="glass p-6 rounded-2xl hover:border-primary/40 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                            <TargetIcon size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Rank Tracker</h3>
                        <p className="text-sm text-muted-foreground">
                            Monitor keyword positions daily on Google, track SERP changes, and inspect top competitor snippets.
                        </p>
                    </div>

                    <div className="glass p-6 rounded-2xl hover:border-primary/40 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                            <BarChart3Icon size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Historical Trends</h3>
                        <p className="text-sm text-muted-foreground">
                            Visualize performance velocity over 7d, 30d, 90d, and All Time with interactive multi-metric charts.
                        </p>
                    </div>

                    <div className="glass p-6 rounded-2xl hover:border-primary/40 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                            <FileTextIcon size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Branded PDF Exports</h3>
                        <p className="text-sm text-muted-foreground">
                            Generate and download executive PDF reports for clients and team stakeholders in 1 click.
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-4xl mx-auto px-4 py-16 text-center border-t border-border/50">
                <h2 className="text-3xl font-medium text-foreground mb-4">
                    Ready to Boost Your SEO Rankings?
                </h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">
                    Run your first automated SEO audit now in under 30 seconds.
                </p>
                <Link
                    to="/analyze"
                    className="inline-flex items-center gap-2 bg-primary px-8 py-3.5 rounded-full text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
                    style={{ color: "var(--background)" }}
                >
                    Start Free Audit <ArrowRightIcon size={18} />
                </Link>
            </div>
        </div>
    );
}
