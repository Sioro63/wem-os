"use client";

import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Input } from "@/components/ui/input";

interface ImageUrlFieldProps {
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * V1 image handling: paste a hosted image URL, previewed inline.
 * The `services/` layer is where an S3/UploadThing-backed upload will plug in
 * later without changing form contracts.
 */
export function ImageUrlField({
  value,
  onChange,
  placeholder = "https://…",
}: ImageUrlFieldProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
        {value && !failed ? (
          <Image
            src={value}
            alt="Preview"
            width={64}
            height={64}
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
            unoptimized
          />
        ) : (
          <ImageIcon className="h-5 w-5 text-muted-foreground" aria-hidden />
        )}
      </div>
      <Input
        value={value ?? ""}
        onChange={(e) => {
          setFailed(false);
          onChange(e.target.value);
        }}
        placeholder={placeholder}
        inputMode="url"
      />
    </div>
  );
}
