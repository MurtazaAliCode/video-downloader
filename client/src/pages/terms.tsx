import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Terms() {
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
              Terms of Service
            </h1>
            <p className="text-muted-foreground">
              Last updated: {currentDate}
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  Welcome to VidDonloader. By accessing or using our video processing service, you agree to comply with 
                  and be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our service.
                </p>
                <p>
                  These Terms constitute a legally binding agreement between you and VidDonloader. We reserve the right to 
                  modify these Terms at any time, and such modifications will be effective immediately upon posting.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Description of Service</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  VidDonloader is a free online video processing tool that allows users to:
                </p>
                <ul>
                  <li>Compress video files to reduce file size</li>
                  <li>Convert videos between different formats (MP4, AVI, MOV, GIF)</li>
                  <li>Trim and cut video segments</li>
                  <li>Extract audio from video files</li>
                  <li>Add text or logo watermarks to videos</li>
                </ul>
                <p>
                  Our service is provided "as is" for personal, non-commercial use only. All processing is performed on 
                  user-uploaded content, and we do not provide tools for downloading content from external platforms.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Obligations and Restrictions</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <h3>Permitted Use</h3>
                <p>You may use VidDonloader to process videos that you own or have proper authorization to modify, including:</p>
                <ul>
                  <li>Videos you created or recorded yourself</li>
                  <li>Videos for which you have explicit permission from the copyright owner</li>
                  <li>Videos that are in the public domain</li>
                  <li>Videos used under applicable fair use or fair dealing provisions</li>
                </ul>

                <h3>Prohibited Use</h3>
                <p>You agree NOT to use our service for:</p>
                <ul>
                  <li>Processing copyrighted content without proper authorization</li>
                  <li>Commercial purposes or business use without our written consent</li>
                  <li>Uploading content that is illegal, harmful, threatening, abusive, or offensive</li>
                  <li>Processing content containing malware, viruses, or malicious code</li>
                  <li>Circumventing or attempting to circumvent our security measures</li>
                  <li>Reverse engineering or attempting to extract our processing algorithms</li>
                  <li>Using automated tools or bots to access our service</li>
                  <li>Overloading our servers or interfering with other users' access</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Ownership and License</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <h3>Your Content</h3>
                <p>
                  You retain all ownership rights to videos you upload to our service. By uploading content, you represent 
                  and warrant that you own or have the necessary rights to the content and that your use of our service 
                  does not infringe on any third-party rights.
                </p>

                <h3>Limited License to Process</h3>
                <p>
                  By uploading content, you grant VidDonloader a limited, temporary, non-exclusive license to process your 
                  videos solely for the purpose of providing our service. This license expires when your files are 
                  automatically deleted after 12 hours.
                </p>

                <h3>Processed Content</h3>
                <p>
                  You own the processed output files. We do not claim any ownership rights to your original or processed content. 
                  You are responsible for downloading your processed files within the 12-hour retention period.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacy and Data Protection</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  Your privacy is important to us. Our data handling practices are detailed in our Privacy Policy. 
                  Key points include:
                </p>
                <ul>
                  <li>All uploaded files are automatically deleted after 12 hours</li>
                  <li>We do not store, analyze, or share your video content</li>
                  <li>We do not collect personal information except as necessary for service operation</li>
                  <li>We implement security measures to protect your data during processing</li>
                </ul>
                <p>
                  By using our service, you acknowledge that you have read and understand our Privacy Policy.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Disclaimer of Warranties</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  VidDonloader is provided "as is" and "as available" without warranties of any kind. We expressly disclaim 
                  all warranties, including but not limited to:
                </p>
                <ul>
                  <li>Warranties of merchantability, fitness for a particular purpose, and non-infringement</li>
                  <li>Warranties regarding the accuracy, reliability, or completeness of our service</li>
                  <li>Warranties that our service will be uninterrupted, error-free, or secure</li>
                  <li>Warranties regarding the quality of processed videos</li>
                </ul>
                <p>
                  You use our service at your own risk. We recommend keeping backup copies of your original files.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  To the maximum extent permitted by law, VidDonloader shall not be liable for any indirect, incidental, 
                  special, consequential, or punitive damages, including but not limited to:
                </p>
                <ul>
                  <li>Loss of data, files, or content</li>
                  <li>Loss of profits or business opportunities</li>
                  <li>Service interruptions or downtime</li>
                  <li>Damages resulting from unauthorized access to your content</li>
                </ul>
                <p>
                  Our total liability for any claims arising from your use of our service shall not exceed the amount 
                  you paid us for the service (which is $0 for our free service).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>DMCA Compliance</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  We respect intellectual property rights and comply with the Digital Millennium Copyright Act (DMCA). 
                  If you believe that content processed through our service infringes your copyright, please contact us with:
                </p>
                <ul>
                  <li>A description of the copyrighted work you claim has been infringed</li>
                  <li>Information sufficient to locate the allegedly infringing content</li>
                  <li>Your contact information</li>
                  <li>A statement that you have a good faith belief that the use is not authorized</li>
                  <li>A statement of accuracy and authority to act on behalf of the copyright owner</li>
                  <li>Your physical or electronic signature</li>
                </ul>
                <p>
                  DMCA notices can be sent to: dmca@viddonloader.com
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Availability and Modifications</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  We strive to maintain service availability but do not guarantee uninterrupted access. We may:
                </p>
                <ul>
                  <li>Temporarily suspend service for maintenance or updates</li>
                  <li>Modify or discontinue features with or without notice</li>
                  <li>Implement usage limits or restrictions</li>
                  <li>Block access from users who violate these Terms</li>
                </ul>
                <p>
                  We reserve the right to refuse service to anyone for any reason at our sole discretion.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Indemnification</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  You agree to indemnify, defend, and hold harmless VidDonloader and its affiliates from any claims, 
                  damages, losses, or expenses (including attorney fees) arising from:
                </p>
                <ul>
                  <li>Your use of our service</li>
                  <li>Your violation of these Terms</li>
                  <li>Your infringement of any third-party rights</li>
                  <li>Content you upload or process through our service</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Governing Law and Disputes</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  These Terms are governed by and construed in accordance with applicable laws. Any disputes arising 
                  from these Terms or your use of our service shall be resolved through binding arbitration, except for:
                </p>
                <ul>
                  <li>Claims for injunctive relief</li>
                  <li>Claims involving intellectual property rights</li>
                  <li>Small claims court matters</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  If you have questions about these Terms or need to report violations, please contact us:
                </p>
                <ul>
                  <li>Email: legal@viddonloader.com</li>
                  <li>DMCA: dmca@viddonloader.com</li>
                  <li>Contact Form: <a href="/contact" className="text-primary hover:text-primary/80">/contact</a></li>
                  <li>Report Issues: <a href="/report" className="text-primary hover:text-primary/80">/report</a></li>
                </ul>
                
                <div className="mt-8 pt-8 border-t border-border text-center">
                  <p className="text-sm text-muted-foreground">
                    © 2025 VidDonloader. All rights reserved. Not affiliated with any social media platforms.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
