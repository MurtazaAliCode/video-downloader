import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Star, MessageSquare, CheckCircle, Clock } from "lucide-react";
import type { Review } from "@shared/schema";

export default function Status() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [rating, setRating] = useState(5);
    const [hover, setHover] = useState(0);
    const [name, setName] = useState("");
    const [comment, setComment] = useState("");

    // Fetch Reviews
    const { data: reviews, isLoading } = useQuery<Review[]>({
        queryKey: ["/api/reviews"],
        refetchInterval: 30000,
    });

    // Create Review Mutation
    const mutation = useMutation({
        mutationFn: async (newReview: { name: string; rating: number; comment: string }) => {
            const res = await apiRequest("POST", "/api/reviews", newReview);
            return res.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Feedback Recieved!",
                description: data.message,
            });
            setName("");
            setComment("");
            setRating(5);
            queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment) return;
        mutation.mutate({ name, rating, comment });
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-4xl mx-auto">
                    {/* Page Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-sm font-bold uppercase tracking-wider">All Systems Operational</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-foreground mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Service Status & Feedback
                        </h1>
                        <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
                            Check real-time performance and see what our community has to say.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-20">
                        {/* Status Cards */}
                        <div className="md:col-span-1 space-y-4">
                            <Card className="glass-card overflow-hidden">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Infrastructure</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Website</span>
                                        <span className="text-xs font-bold text-green-500">UP</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Download Engine</span>
                                        <span className="text-xs font-bold text-green-500">UP</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">API Sync</span>
                                        <span className="text-xs font-bold text-green-500">UP</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-primary/5 border-primary/20">
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground">
                                        Our systems are monitored 24/7. Last check: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Review Form */}
                        <div className="md:col-span-2">
                            <Card className="glass-card border-primary/20 bg-primary/5 shadow-2xl shadow-primary/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-primary" />
                                        Share Your Feedback
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Star Rating */}
                                        <div className="flex flex-col items-center justify-center py-4 bg-background/50 rounded-xl border border-border/50">
                                            <p className="text-sm font-medium text-muted-foreground mb-3">Rating</p>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        className="transition-transform hover:scale-125 focus:outline-none"
                                                        onClick={() => setRating(star)}
                                                        onMouseEnter={() => setHover(star)}
                                                        onMouseLeave={() => setHover(0)}
                                                    >
                                                        <Star
                                                            className={`w-10 h-10 ${
                                                                star <= (hover || rating)
                                                                    ? "text-yellow-400 fill-yellow-400 shadow-yellow-500/50"
                                                                    : "text-muted-foreground/30"
                                                            } transition-colors`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-xs font-bold mt-4 text-primary uppercase">
                                                {rating === 5 ? "Excellent!" : rating === 4 ? "Very Good" : rating === 3 ? "Good" : rating === 2 ? "Could be better" : "Poor"}
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <Input
                                                placeholder="Your Name (Optional)"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="bg-background/50 border-border/50 focus:border-primary/50"
                                            />
                                            <Textarea
                                                placeholder="Tell us about your experience..."
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                className="min-h-[120px] bg-background/50 border-border/50 focus:border-primary/50"
                                                required
                                            />
                                        </div>

                                        <Button 
                                            type="submit" 
                                            className="w-full btn-gradient py-6 text-lg font-bold"
                                            disabled={mutation.isPending}
                                        >
                                            {mutation.isPending ? "Submitting..." : "Submit Review"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Community Reviews Feed */}
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold text-foreground">Community Wall</h2>
                            <div className="flex items-center gap-2 text-primary font-medium">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm">Verified Reviews</span>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
                            </div>
                        ) : reviews && reviews.length > 0 ? (
                            <div className="grid gap-6">
                                {reviews.map((review) => (
                                    <div
                                        key={review.id}
                                        className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow group animate-in fade-in slide-in-from-bottom-4"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {review.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-foreground">{review.name}</h4>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-0.5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${
                                                            i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/20"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed italic">
                                            "{review.comment}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border">
                                <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
