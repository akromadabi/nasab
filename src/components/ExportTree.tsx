"use client";

import { useState } from "react";
import {
    Download,
    Image as ImageIcon,
    FileText,
    Loader2,
    X,
} from "lucide-react";
import { TREE_THEMES, type ThemeKey } from "@/lib/treeThemes";

interface ExportStats {
    totalMembers: number;
    totalAlive: number;
    totalMale: number;
    totalFemale: number;
    totalGenerations: number;
}

interface ExportTreeProps {
    treeContainerRef: React.RefObject<HTMLDivElement | null>;
    baniName: string;
    stats?: ExportStats;
    isFreeUser?: boolean;
    cardTheme?: ThemeKey;
}

export default function ExportTree({ treeContainerRef, baniName, stats, isFreeUser = false, cardTheme = "STANDARD" }: ExportTreeProps) {
    const [exporting, setExporting] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [error, setError] = useState("");

    /**
     * Capture just the tree element using html-to-image
     */
    const captureTree = async (): Promise<string> => {
        const treeEl = treeContainerRef.current;
        if (!treeEl) throw new Error("Tree element not found");

        const overflowParent = treeEl.parentElement;
        const scaledDiv = treeEl.querySelector("[style*='transform']") as HTMLElement | null;

        const origTransform = scaledDiv?.style.transform || "";
        const origOverflow = overflowParent?.style.overflow || "";
        const origMaxHeight = overflowParent?.style.maxHeight || "";
        const origHeight = overflowParent?.style.height || "";

        try {
            if (scaledDiv) scaledDiv.style.transform = "scale(1)";
            if (overflowParent) {
                overflowParent.style.overflow = "visible";
                overflowParent.style.maxHeight = "none";
                overflowParent.style.height = "auto";
            }

            await new Promise(r => setTimeout(r, 100));

            const { toPng } = await import("html-to-image");
            return await toPng(treeEl, {
                backgroundColor: "#ffffff",
                pixelRatio: 2,
                cacheBust: true,
            });
        } finally {
            if (scaledDiv) scaledDiv.style.transform = origTransform;
            if (overflowParent) {
                overflowParent.style.overflow = origOverflow;
                overflowParent.style.maxHeight = origMaxHeight;
                overflowParent.style.height = origHeight;
            }
        }
    };

    /**
     * Use Canvas API to compose a decorated image:
     * Header (green gradient + title + stats) → Tree image → Footer
     */
    const captureWithDecoration = async (): Promise<string> => {
        const treeDataUrl = await captureTree();

        // Load tree image
        const treeImg = await loadImage(treeDataUrl);

        const padding = 60;
        const headerHeight = stats ? 200 : 140;
        const footerHeight = 50;
        const borderWidth = 4;

        const themeConfig = TREE_THEMES[cardTheme] || TREE_THEMES.STANDARD;
        const gradientColors = themeConfig.export.headerGradient;

        const canvasWidth = Math.max(treeImg.width, 800) + padding * 2 + borderWidth * 2;
        const canvasHeight = headerHeight + treeImg.height + footerHeight + padding + borderWidth * 2;

        const canvas = document.createElement("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d")!;

        // === WHITE BACKGROUND ===
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // === BORDER / FRAME ===
        ctx.strokeStyle = gradientColors[1] || "#16a34a";
        ctx.lineWidth = borderWidth;
        const r = 16;
        roundRect(ctx, borderWidth / 2, borderWidth / 2, canvasWidth - borderWidth, canvasHeight - borderWidth, r);
        ctx.stroke();

        // Clip inside border
        ctx.save();
        roundRect(ctx, borderWidth, borderWidth, canvasWidth - borderWidth * 2, canvasHeight - borderWidth * 2, r - 2);
        ctx.clip();

        // === HEADER (gradient) ===
        const grad = ctx.createLinearGradient(0, 0, canvasWidth, headerHeight);
        grad.addColorStop(0, gradientColors[0]);
        grad.addColorStop(0.5, gradientColors[1]);
        grad.addColorStop(1, gradientColors[2]);
        ctx.fillStyle = grad;
        ctx.fillRect(borderWidth, borderWidth, canvasWidth - borderWidth * 2, headerHeight);

        // Title
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 36px 'Segoe UI', system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`KELUARGA BESAR`, canvasWidth / 2, borderWidth + 50);
        ctx.fillText(baniName.toUpperCase(), canvasWidth / 2, borderWidth + 90);

        // Subtitle
        ctx.font = "16px 'Segoe UI', system-ui, sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fillText("Silsilah Keluarga", canvasWidth / 2, borderWidth + 115);

        // Decorative line
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.fillRect(canvasWidth / 2 - 40, borderWidth + 125, 80, 3);

        // Stats bar
        if (stats) {
            const statItems = [
                { label: "TOTAL", value: stats.totalMembers.toString() },
                { label: "HIDUP", value: stats.totalAlive.toString() },
                { label: "GENERASI", value: stats.totalGenerations.toString() },
                { label: "L / P", value: `${stats.totalMale} / ${stats.totalFemale}` },
            ];

            const statWidth = 100;
            const statGap = 16;
            const totalStatsWidth = statItems.length * statWidth + (statItems.length - 1) * statGap;
            let startX = (canvasWidth - totalStatsWidth) / 2;

            statItems.forEach(item => {
                // Stat box background
                ctx.fillStyle = "rgba(255,255,255,0.15)";
                roundRect(ctx, startX, borderWidth + 142, statWidth, 48, 10);
                ctx.fill();

                // Value
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 20px 'Segoe UI', system-ui, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(item.value, startX + statWidth / 2, borderWidth + 166);

                // Label
                ctx.fillStyle = "rgba(255,255,255,0.65)";
                ctx.font = "10px 'Segoe UI', system-ui, sans-serif";
                ctx.fillText(item.label, startX + statWidth / 2, borderWidth + 182);

                startX += statWidth + statGap;
            });
        }

        // === TREE IMAGE ===
        const treeX = (canvasWidth - treeImg.width) / 2;
        const treeY = headerHeight + padding / 2;
        ctx.drawImage(treeImg, treeX, treeY);

        // === WATERMARK (free users only) ===
        if (isFreeUser) {
            ctx.save();
            ctx.translate(canvasWidth / 2, treeY + treeImg.height / 2);
            ctx.rotate(-30 * Math.PI / 180);
            ctx.fillStyle = `${gradientColors[1]}10`;
            ctx.font = "bold 80px 'Segoe UI', system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("JEJAK NASAB", 0, 0);
            ctx.restore();
        }

        // === FOOTER ===
        const footerY = canvasHeight - footerHeight - borderWidth;

        // Footer line
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(borderWidth + padding, footerY);
        ctx.lineTo(canvasWidth - borderWidth - padding, footerY);
        ctx.stroke();

        // Footer left text
        const today = new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
        ctx.fillStyle = "#9ca3af";
        ctx.font = "13px 'Segoe UI', system-ui, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`Dicetak pada ${today}`, borderWidth + padding, footerY + 30);

        // Footer right text
        ctx.fillStyle = gradientColors[1] || "#16a34a";
        ctx.font = "bold 14px 'Segoe UI', system-ui, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText("✦ Jejak Nasab", canvasWidth - borderWidth - padding, footerY + 30);

        ctx.restore();

        return canvas.toDataURL("image/png");
    };

    const exportAsImage = async () => {
        setExporting(true);
        setError("");

        try {
            const dataUrl = await captureWithDecoration();
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
            const dataUrl = await captureWithDecoration();
            const { jsPDF } = await import("jspdf");

            const img = await loadImage(dataUrl);
            const imgWidth = img.naturalWidth;
            const imgHeight = img.naturalHeight;

            const isLandscape = imgWidth > imgHeight;
            const pdf = new jsPDF({
                orientation: isLandscape ? "landscape" : "portrait",
                unit: "mm",
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const margin = 5;
            const availWidth = pageWidth - margin * 2;
            const availHeight = pageHeight - margin * 2;

            let finalWidth = availWidth;
            let finalHeight = (imgHeight / imgWidth) * availWidth;

            if (finalHeight > availHeight) {
                finalHeight = availHeight;
                finalWidth = (imgWidth / imgHeight) * availHeight;
            }

            const xOffset = (pageWidth - finalWidth) / 2;
            const yOffset = (pageHeight - finalHeight) / 2;
            pdf.addImage(dataUrl, "PNG", xOffset, yOffset, finalWidth, finalHeight);

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

// Helper: load image from data URL
function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = src;
    });
}

// Helper: draw rounded rectangle path
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}
