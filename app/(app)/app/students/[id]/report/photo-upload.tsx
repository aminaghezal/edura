"use client";

import { useState, useTransition, useRef } from "react";
import { Camera, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateStudentPhoto } from "./actions";

export function StudentPhotoUpload({
  studentId,
  initialPhotoUrl,
  firstName,
}: {
  studentId: string;
  initialPhotoUrl: string | null;
  firstName: string;
}) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialPhotoUrl);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image trop volumineuse (max 2 MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPhotoUrl(dataUrl);

      const fd = new FormData();
      fd.set("studentId", studentId);
      fd.set("photoUrl", dataUrl);
      startTransition(async () => {
        await updateStudentPhoto(fd);
      });
    };
    reader.readAsDataURL(file);
  }

  function handleRemove() {
    if (!confirm("Supprimer la photo ?")) return;
    setPhotoUrl(null);
    const fd = new FormData();
    fd.set("studentId", studentId);
    fd.set("photoUrl", "");
    startTransition(async () => {
      await updateStudentPhoto(fd);
    });
  }

  return (
    <div className="flex items-center gap-3">
      {/* Avatar preview */}
      <div className="relative w-20 h-20 rounded-full border-2 border-indigo-200 overflow-hidden flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={firstName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-2xl font-bold text-indigo-600">
            {firstName[0]?.toUpperCase()}
          </div>
        )}
        {pending && (
          <div className="absolute inset-0 bg-black/40 grid place-items-center text-white text-xs">
            ...
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1.5">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFile}
          className="hidden"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={pending}
          className="h-7 text-xs"
        >
          {photoUrl ? <Camera className="w-3 h-3 mr-1.5" /> : <Upload className="w-3 h-3 mr-1.5" />}
          {photoUrl ? "Changer" : "Importer photo"}
        </Button>
        {photoUrl && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRemove}
            disabled={pending}
            className="h-7 text-xs text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-3 h-3 mr-1.5" />
            Supprimer
          </Button>
        )}
        <p className="text-[10px] text-muted-foreground">JPG, PNG, WebP — max 2 MB</p>
      </div>
    </div>
  );
}
