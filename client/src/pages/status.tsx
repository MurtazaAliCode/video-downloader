import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Status() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Service Status</h1>
                        <p className="text-muted-foreground text-lg">Real-time update on platform availability</p>
                    </div>

                    <div className="grid gap-6">
                        <div className="flex items-center justify-between p-6 rounded-2xl bg-card border border-border">
                            <div className="flex items-center gap-4">
                                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                                <div>
                                    <h3 className="font-bold">Website</h3>
                                    <p className="text-xs text-muted-foreground">Main platform and landing pages</p>
                                </div>
                            </div>
                            <span className="text-sm font-medium text-green-500">Operational</span>
                        </div>

                        <div className="flex items-center justify-between p-6 rounded-2xl bg-card border border-border">
                            <div className="flex items-center gap-4">
                                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                                <div>
                                    <h3 className="font-bold">Video Processing Engine</h3>
                                    <p className="text-xs text-muted-foreground">Download and conversion server</p>
                                </div>
                            </div>
                            <span className="text-sm font-medium text-green-500">Operational</span>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
