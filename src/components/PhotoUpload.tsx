"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, X } from "lucide-react";

export default function PhotoUpload({
    memberId,
    currentPhoto,
    memberName,
}: {
    memberId: string;
    currentPhoto: string | null;
    memberName: string;
}) {
    const [uploading, setUploading] = useState(false);
    const [photo, setPhoto] = useState(currentPhoto);
    const [error, setError] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError("");
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("memberId", memberId);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error);
                return;
            }

            setPhoto(data.url);
        } catch {
            setError("Gagal mengupload foto");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-3">
            <div
                className="relative w-24 h-24 rounded-2xl overflow-hidden bg-surface-100 cursor-pointer group"
                onClick={() => fileRef.current?.click()}
            >
                {photo ? (
                    <img
                        src={photo}
                        alt={memberName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-surface-400">
                        <Camera className="w-8 h-8" />
                    </div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {uploading ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                        <Camera className="w-6 h-6 text-white" />
                    )}
                </div>
            </div>

            <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleUpload}
                className="hidden"
            />

            <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="text-xs text-primary-600 hover:text-primary-500 font-medium disabled:opacity-50"
            >
                {uploading ? "Mengupload..." : photo ? "Ganti Foto" : "Upload Foto"}
            </button>

            {error && (
                <div className="flex items-center gap-1 text-xs text-red-600">
                    <X className="w-3 h-3" />
                    {error}
                </div>
            )}
        </div>
    );
}
