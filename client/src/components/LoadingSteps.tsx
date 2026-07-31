import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";

interface Step {
    id: string;
    label: string;
}

const DEFAULT_STEPS: Step[] = [
    { id: "connect", label: "Connecting Playwright Browser" },
    { id: "scrape", label: "Scraping Website DOM & Assets" },
    { id: "metadata", label: "Extracting Meta Tags & Heading Hierarchy" },
    { id: "audit", label: "Running 13-Metric SEO Audit Engine" },
    { id: "ai", label: "Generating AI SEO Consultant Analysis" },
    { id: "save", label: "Saving Analytical Report to Database" }
];

export default function LoadingSteps({ steps = DEFAULT_STEPS, onComplete }: { steps?: Step[]; onComplete?: () => void }) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStepIndex((prev) => {
                if (prev < steps.length - 1) {
                    return prev + 1;
                }
                clearInterval(interval);
                if (onComplete) onComplete();
                return prev;
            });
        }, 2200);

        return () => clearInterval(interval);
    }, [steps, onComplete]);

    return (
        <div className="bg-card border border-border rounded-2xl p-8 max-w-lg mx-auto shadow-xl space-y-6 text-left animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Sparkles size={20} className="animate-spin" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-foreground">Analyzing Website</h3>
                    <p className="text-xs text-muted-foreground">Please wait while RankPilot performs automated audits...</p>
                </div>
            </div>

            <div className="space-y-3">
                {steps.map((step, idx) => {
                    const isDone = idx < currentStepIndex;
                    const isCurrent = idx === currentStepIndex;

                    return (
                        <div
                            key={step.id}
                            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                                isDone
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                    : isCurrent
                                    ? "bg-primary/10 border-primary/40 text-primary font-semibold"
                                    : "bg-muted/30 border-border/50 text-muted-foreground opacity-50"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                {isDone ? (
                                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                                ) : isCurrent ? (
                                    <Loader2 size={18} className="animate-spin text-primary shrink-0" />
                                ) : (
                                    <div className="w-4.5 h-4.5 rounded-full border border-muted-foreground/40 shrink-0" />
                                )}
                                <span className="text-xs">{step.label}</span>
                            </div>
                            {isDone && <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Done</span>}
                            {isCurrent && <span className="text-[10px] font-bold uppercase tracking-wider text-primary animate-pulse">Running</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
