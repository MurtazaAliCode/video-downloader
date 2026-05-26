import { useEffect, useRef } from "react";

interface AdComponentProps {
  id: string;
  type: "banner" | "sidebar" | "native";
  width?: string;
  height?: string;
  placeholderText?: string;
}

/**
 * AdComponent: Renders isolated iframe elements for Adsterra widgets.
 * This guarantees proper execution of ad scripts without React document.write warnings
 * or main-thread script blocks.
 */
export default function AdComponent({ id, type, placeholderText }: AdComponentProps) {
  const exactWidth = type === "banner" ? 728 : type === "sidebar" ? 300 : "100%";
  const exactHeight = type === "banner" ? 90 : type === "sidebar" ? 250 : 140;

  let src = "";
  if (type === "banner") {
    src = "/partners/leaderboard-widget.html";
  } else if (type === "sidebar") {
    src = "/partners/sidebar-widget.html";
  } else if (type === "native") {
    src = "/partners/sponsored-widget.html";
  }

  return (
    <div 
      className="ad-container flex items-center justify-center overflow-hidden w-full"
      style={type !== "native" ? { width: `${exactWidth}px`, height: `${exactHeight}px`, maxWidth: "100%", margin: "0 auto" } : { width: "100%", height: `${exactHeight}px` }}
      id={`ad-slot-${id}`}
    >
      <iframe
        title="Advertisement"
        src={src}
        width={type === "native" ? "100%" : exactWidth}
        height={exactHeight}
        frameBorder="0"
        scrolling="no"
        style={{ border: "none", overflow: "hidden", display: "block", width: "100%", height: "100%" }}
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"
      />
    </div>
  );
}

