import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AlertTriangle, Shield, FileText } from "lucide-react";

const reportFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  reportType: z.string().min(1, "Please select a report type"),
  description: z.string().min(10, "Please provide at least 10 characters"),
  url: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type ReportFormData = z.infer<typeof reportFormSchema>;

export default function Report() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      email: "",
      reportType: "",
      description: "",
      url: "",
      additionalInfo: "",
    },
  });

  const onSubmit = async (data: ReportFormData) => {
    setIsSubmitting(true);
    
    try {
      // Convert to contact message format
      const contactData = {
        name: "Report Submission",
        email: data.email,
        subject: `Report: ${data.reportType}`,
        message: `Report Type: ${data.reportType}\n\nDescription: ${data.description}\n\nURL (if applicable): ${data.url || 'N/A'}\n\nAdditional Information: ${data.additionalInfo || 'None'}`,
      };
      
      await apiRequest('POST', '/api/contact', contactData);
      
      toast({
        title: "Report submitted successfully",
        description: "Thank you for your report. We'll investigate this matter promptly.",
      });
      
      form.reset();
    } catch (error) {
      console.error('Report submission error:', error);
      toast({
        variant: "destructive",
        title: "Failed to submit report",
        description: "Please try again later or contact us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Report Misuse
            </h1>
            <p className="text-xl text-muted-foreground">
              Help us maintain a safe and legal platform by reporting violations or concerns.
            </p>
          </div>

          {/* Warning Notice */}
          <Card className="mb-8 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-yellow-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Important Notice</h3>
                  <p className="text-sm text-muted-foreground">
                    VidDownloader is designed for processing personal content only. We take reports of misuse seriously 
                    and investigate all claims promptly. False reports may result in restrictions on your ability to use our service.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Submit a Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="your@email.com" 
                            {...field} 
                            data-testid="report-email-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="reportType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type of Report</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          data-testid="report-type-select"
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select the type of issue" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="copyright">Copyright Infringement</SelectItem>
                            <SelectItem value="illegal-content">Illegal Content</SelectItem>
                            <SelectItem value="spam">Spam or Abuse</SelectItem>
                            <SelectItem value="malware">Malware or Virus</SelectItem>
                            <SelectItem value="terms-violation">Terms of Service Violation</SelectItem>
                            <SelectItem value="privacy">Privacy Violation</SelectItem>
                            <SelectItem value="technical">Technical Issue</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL or Job ID (if applicable)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://... or job ID" 
                            {...field} 
                            data-testid="report-url-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description of the Issue</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Please provide a detailed description of the issue you're reporting..."
                            rows={5}
                            {...field} 
                            data-testid="report-description-textarea"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Information (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any additional context, evidence, or information that might help us investigate..."
                            rows={3}
                            {...field} 
                            data-testid="report-additional-textarea"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    className="w-full btn-gradient text-primary-foreground py-3 font-medium hover:scale-[1.02] transition-all"
                    disabled={isSubmitting}
                    data-testid="report-submit-button"
                  >
                    {isSubmitting ? "Submitting Report..." : "Submit Report"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-6 h-6 text-green-500" />
                  <h3 className="font-semibold text-foreground">Our Commitment</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  We're committed to maintaining a safe, legal platform. All reports are investigated promptly, 
                  and appropriate action is taken against violations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <FileText className="w-6 h-6 text-blue-500" />
                  <h3 className="font-semibold text-foreground">DMCA Compliance</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  For copyright infringement claims, we follow DMCA procedures. 
                  Please include all required information for faster processing.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              For urgent matters or direct contact: 
              <a href="/contact" className="text-primary hover:text-primary/80 ml-1">
                Contact Us
              </a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
