import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FeatureRequests() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Feature Requests</h1>
                        <p className="text-muted-foreground text-lg">Help us shape the future of VidDownloader</p>
                    </div>

                    <div className="space-y-8 text-center">
                        <Card>
                            <CardHeader>
                                <CardTitle>Submit Your Idea</CardTitle>
                            </CardHeader>
                            <CardContent className="prose dark:prose-invert max-w-none">
                                <p className="mb-6">
                                    We are constantly looking for ways to improve our service. If you have an idea for a new feature or tool, we'd love to hear from you!
                                </p>
                                <Button asChild>
                                    <a href="/contact">Send Feedback</a>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
