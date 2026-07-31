import React from "react";

export function CardSkeleton() {
    return (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="h-4 bg-muted/60 rounded w-1/3" />
                <div className="w-12 h-12 rounded-full bg-muted/60" />
            </div>
            <div className="h-3 bg-muted/40 rounded w-2/3" />
            <div className="grid grid-cols-4 gap-2 pt-2">
                <div className="h-8 bg-muted/40 rounded" />
                <div className="h-8 bg-muted/40 rounded" />
                <div className="h-8 bg-muted/40 rounded" />
                <div className="h-8 bg-muted/40 rounded" />
            </div>
        </div>
    );
}

export function RowSkeleton() {
    return (
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-muted/60 shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted/60 rounded w-1/2" />
                <div className="h-3 bg-muted/40 rounded w-1/4" />
            </div>
            <div className="w-16 h-8 bg-muted/50 rounded shrink-0" />
        </div>
    );
}
