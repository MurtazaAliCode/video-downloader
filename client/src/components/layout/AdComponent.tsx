import { useEffect, useRef } from "react";

interface AdComponentProps {
  id: string;
  type: "banner" | "sidebar" | "native";
  width?: string;
  height?: string;
  placeholderText?: string;
}

/**
 * AdComponent: Use this to inject ad scripts (like Adsterra or PropellerAds).
 */
export default function AdComponent({ id, type, placeholderText }: AdComponentProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current) return;

    // Clear previous children to prevent duplicate ads on re-render
    adRef.current.innerHTML = "";

    const scriptId = `adsterra-${id}`;
    if (document.getElementById(scriptId)) return;

    const container = document.createElement("div");
    container.id = `container-${id}`;
    adRef.current.appendChild(container);

    if (type === "banner" || type === "sidebar") {
      // Adsterra Standard Banner Logic (atOptions)
      const optionsScript = document.createElement("script");
      optionsScript.type = "text/javascript";
      
      const width = type === "banner" ? 728 : 300;
      const height = type === "banner" ? 90 : 250;
      
      optionsScript.innerHTML = `
        atOptions = {
          'key' : '${id}',
          'format' : 'iframe',
          'height' : ${height},
          'width' : ${width},
          'params' : {}
        };
      `;
      adRef.current.appendChild(optionsScript);

      const invokeScript = document.createElement("script");
      invokeScript.type = "text/javascript";
      invokeScript.src = `//www.highperformanceformat.com/${id}/invoke.js`;
      adRef.current.appendChild(invokeScript);
    } else if (type === "native") {
      // Adsterra Native Banner Logic
      const nativeScript = document.createElement("script");
      nativeScript.async = true;
      nativeScript.setAttribute("data-cfasync", "false");
      nativeScript.src = `https://pl29050240.profitablecpmratenetwork.com/${id}/invoke.js`;
      adRef.current.appendChild(nativeScript);
    }

    console.log(`Adsterra component ${id} of type ${type} injected.`);
  }, [id, type]);

  return (
    <div 
      ref={adRef}
      className="ad-container w-full flex items-center justify-center min-h-[100px]"
      id={`ad-slot-${id}`}
    />
  );
}
