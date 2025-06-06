import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/use-auth";
import { useOnboarding } from "../hooks/use-onboarding";
import { OnboardingStepper } from "../components/OnboardingStepper";
import { StatCard } from "../components/dashboard/StatCard";
import { ReviewActivityCard } from "../components/dashboard/ReviewActivityCard";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import {
  Users,
  MessageSquare,
  Star,
  CheckCircle,
  Info,
  Send,
} from "lucide-react";
import { useIsMobile } from "../hooks/use-mobile";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Review } from '../../../shared/schema';
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { Helmet } from "react-helmet";

const placeholderMetrics = {
  reviewsThisWeek: 125,
  aiRepliesSent: 82,
  openReviewRequests: 15,
  averageStarRating: 4.7,
};

interface PlaceholderActivity {
  id: number;
  customerName: string;
  rating: number;
  replySnippet: string;
  date: Date;
  platformIcon?: React.ReactNode;
}

const placeholderActivities: PlaceholderActivity[] = [
  {
    id: 1,
    customerName: "John Doe",
    rating: 5,
    replySnippet: "Thank you for your kind words, John! We are so happy to hear that you had a great experience...",
    date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    platformIcon: undefined,
  },
  {
    id: 2,
    customerName: "Jane Smith",
    rating: 4,
    replySnippet: "We appreciate your feedback, Jane. We're always looking for ways to improve and will take your comments...",
    date: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    platformIcon: undefined,
  },
  {
    id: 3,
    customerName: "Alex Johnson",
    rating: 5,
    replySnippet: "Wonderful! We're thrilled you enjoyed our service, Alex. Hope to see you again soon!",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    platformIcon: undefined,
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { shouldShow, completeOnboarding, skipOnboarding } = useOnboarding();
  const [chartTimeframe, setChartTimeframe] = useState("week");
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const { data: reviews } = useQuery<Review[]>({
    queryKey: ["/api/reviews/recent"],
  });

  const updateReviewMutation = useMutation({
    mutationFn: async ({ reviewId, data }: { reviewId: number; data: Partial<Review> }) => {
      await apiRequest("PATCH", `/api/reviews/${reviewId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/recent"] });
      toast({
        title: "Success",
        description: "Response saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save response: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleApplyReply = (reviewId: number, reply: string) => {
    updateReviewMutation.mutate({
      reviewId,
      data: { response: reply },
    });
  };

  const isTrial = true;
  const trialDaysRemaining = 7;

  return (
    <>
      <Helmet>
        <title>Dashboard | Reputation Sentinel</title>
        <meta name="description" content="Monitor and manage your professional reviews with Reputation Sentinel's comprehensive dashboard." />
      </Helmet>

      {/* Onboarding Modal */}
      {shouldShow && (
        <OnboardingStepper
          onComplete={completeOnboarding}
          onSkip={skipOnboarding}
        />
      )}

      <h1 className="text-3xl font-semibold text-slate-800 dark:text-slate-100 mb-6">
        Welcome back, {user?.fullName || user?.username || 'User'}!
      </h1>

      {isTrial && (
        <Alert className="mb-6 border-yellow-500/50 text-yellow-700 dark:border-yellow-400/50 dark:text-yellow-300 [&>svg]:text-yellow-500 dark:[&>svg]:text-yellow-400">
          <Info className="h-5 w-5" />
          <AlertTitle className="font-semibold">Trial Period Active</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            You have {trialDaysRemaining} days left in your trial.
            <Button variant="outline" size="sm" className="ml-4 border-yellow-600 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-500 dark:text-yellow-400 dark:hover:bg-yellow-500/20">
              Upgrade Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Reviews This Week" 
          value={placeholderMetrics.reviewsThisWeek} 
          icon={<Star className="h-5 w-5" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard 
          title="AI Replies Sent" 
          value={placeholderMetrics.aiRepliesSent} 
          icon={<MessageSquare className="h-5 w-5" />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard 
          title="Open Review Requests" 
          value={placeholderMetrics.openReviewRequests} 
          icon={<Send className="h-5 w-5" />}
          trend={{ value: 3, isPositive: false }}
        />
        <StatCard 
          title="Average Star Rating" 
          value={`${placeholderMetrics.averageStarRating}/5`} 
          icon={<CheckCircle className="h-5 w-5" />}
          trend={{ value: 0.1, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">Recent AI Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {placeholderActivities.length > 0 ? (
                placeholderActivities.map((activity) => (
                  <ReviewActivityCard 
                    key={activity.id} 
                    customerName={activity.customerName}
                    rating={activity.rating}
                    replySnippet={activity.replySnippet}
                    date={activity.date}
                    platformIcon={activity.platformIcon}
                  />
                ))
              ) : (
                <p className="text-slate-500 dark:text-slate-400">No AI activity to display yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">Review Summary</CardTitle>
              <div className="flex items-center space-x-1">
                <Button 
                  variant={chartTimeframe === 'week' ? 'secondary' : 'ghost'} 
                  size="sm"
                  onClick={() => setChartTimeframe('week')}
                  className="px-2.5 py-1 h-auto text-xs"
                >
                  This Week
                </Button>
                <Button 
                  variant={chartTimeframe === 'month' ? 'secondary' : 'ghost'} 
                  size="sm"
                  onClick={() => setChartTimeframe('month')}
                  className="px-2.5 py-1 h-auto text-xs"
                >
                  Last 30 Days
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Star className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500">Chart visualization will be available here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}