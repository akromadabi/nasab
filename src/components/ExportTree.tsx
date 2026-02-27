"use client";

import { useState } from "react";
import {
    Download,
    Image as ImageIcon,
    FileText,
    Loader2,
    X,
} from "lucide-react";

interface ExportTreeProps {
    treeContainerRef: React.RefObject<HTMLDivElement | null>;
    baniName: string;
}

export default function ExportTree({ treeContainerRef, baniName }: ExportTreeProps) {
    const [exporting, setExporting] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [error, setError] = useState("");

    /**
     * Capture the tree by temporarily modifying the ORIGINAL element:
     * 1. Reset scale transform to 1
     * 2. Make overflow container visible
     * 3. Capture with html-to-image
     * 4. Restore everything
     */
    const captureTree = async (): Promise<string> => {
        const treeEl = treeContainerRef.current;
        if (!treeEl) throw new Error("Tree element not found");

        // Find the overflow container (parent of treeRef)
        const overflowParent = treeEl.parentElement;

        // Find the scaled div inside treeRef
        const scaledDiv = treeEl.querySelector("[style*='transform']") as HTMLElement | null;

        // Save original styles
        const origTransform = scaledDiv?.style.transform || "";
        const origOverflow = overflowParent?.style.overflow || "";
        const origMaxHeight = overflowParent?.style.maxHeight || "";
        const origHeight = overflowParent?.style.height || "";

        try {
            // Temporarily reset transform to scale(1)
            if (scaledDiv) {
                scaledDiv.style.transform = "scale(1)";
            }

            // Temporarily make overflow container visible so nothing is clipped
            if (overflowParent) {
                overflowParent.style.overflow = "visible";
                overflowParent.style.maxHeight = "none";
                overflowParent.style.height = "auto";
            }

            // Wait a tick for layout to recalculate
            await new Promise(r => setTimeout(r, 100));

            const { toPng } = await import("html-to-image");
            const dataUrl = await toPng(treeEl, {
                backgroundColor: "#ffffff",
                pixelRatio: 2,
                cacheBust: true,
            });
            return dataUrl;
        } finally {
            // Restore original styles
            if (scaledDiv) {
                scaledDiv.style.transform = origTransform;
            }
            if (overflowParent) {
                overflowParent.style.overflow = origOverflow;
                overflowParent.style.maxHeight = origMaxHeight;
                overflowParent.style.height = origHeight;
            }
        }
    };

    const exportAsImage = async () => {
        setExporting(true);
        setError("");

        try {
            const dataUrl = await captureTree();
            const link = document.createElement("a");
            link.download = `${baniName.replace(/\s+/g, "-")}-tree.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("Export image error:", err);
            setError("Gagal mengekspor gambar");
        } finally {
            setExporting(false);
            setShowOptions(false);
        }
    };

    const exportAsPDF = async () => {
        setExporting(true);
        setError("");

        try {
            const dataUrl = await captureTree();
            const { jsPDF } = await import("jspdf");

            // Get image dimensions
            const img = new Image();
            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error("Failed to load image"));
                img.src = dataUrl;
            });

            const imgWidth = img.naturalWidth;
            const imgHeight = img.naturalHeight;

            const isLandscape = imgWidth > imgHeight;
            const pdf = new jsPDF({
                orientation: isLandscape ? "landscape" : "portrait",
                unit: "mm",
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Header
            pdf.setFontSize(16);
            pdf.setFont("helvetica", "bold");
            pdf.text(baniName, pageWidth / 2, 15, { align: "center" });
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            pdf.text("Silsilah Keluarga — Jejak Nasab", pageWidth / 2, 22, { align: "center" });

            // Fit image to page
            const margin = 10;
            const headerHeight = 30;
            const availWidth = pageWidth - margin * 2;
            const availHeight = pageHeight - headerHeight - margin;

            let finalWidth = availWidth;
            let finalHeight = (imgHeight / imgWidth) * availWidth;

            if (finalHeight > availHeight) {
                finalHeight = availHeight;
                finalWidth = (imgWidth / imgHeight) * availHeight;
            }

            const xOffset = (pageWidth - finalWidth) / 2;
            pdf.addImage(dataUrl, "PNG", xOffset, headerHeight, finalWidth, finalHeight);

            // Footer
            pdf.setFontSize(8);
            pdf.setTextColor(150);
            const today = new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });
            pdf.text(
                `Dicetak dari Jejak Nasab — ${today}`,
                pageWidth / 2,
                pageHeight - 5,
                { align: "center" }
            );

            pdf.save(`${baniName.replace(/\s+/g, "-")}-tree.pdf`);
        } catch (err) {
            console.error("Export PDF error:", err);
            setError("Gagal mengekspor PDF");
        } finally {
            setExporting(false);
            setShowOptions(false);
        }
    };

    return (
        <div className="relative sm:inline-block">
            <button
                onClick={() => { setShowOptions(!showOptions); setError(""); }}
                disabled={exporting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-primary-600 text-white font-medium text-xs hover:bg-primary-500 transition-colors shadow-md shadow-primary-600/20 disabled:opacity-50"
            >
                {exporting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                    <Download className="w-3.5 h-3.5" />
                )}
                Ekspor
            </button>

            {showOptions && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowOptions(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-white border border-surface-200 shadow-xl z-50 overflow-hidden">
                        <button
                            onClick={exportAsImage}
                            disabled={exporting}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-surface-700 hover:bg-surface-50 transition-colors disabled:opacity-50"
                        >
                            <ImageIcon className="w-4 h-4 text-blue-500" />
                            Simpan sebagai PNG
                        </button>
                        <button
                            onClick={exportAsPDF}
                            disabled={exporting}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-surface-700 hover:bg-surface-50 transition-colors border-t border-surface-100 disabled:opacity-50"
                        >
                            <FileText className="w-4 h-4 text-red-500" />
                            Simpan sebagai PDF
                        </button>
                    </div>
                </>
            )}

            {error && (
                <div className="absolute right-0 top-full mt-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-start gap-2 z-50 max-w-[200px]">
                    <X className="w-3 h-3 flex-shrink-0 mt-0.5 cursor-pointer" onClick={() => setError("")} />
                    {error}
                </div>
            )}
        </div>
    );
}
