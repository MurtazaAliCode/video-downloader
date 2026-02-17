import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Conversion() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                            Format Conversion
                        </h1>
                        <p className="text-muted-foreground text-lg">Coming Soon: Convert videos to any format</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Feature Insight</CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <p>
                                Convert between MP4, MKV, AVI, MOV, and more. Our engine will use high-performance transcoding to ensure compatibility with all your devices.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Footer />
        </div>
    );
}
