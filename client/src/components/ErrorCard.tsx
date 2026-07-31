import React from "react";
import { AlertTriangle, RefreshCw, ShieldAlert, Globe, Clock, ZapOff, WifiOff } from "lucide-react";

export type ErrorType = "timeout" | "blocked" | "invalid_url" | "browserbase" | "gemini" | "network" | "generic";

interface ErrorCardProps {
    type?: ErrorType;
    message?: string;
    onRetry?: () => void;
}

export default function ErrorCard({ type = "generic", message, onRetry }: ErrorCardProps) {
    const errorConfigs = {
        timeout: {
            icon: <Clock size={32} className="text-amber-400" />,
            title: "Browser Navigation Timeout Exceeded",
            desc: "The target website took longer than 30 seconds to respond. The server might be experiencing high load or anti-bot delays."
        },
        blocked: {
            icon: <ShieldAlert size={32} className="text-red-400" />,
            title: "Website Access Blocked (HTTP 403)",
            desc: "The target website has bot protection (Cloudflare, Imperva) blocking headless crawlers."
        },
        invalid_url: {
            icon: <Globe size={32} className="text-purple-400" />,
            title: "Invalid Website URL Provided",
            desc: "Please ensure you entered a valid domain name or full URL (e.g. https://example.com)."
        },
        browserbase: {
            icon: <ZapOff size={32} className="text-amber-400" />,
            title: "Browserbase Session Limit Reached",
            desc: "Switching automatically to local Playwright headless crawler for backup processing."
        },
        gemini: {
            icon: <AlertTriangle size={32} className="text-amber-400" />,
            title: "AI Analysis Engine Timeout",
            desc: "The AI consultant failed to complete model synthesis. Defaulting to local metric evaluation rules."
        },
        network: {
            icon: <WifiOff size={32} className="text-red-400" />,
            title: "Network & API Connection Error",
            desc: "Unable to connect to RankPilot backend server on port 5000. Ensure the server is online."
        },
        generic: {
            icon: <AlertTriangle size={32} className="text-red-400" />,
            title: "Audit Execution Error",
            desc: "An unexpected error occurred while processing the SEO analysis."
        }
    };

    const cfg = errorConfigs[type] || errorConfigs.generic;
    const finalDesc = message || cfg.desc;

    return (
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 max-w-lg mx-auto text-center space-y-4 shadow-md my-6">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
                {cfg.icon}
            </div>
            <div className="space-y-1.5">
                <h3 className="text-base font-bold text-foreground">{cfg.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">{finalDesc}</p>
            </div>
            {onRetry && (
                <div className="pt-2">
                    <button
                        onClick={onRetry}
                        className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold inline-flex items-center gap-2 hover:opacity-90 transition-all"
                        style={{ color: "var(--background)" }}
                    >
                        <RefreshCw size={14} />
                        <span>Retry Analysis</span>
                    </button>
                </div>
            )}
        </div>
    );
}
