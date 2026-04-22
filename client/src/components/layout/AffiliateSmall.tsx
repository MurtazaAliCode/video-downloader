import { motion } from "framer-motion";
import { ShieldCheck, Video, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AffiliateSmallProps {
  type: "vpn" | "editor";
  compact?: boolean;
}

export default function AffiliateSmall({ type, compact = false }: AffiliateSmallProps) {
  const isVpn = type === "vpn";
  
  const content = isVpn ? {
    title: "NordVPN",
    tagline: "Stay Private & Secure",
    icon: <ShieldCheck className="w-8 h-8 text-white" />,
    gradient: "from-blue-600 to-indigo-700",
    url: "https://nordvpn.com/",
    cta: "Secure My Connection"
  } : {
    title: "Movavi Video Editor",
    tagline: "Edit Reels & TikToks",
    icon: <Video className="w-8 h-8 text-white" />,
    gradient: "from-purple-600 to-pink-700",
    url: "https://www.movavi.com/",
    cta: "Try Free Editor"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`w-full ${compact ? "max-w-xs" : "max-w-sm"}`}
    >
      <Card className="overflow-hidden border-white/10 bg-card/30 backdrop-blur-md hover:border-white/20 transition-all">
        <CardContent className="p-0">
          <div className={`bg-gradient-to-r ${content.gradient} p-4 flex items-center space-x-4`}>
            <div className="bg-white/20 p-2 rounded-xl">
              {content.icon}
            </div>
            <div>
              <h4 className="text-white font-bold text-sm leading-tight">{content.title}</h4>
              <p className="text-white/70 text-[10px] uppercase font-bold tracking-wider">{content.tagline}</p>
            </div>
          </div>
          <div className="p-3">
            <Button 
              size="sm"
              className="w-full h-8 text-xs font-bold group"
              variant={isVpn ? "default" : "secondary"}
              onClick={() => window.open(content.url, '_blank')}
            >
              {content.cta}
              <ExternalLink className="w-3 h-3 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
