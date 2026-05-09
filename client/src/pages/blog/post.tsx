import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import type { BlogPost } from "@shared/schema";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

const relatedGuides = [
  { title: "YouTube to MP4 Guide", slug: "youtube-to-mp4-guide" },
  { title: "TikTok No Watermark", slug: "tiktok-no-watermark" },
  { title: "HD Video Quality Tips", slug: "hd-video-quality-tips" },
  { title: "Legal & Safety Basics", slug: "legal-safety-basics" },
  { title: "How to Compress Video Online", slug: "how-to-compress-video-online" },
  { title: "Best Formats for Social Media", slug: "best-formats-for-social-media" },
  { title: "Trim Videos Without Software", slug: "trim-videos-without-software" },
  { title: "Extract Audio from Video Free", slug: "extract-audio-from-video-free" },
];

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = params;
  
  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ['/api/blog', slug],
    queryFn: async () => {
      const res = await fetch(`/api/blog/${slug}`);
      if (!res.ok) throw new Error('Post not found');
      return res.json();
    },
    enabled: !!slug,
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  // Related guides excluding current post
  const related = relatedGuides.filter(g => g.slug !== slug).slice(0, 4);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-96 bg-muted rounded"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Post not found</h1>
            <p className="text-muted-foreground mb-8">
              The blog post you're looking for doesn't exist.
            </p>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Render markdown-like content cleanly
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold text-foreground mt-8 mb-3">{line.replace('## ', '')}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-semibold text-foreground mt-6 mb-2">{line.replace('### ', '')}</h3>;
      if (line.startsWith('# ')) return null; // Skip h1, it's already in the header
      if (line.startsWith('- **')) {
        const parts = line.replace('- **', '').split('**:');
        return <li key={i} className="ml-4 mb-1 text-muted-foreground"><strong className="text-foreground">{parts[0]}</strong>: {parts[1]}</li>;
      }
      if (line.startsWith('- ')) return <li key={i} className="ml-4 mb-1 text-muted-foreground">{line.replace('- ', '')}</li>;
      if (/^\d+\. /.test(line)) return <li key={i} className="ml-4 mb-1 list-decimal text-muted-foreground">{line.replace(/^\d+\. /, '')}</li>;
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-muted-foreground leading-relaxed mb-3">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-4 gap-8">
          {/* Article Content */}
          <div className="lg:col-span-3">
            {/* Back Button */}
            <Link href="/blog">
              <Button variant="ghost" className="mb-8">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>

            {/* Article Header */}
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                {post.title}
              </h1>
              
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime} min read</span>
                </div>
              </div>
            </header>

            {/* Article Body */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              {renderContent(post.content)}
            </div>

            {/* Article Footer */}
            <footer className="mt-12 pt-8 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Last updated: {formatDate(post.updatedAt)}
                </div>
                <Link href="/blog">
                  <Button variant="outline">
                    More Articles
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </Button>
                </Link>
              </div>
            </footer>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Related Guides - Real Links */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-card-foreground mb-4">Download Guides</h3>
                <div className="space-y-3">
                  {related.map((guide) => (
                    <Link
                      key={guide.slug}
                      href={`/blog/${guide.slug}`}
                      className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1 border-b border-border last:border-0"
                    >
                      {guide.title}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
