import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Privacy() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: {currentDate}
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Our Commitment to Privacy</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  At VidDownloader, we are committed to protecting your privacy and ensuring the security of your information. 
                  This Privacy Policy explains how we handle data when you use our video downloader and conversion service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Information We Handle</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <h3>Video Content</h3>
                <p>
                  When you use our service to download videos or extract audio, we may temporarily process the content on our servers. 
                  We do not access, view, or store the content of your downloads for longer than necessary to provide the file to you.
                </p>
                
                <h3>Technical Information</h3>
                <p>We may collect limited technical information including:</p>
                <ul>
                  <li>IP address (for rate limiting and abuse prevention)</li>
                  <li>Browser type and version</li>
                  <li>Processing timestamps</li>
                  <li>Error logs (for service improvement)</li>
                </ul>

                <h3>Contact Information</h3>
                <p>
                  If you contact us through our contact form, we collect your name, email address, and message content 
                  solely for the purpose of responding to your inquiry.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How We Use Information</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>We use information for the following purposes:</p>
                <ul>
                  <li><strong>Service Delivery:</strong> To facilitate the downloading and conversion of online media links</li>
                  <li><strong>Service Operation:</strong> To maintain and improve our service functionality</li>
                  <li><strong>Support:</strong> To respond to your questions and provide customer support</li>
                  <li><strong>Security:</strong> To prevent abuse and ensure service security</li>
                </ul>
                
                <p><strong>We do not:</strong></p>
                <ul>
                  <li>Store or share your videos beyond the 12-hour processing period</li>
                  <li>Use your videos for any purpose other than processing</li>
                  <li>Sell, rent, or share your personal information with third parties</li>
                  <li>Track your browsing behavior across other websites</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Retention and Deletion</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <h3>Automatic File Deletion</h3>
                <p>
                  All uploaded and processed video files are automatically deleted from our servers after 12 hours. 
                  This ensures your content remains private and doesn't accumulate on our systems.
                </p>
                
                <h3>Contact Messages</h3>
                <p>
                  Messages sent through our contact form are retained for up to 1 year for support purposes and 
                  then permanently deleted.
                </p>
                
                <h3>Technical Logs</h3>
                <p>
                  Technical logs containing IP addresses and error information are retained for up to 30 days 
                  for security and service improvement purposes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Measures</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>We implement appropriate security measures to protect your information:</p>
                <ul>
                  <li>HTTPS encryption for all data transmission</li>
                  <li>Secure server infrastructure with access controls</li>
                  <li>Regular security updates and monitoring</li>
                  <li>Isolated processing environment for uploaded files</li>
                  <li>Automatic file deletion to minimize data exposure</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Third-Party Services</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <h3>AdSense</h3>
                <p>
                  We use Google AdSense to display advertisements. AdSense may use cookies and similar technologies 
                  to provide relevant ads. You can control ad personalization through your Google account settings.
                </p>
                
                <h3>Hosting and Infrastructure</h3>
                <p>
                  Our service is hosted on secure cloud infrastructure. While we choose reputable providers, 
                  we ensure they meet our privacy and security standards.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Rights</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>You have the right to:</p>
                <ul>
                  <li><strong>Access:</strong> Request information about what personal data we have about you</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal data (though videos are auto-deleted)</li>
                  <li><strong>Rectification:</strong> Request correction of inaccurate personal data</li>
                  <li><strong>Withdrawal:</strong> Stop using our service at any time</li>
                </ul>
                
                <p>To exercise these rights, please contact us using the information below.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Legal Basis</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>We process your data based on:</p>
                <ul>
                  <li><strong>Legitimate Interest:</strong> To provide media downloading and conversion services</li>
                  <li><strong>Consent:</strong> When you voluntarily contact us or use our service</li>
                  <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Children's Privacy</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  Our service is not intended for children under 13 years of age. We do not knowingly collect 
                  personal information from children under 13. If you are a parent or guardian and believe 
                  your child has provided us with personal information, please contact us.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Changes to This Policy</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by 
                  posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>If you have any questions about this Privacy Policy, please contact us:</p>
                <ul>
                  <li>Email: privacy@VidDownloader.com</li>
                  <li>Contact Form: <a href="/contact" className="text-primary hover:text-primary/80">/contact</a></li>
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
