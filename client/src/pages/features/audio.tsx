import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Audio() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                            Audio Extraction
                        </h1>
                        <p className="text-muted-foreground text-lg">Coming Soon: High-quality MP3 from any video</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Feature Insight</CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <p>
                                Easily extract high-quality audio tracks from your favorite videos. Save as MP3, AAC, or FLAC with customizable bitrate settings.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Footer />
        </div>
    );
}
