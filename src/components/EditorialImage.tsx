import { useState } from "react";
import { Sparkles } from "lucide-react";

interface EditorialImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function EditorialImage({
  src,
  alt,
  className = "",
  fallbackTitle = "GlamGuard Editorial",
}: EditorialImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#F3EEF2] text-[#38243E] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Sparkles className="w-7 h-7 text-[#E84D79] mb-2" strokeWidth={1.6} />
        <p className="font-display text-lg font-semibold">{fallbackTitle}</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
