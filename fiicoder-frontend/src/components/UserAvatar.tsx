import { useState, type ReactNode } from "react";
import { getGravatarUrl, getDiceBearUrl } from "../utils/gravatar";

interface UserAvatarProps {
  email: string;
  // Rendered (e.g. initials) if both Gravatar and DiceBear fail to load.
  fallback: ReactNode;
  // Shared shape/size/border classes applied to both the <img> and the fallback.
  className?: string;
  // Gravatar pixel size hint.
  size?: number;
}

// Resolves a user's avatar the same way the navbar does for the current user:
// try Gravatar (d=404), fall back to a deterministic DiceBear avatar, and only
// then to the provided fallback (initials).
export default function UserAvatar({ email, fallback, className = "", size = 80 }: UserAvatarProps) {
  const normalized = (email ?? "").trim().toLowerCase();
  const gravatar = getGravatarUrl(normalized, size);
  const dicebear = getDiceBearUrl(normalized);

  const [src, setSrc] = useState(gravatar);
  const [failed, setFailed] = useState(false);

  const handleError = () => {
    if (src === gravatar && dicebear) setSrc(dicebear);
    else setFailed(true);
  };

  if (failed || !normalized) {
    return <div className={className}>{fallback}</div>;
  }

  return <img src={src} alt="" onError={handleError} className={`${className} object-cover`} />;
}
