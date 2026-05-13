import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Star, Trash2, Check, ShieldAlert } from "lucide-react";
import type { Review } from "@shared/schema";

export default function AdminReviews() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [secret, setSecret] = useState("");
    const [isAuthorized, setIsAuthorized] = useState(false);

    // Fetch All Reviews for Admin
    const { data: reviews, isLoading, error } = useQuery<Review[]>({
        queryKey: ["/api/reviews/admin", secret],
        queryFn: async () => {
            const res = await fetch(`/api/reviews/admin?secret=${secret}`);
            if (!res.ok) throw new Error("Unauthorized or Error");
            setIsAuthorized(true);
            return res.json();
        },
        enabled: secret.length > 5,
    });

    // Moderation Mutation
    const moderationMutation = useMutation({
        mutationFn: async ({ id, action }: { id: string; action: "approve" | "delete" }) => {
            await apiRequest("POST", "/api/reviews/moderate", { id, action, secret });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/reviews/admin"] });
            toast({ title: "Success", description: "Review updated successfully." });
        },
        onError: () => {
            toast({ title: "Error", description: "Moderation failed.", variant: "destructive" });
        },
    });

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md border-primary/20 bg-primary/5">
                        <CardHeader className="text-center">
                            <ShieldAlert className="w-12 h-12 text-primary mx-auto mb-4" />
                            <CardTitle>Admin Access Required</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground text-center">
                                Enter your admin secret key to moderate reviews.
                            </p>
                            <Input 
                                type="password" 
                                placeholder="Admin Secret" 
                                value={secret} 
                                onChange={(e) => setSecret(e.target.value)}
                                className="text-center"
                            />
                        </CardContent>
                    </Card>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <div className="container mx-auto px-4 py-12 pt-24 flex-1">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Manage Reviews</h1>
                    <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold border border-green-500/20">
                        Admin Mode
                    </span>
                </div>

                {isLoading ? (
                    <div className="text-center py-20">Loading reviews...</div>
                ) : (
                    <div className="grid gap-4">
                        {reviews?.map((review) => (
                            <Card key={review.id} className={`${!review.isApproved ? "border-yellow-500/50 bg-yellow-500/5" : ""}`}>
                                <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold">{review.name}</h4>
                                            {!review.isApproved && (
                                                <span className="text-[10px] bg-yellow-500 text-black px-1.5 py-0.5 rounded font-bold uppercase">
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 mb-2">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/20"}`} />
                                            ))}
                                        </div>
                                        <p className="text-sm text-muted-foreground italic">"{review.comment}"</p>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        {!review.isApproved && (
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="border-green-500/50 text-green-500 hover:bg-green-500/10"
                                                onClick={() => moderationMutation.mutate({ id: review.id, action: "approve" })}
                                            >
                                                <Check className="w-4 h-4 mr-1" /> Approve
                                            </Button>
                                        )}
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                                            onClick={() => moderationMutation.mutate({ id: review.id, action: "delete" })}
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {reviews?.length === 0 && <div className="text-center py-10 text-muted-foreground">No reviews found.</div>}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
