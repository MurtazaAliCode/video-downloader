import { motion } from "framer-motion";
import { ShieldCheck, Video, ExternalLink, Zap, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.15,
      duration: 0.5
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  },
};

export default function AffiliateSection() {
  return (
    <motion.section 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="w-full py-12"
    >
      <div className="flex flex-col items-center mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
          Recommended Creator Tools
        </h2>
        <p className="text-muted-foreground text-sm text-center max-w-md">
          Level up your downloading experience with these trusted professional tools.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* NordVPN Card */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-primary/20 bg-card/50 backdrop-blur-sm group hover:border-primary/40 transition-all duration-300">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 flex flex-col items-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:scale-110 transition-transform duration-500">
                  <Lock className="w-20 h-20" />
                </div>
                <ShieldCheck className="w-12 h-12 mb-4 drop-shadow-lg" />
                <h3 className="text-xl font-bold mb-1">NordVPN</h3>
                <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full mb-4">BEST FOR PRIVACY</span>
              </div>
              <div className="p-6">
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-muted-foreground">
                    <Zap className="w-4 h-4 mr-2 text-primary" /> Stay private while downloading
                  </li>
                  <li className="flex items-center text-sm text-muted-foreground">
                    <Zap className="w-4 h-4 mr-2 text-primary" /> Bypass geo-blocks instantly
                  </li>
                  <li className="flex items-center text-sm text-muted-foreground">
                    <Zap className="w-4 h-4 mr-2 text-primary" /> Multi-device support (PC & Mobile)
                  </li>
                </ul>
                <Button 
                  className="w-full group"
                  variant="default"
                  onClick={() => window.open('https://nordvpn.com/', '_blank')}
                >
                  Get Exclusive Deal
                  <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Movavi Card */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-accent/20 bg-card/50 backdrop-blur-sm group hover:border-accent/40 transition-all duration-300">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-purple-600 to-pink-700 p-6 flex flex-col items-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:scale-110 transition-transform duration-500">
                  <Video className="w-20 h-20" />
                </div>
                <Video className="w-12 h-12 mb-4 drop-shadow-lg" />
                <h3 className="text-xl font-bold mb-1">Movavi Editor</h3>
                <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full mb-4">BEST FOR CREATORS</span>
              </div>
              <div className="p-6">
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-muted-foreground">
                    <Zap className="w-4 h-4 mr-2 text-accent" /> Edit TikToks & Reels in minutes
                  </li>
                  <li className="flex items-center text-sm text-muted-foreground">
                    <Zap className="w-4 h-4 mr-2 text-accent" /> Add professional effects & transitions
                  </li>
                  <li className="flex items-center text-sm text-muted-foreground">
                    <Zap className="w-4 h-4 mr-2 text-accent" /> Export in 4K resolution
                  </li>
                </ul>
                <Button 
                  className="w-full group bg-accent hover:bg-accent/90"
                  variant="default"
                  onClick={() => window.open('https://www.mvvitrk.com/click?pid=6156&offer_id=1', '_blank')}
                >
                  Try For Free
                  <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.section>
  );
}
