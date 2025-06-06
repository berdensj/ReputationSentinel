import React from 'react';
import { useState } from "react";
import { useIsMobile } from '../hooks/use-mobile';
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { MessageSquareText, Copy, RotateCw, ThumbsUp } from "lucide-react";
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';

export default function ResponsesPage() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [selectedTone, setSelectedTone] = useState("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [customResponse, setCustomResponse] = useState("");

  const templates = {
    positive: [
      {
        title: "Thank You Response",
        content: "Thank you for your wonderful feedback! We're delighted to hear that you had such a positive experience with our service. Our team works hard to provide the best care possible, and it's rewarding to know that our efforts are appreciated. We look forward to serving you again soon!"
      },
      {
        title: "Appreciation Response",
        content: "We sincerely appreciate your kind words and positive review! It means a lot to our entire team to receive such encouraging feedback. We're committed to maintaining the high standards you've experienced and hope to exceed your expectations on your next visit."
      }
    ],
    negative: [
      {
        title: "Service Recovery",
        content: "I sincerely apologize for the disappointing experience you had. This falls short of the standards we aim to provide, and I would like to personally look into this matter. Could you please contact our office directly so we can address your concerns and make things right? Your satisfaction is our priority."
      },
      {
        title: "Apology and Solution",
        content: "We're truly sorry to hear about your experience. This is not representative of the level of service we strive to deliver. We take your feedback seriously and would like to make this right. Please contact us directly at our office so we can address your specific concerns and find a suitable resolution."
      }
    ]
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Response template copied to clipboard",
    });
  };

  const handleGenerateNew = async () => {
    setIsGenerating(true);
    setCustomResponse("");
    
    try {
      const response = await apiRequest('POST', '/api/generate-ai-reply', { 
        prompt: "Generate a generic customer service response.",
        tone: selectedTone 
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || 'Failed to generate AI response');
      }
      
      const data = await response.json();
      
      if (data && data.reply) {
        setCustomResponse(data.reply);
        toast({
          title: "New Response Generated",
          description: "Your custom AI response is ready to use",
        });
      } else {
        throw new Error("Invalid response format from AI service");
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      toast({
        title: "Error Generating Response",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>AI Responses | Reputation Sentinel</title>
        <meta name="description" content="Generate and manage AI-powered responses to your online reviews with Reputation Sentinel." />
      </Helmet>
      
      <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-6">
              <h1 className="text-2xl font-semibold text-slate-800">AI Response Templates</h1>
              <p className="text-slate-500">Pre-written templates and custom responses for reviews</p>
            </header>

            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle>Response Templates</CardTitle>
                    <div className="mt-2 sm:mt-0 flex gap-2 items-center">
                      <span className="text-sm text-slate-500">Tone:</span>
                      <Select defaultValue={selectedTone} onValueChange={setSelectedTone}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="apologetic">Apologetic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="positive" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="positive" className="flex items-center">
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Positive Reviews
                      </TabsTrigger>
                      <TabsTrigger value="negative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2"><path d="M22 17H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h16"></path><path d="M2 9h2"></path><path d="M6 17v4"></path><path d="M10 17v4"></path></svg>
                        Negative Reviews
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="positive" className="space-y-4">
                      {templates.positive.map((template, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between mb-2">
                            <h3 className="font-medium">{template.title}</h3>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleCopyText(template.content)}
                              className="text-xs"
                              aria-label="Copy response"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                          <p className="text-sm text-slate-600">{template.content}</p>
                        </div>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="negative" className="space-y-4">
                      {templates.negative.map((template, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between mb-2">
                            <h3 className="font-medium">{template.title}</h3>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleCopyText(template.content)}
                              className="text-xs"
                              aria-label="Copy response"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                          <p className="text-sm text-slate-600">{template.content}</p>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                  
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between mb-4">
                      <h3 className="font-medium">Generate Custom Response</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateNew}
                        disabled={isGenerating}
                        aria-label={isGenerating ? "Generating new response" : "Generate new response"}
                      >
                        {isGenerating ? (
                          <>
                            <RotateCw className="h-3 w-3 mr-1 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <MessageSquareText className="h-3 w-3 mr-1" />
                            Generate New
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-slate-500 mb-3">
                      Our AI can generate a custom response based on your requirements.
                    </p>
                    <Card className="bg-slate-50">
                      <CardContent className="p-4">
                        <p className="text-sm text-slate-600 italic">
                          {customResponse || (isGenerating ? "Generating response..." : "Click \"Generate New\" to create a custom AI response.")}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
      </div>
    </>
  );
}