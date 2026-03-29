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
    // NOTE FOR USER: Paste your Ad Network script logic here.
    // Example: For Adsterra, you might need to append a <script> tag to adRef.current.
    
    // if (adRef.current) {
    //   const script = document.createElement("script");
    //   script.src = "//www.highperformanceformat.com/YOUR_ID/invoke.js";
    //   script.async = true;
    //   adRef.current.appendChild(script);
    // }
    
    console.log(`Ad component ${id} of type ${type} initialized.`);
  }, [id, type]);

  return (
    <div 
      ref={adRef}
      className="ad-container w-full bg-muted/20 border border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center min-h-[100px]"
      id={id}
    >
      <div className="text-center p-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Advertisement</p>
        <p className="text-sm text-muted-foreground/60 mt-1">{placeholderText || `${type.toUpperCase()} SLOT`}</p>
        <p className="text-[10px] text-muted-foreground/40 mt-2">Paste your ad script in AdComponent.tsx</p>
      </div>
    </div>
  );
}
