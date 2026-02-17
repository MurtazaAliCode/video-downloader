import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Compression() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                            Video Compression
                        </h1>
                        <p className="text-muted-foreground text-lg">Coming Soon: Professional video size reduction</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Feature Insight</CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <p>
                                Our compression tool will allow you to reduce video file sizes significantly without compromising visual quality, making it easier to share on platforms like WhatsApp and Email.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Footer />
        </div>
    );
}
