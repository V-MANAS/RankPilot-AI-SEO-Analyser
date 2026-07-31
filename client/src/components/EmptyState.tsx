import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search, Swords, Target, BarChart2 } from "lucide-react";

interface EmptyStateProps {
    type?: "reports" | "comparisons" | "ranks" | "history" | "generic";
    title?: string;
    description?: string;
    actionLabel?: string;
    actionLink?: string;
    onAction?: () => void;
}

export default function EmptyState({
    type = "reports",
    title,
    description,
    actionLabel,
    actionLink,
    onAction
}: EmptyStateProps) {
    const configs = {
        reports: {
            icon: <Search size={36} className="text-primary" />,
            defaultTitle: "No Reports Yet",
            defaultDesc: "Start by analyzing your first website URL to unlock detailed 13-metric SEO audits.",
            defaultLabel: "Analyze Website",
            defaultLink: "/analyze"
        },
        comparisons: {
            icon: <Swords size={36} className="text-accent" />,
            defaultTitle: "No Comparisons Found",
            defaultDesc: "Compare two websites side-by-side to discover competitive keyword leads & technical advantages.",
            defaultLabel: "Compare Websites",
            defaultLink: "/competitor-analysis"
        },
        ranks: {
            icon: <Target size={36} className="text-emerald-400" />,
            defaultTitle: "No Keywords Tracked",
            defaultDesc: "Track search engine positions across target keywords and monitor rank movement against competitors.",
            defaultLabel: "Add Keywords",
            defaultLink: "/rank-tracker"
        },
        history: {
            icon: <BarChart2 size={36} className="text-purple-400" />,
            defaultTitle: "No Historical Data Found",
            defaultDesc: "Try adjusting your search query or status filter criteria to find saved records.",
            defaultLabel: "Run New Analysis",
            defaultLink: "/analyze"
        },
        generic: {
            icon: <Search size={36} className="text-muted-foreground" />,
            defaultTitle: "No Data Available",
            defaultDesc: "No items match the current view criteria.",
            defaultLabel: "Back to Dashboard",
            defaultLink: "/dashboard"
        }
    };

    const cfg = configs[type] || configs.generic;
    const finalTitle = title || cfg.defaultTitle;
    const finalDesc = description || cfg.defaultDesc;
    const finalLabel = actionLabel || cfg.defaultLabel;
    const finalLink = actionLink || cfg.defaultLink;

    return (
        <div className="bg-card border border-border rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm space-y-4 my-6">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border/80 flex items-center justify-center mx-auto">
                {cfg.icon}
            </div>
            <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-foreground">{finalTitle}</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">{finalDesc}</p>
            </div>
            {(finalLink || onAction) && (
                <div className="pt-2">
                    {onAction ? (
                        <button
                            onClick={onAction}
                            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold inline-flex items-center gap-2 hover:opacity-90 transition-all"
                            style={{ color: "var(--background)" }}
                        >
                            <span>{finalLabel}</span>
                            <ArrowRight size={14} />
                        </button>
                    ) : (
                        <Link
                            to={finalLink}
                            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold inline-flex items-center gap-2 hover:opacity-90 transition-all"
                            style={{ color: "var(--background)" }}
                        >
                            <span>{finalLabel}</span>
                            <ArrowRight size={14} />
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
