import { toast } from "react-hot-toast";

export async function exportElementToPDF(elementId: string, filename: string = "RankPilot-Report.pdf") {
    const element = document.getElementById(elementId);
    if (!element) {
        toast.error("Unable to locate element for PDF export");
        return;
    }

    const toastId = toast.loading("Preparing PDF print preview...");

    try {
        // Try html2canvas + jsPDF with dynamic import to isolate oklab CSS errors
        const html2canvas = (await import("html2canvas")).default;
        const jsPDF = (await import("jspdf")).default;

        const canvas = await html2canvas(element, {
            scale: 1.5,
            useCORS: true,
            logging: false,
            backgroundColor: "#09090B",
            onclone: (clonedDoc) => {
                // Ensure no unsupported CSS variables crash html2canvas
                const el = clonedDoc.getElementById(elementId);
                if (el) el.style.color = "#FFFFFF";
            }
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "px",
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save(filename);
        toast.success("PDF Downloaded successfully!", { id: toastId });
    } catch (err) {
        console.warn("Falling back to window print:", err);
        toast.dismiss(toastId);
        window.print();
    }
}
