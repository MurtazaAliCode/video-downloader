import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DMCA() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">DMCA Notice</h1>
                        <p className="text-muted-foreground text-lg">Digital Millennium Copyright Act Policy</p>
                    </div>

                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Introduction</CardTitle>
                            </CardHeader>
                            <CardContent className="prose dark:prose-invert max-w-none">
                                <p>
                                    VidDownloader respects the intellectual property rights of others and expects its users to do the same. In accordance with the Digital Millennium Copyright Act (DMCA), we will respond expeditiously to claims of copyright infringement.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Takedown Notices</CardTitle>
                            </CardHeader>
                            <CardContent className="prose dark:prose-invert max-w-none">
                                <p>
                                    If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement and is accessible via the Service, please notify our DMCA agent. For your complaint to be valid under the DMCA, you must provide the following information:
                                </p>
                                <ul>
                                    <li>Identification of the copyrighted work claimed to have been infringed.</li>
                                    <li>Identification of the material that is claimed to be infringing.</li>
                                    <li>Your contact information (address, phone number, email).</li>
                                    <li>A statement that you have a good faith belief that use of the material is not authorized.</li>
                                    <li>A statement that the information in the notification is accurate, under penalty of perjury.</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
