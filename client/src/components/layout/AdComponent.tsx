import { useEffect, useRef } from "react";

interface AdComponentProps {
  id: string;
  type: "banner" | "sidebar" | "native";
  width?: string;
  height?: string;
  placeholderText?: string;
}

/**
 * AdComponent: Uses an isolated iframe for banner/sidebar to prevent React document.write issues
 * and avoid global variable conflicts.
 */
export default function AdComponent({ id, type, placeholderText }: AdComponentProps) {
  const adRef = useRef<HTMLDivElement>(null);

  const exactWidth = type === "banner" ? 728 : type === "sidebar" ? 300 : undefined;
  const exactHeight = type === "banner" ? 90 : type === "sidebar" ? 250 : undefined;

  useEffect(() => {
    if (type === "native") {
      if (!adRef.current) return;
      adRef.current.innerHTML = "";
      const scriptId = `adsterra-${id}`;
      if (document.getElementById(scriptId)) return;

      const container = document.createElement("div");
      container.id = `container-${id}`;
      adRef.current.appendChild(container);

      const nativeScript = document.createElement("script");
      nativeScript.id = scriptId;
      nativeScript.async = true;
      nativeScript.setAttribute("data-cfasync", "false");
      nativeScript.src = `https://pl29050240.profitablecpmratenetwork.com/${id}/invoke.js`;
      adRef.current.appendChild(nativeScript);
    }
  }, [id, type]);

  if (type === "banner" || type === "sidebar") {
    // Isolated iframe HTML prevents document.write errors inside React
    const adHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { margin: 0; padding: 0; overflow: hidden; display: flex; justify-content: center; align-items: center; background: transparent; }
          </style>
        </head>
        <body>
          <script type="text/javascript">
            atOptions = {
              'key' : '${id}',
              'format' : 'iframe',
              'height' : ${exactHeight},
              'width' : ${exactWidth},
              'params' : {}
            };
          <\/script>
          <script type="text/javascript" src="https://www.highperformanceformat.com/${id}/invoke.js"><\/script>
        </body>
      </html>
    `;

    return (
      <div 
        className="ad-container flex items-center justify-center overflow-hidden"
        style={{ width: `${exactWidth}px`, height: `${exactHeight}px`, maxWidth: "100%", margin: "0 auto" }}
        id={`ad-slot-${id}`}
      >
        <iframe
          title="Advertisement"
          srcDoc={adHTML}
          width={exactWidth}
          height={exactHeight}
          frameBorder="0"
          scrolling="no"
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"
          style={{ border: "none", overflow: "hidden", display: "block" }}
        />
      </div>
    );
  }

  return (
    <div 
      ref={adRef}
      className={`ad-container flex items-center justify-center overflow-hidden ${type === "native" ? "w-full min-h-[100px]" : ""}`}
      style={type !== "native" ? { width: `${exactWidth}px`, height: `${exactHeight}px`, maxWidth: "100%", margin: "0 auto" } : undefined}
      id={`ad-slot-${id}`}
    />
  );
}

