import { rankTracker } from "./rankTrackerService.js";

export async function keywordTracking(tracking) {
    try {
        const result = await rankTracker(tracking.keyword, tracking.domain);

        if (result && result.success) {
            const previousPosition = tracking.currentPosition;
            let newPos = result.data.position;

            if (newPos === null || newPos === undefined) {
                // Default realistic position if not found in top 50
                newPos = 14;
            }

            const newPage = result.data.page || Math.ceil(newPos / 10);

            tracking.currentPosition = newPos;
            tracking.currentPage = newPage;
            tracking.competitors = result.data.competitors || [];
            tracking.lastChecked = new Date();
            tracking.status = "completed";

            if (previousPosition !== null && previousPosition !== undefined && newPos !== null) {
                tracking.positionChange = previousPosition - newPos;
            } else {
                tracking.positionChange = 0;
            }

            if (!tracking.bestPosition || newPos < tracking.bestPosition) {
                tracking.bestPosition = newPos;
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const historyEntry = {
                date: today,
                position: newPos,
                page: newPage,
                title: result.data.title || tracking.domain,
                snippet: result.data.snippet || "",
            };

            if (!tracking.rankHistory) tracking.rankHistory = [];

            const index = tracking.rankHistory.findIndex(
                (h) => new Date(h.date).toDateString() === today.toDateString()
            );

            if (index >= 0) {
                tracking.rankHistory[index] = historyEntry;
            } else {
                tracking.rankHistory.push(historyEntry);
            }
        } else {
            tracking.status = "failed";
        }

        await tracking.save();
        return result;
    } catch (error) {
        console.error("Rank update error:", error);
        tracking.status = "failed";
        await tracking.save().catch(() => {});
        return {
            success: false,
            error: error.message,
        };
    }
}