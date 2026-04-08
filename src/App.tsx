import { useState } from "react";
import { scanOpportunities, Opportunity } from "./services/geminiService";
import { Button, buttonVariants } from "./components/ui/button";
import { cn } from "./lib/utils";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { Loader2, Search, Mail, ExternalLink, MapPin, Calendar, Briefcase, Building } from "lucide-react";

export default function App() {
  const [role, setRole] = useState("Product Manager");
  const [organization, setOrganization] = useState("Digital Green");
  const [product, setProduct] = useState("FarmerChat");
  const [location, setLocation] = useState("Ethiopia");
  const [targetCategory, setTargetCategory] = useState("All");
  const [email, setEmail] = useState("");

  const [isScanning, setIsScanning] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  const handleScan = async () => {
    setIsScanning(true);
    setOpportunities([]);
    try {
      const results = await scanOpportunities(role, organization, product, location, targetCategory);
      setOpportunities(results);
      toast.success(`Found ${results.length} opportunities!`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to scan opportunities. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubscribe = () => {
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    // Simulate subscribing to email alerts
    toast.success(`Subscribed! Weekly alerts will be sent to ${email}.`);
    
    // In a real app, this would send the email to a backend service like Resend or SendGrid
    // to schedule a cron job that runs the scan and emails the results.
  };

  const handleEmailNow = () => {
    if (opportunities.length === 0) {
      toast.error("No opportunities to email. Please scan first.");
      return;
    }
    
    const subject = encodeURIComponent(`AgriTech Opportunities for ${product}`);
    const bodyText = opportunities.map(opp => 
      `${opp.title}\nType: ${opp.type}\nDate: ${opp.date}\nLocation: ${opp.location}\nLink: ${opp.url}\n\n${opp.description}`
    ).join("\n\n---\n\n");
    
    const body = encodeURIComponent(`Here are the latest opportunities found for promoting ${product}:\n\n${bodyText}`);
    
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8 font-sans text-neutral-900">
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">AgriTech Opportunity Radar</h1>
            <p className="text-neutral-500 mt-1">
              AI-powered web scraper for conferences, grants, speaking engagements, and sponsorships.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
            <Input 
              type="email" 
              placeholder="Enter email for alerts..." 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-64 border-none shadow-none focus-visible:ring-0"
            />
            <Button onClick={handleSubscribe} variant="secondary" size="sm">
              <Mail className="w-4 h-4 mr-2" />
              Subscribe
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Search Profile</CardTitle>
                <CardDescription>Configure your target audience and goals.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Your Role</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <Input id="role" value={role} onChange={e => setRole(e.target.value)} className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org">Organization</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <Input id="org" value={organization} onChange={e => setOrganization(e.target.value)} className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product">Product to Promote</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <Input id="product" value={product} onChange={e => setProduct(e.target.value)} className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Current Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <Input id="location" value={location} onChange={e => setLocation(e.target.value)} className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetCategory">Target Category</Label>
                  <Select value={targetCategory} onValueChange={setTargetCategory}>
                    <SelectTrigger id="targetCategory">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Opportunities</SelectItem>
                      <SelectItem value="Conferences">Conferences</SelectItem>
                      <SelectItem value="Grants">Grants</SelectItem>
                      <SelectItem value="Speaking Engagements">Speaking Engagements</SelectItem>
                      <SelectItem value="Sponsorships">Sponsorships</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleScan} disabled={isScanning} className="w-full bg-green-700 hover:bg-green-800 text-white">
                  {isScanning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scanning Web...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Find Opportunities
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-blue-50 border-blue-100">
              <CardHeader>
                <CardTitle className="text-sm text-blue-800">How it works</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-blue-700 space-y-2">
                <p>This tool uses Google Search via Gemini AI to scrape real-time data from:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Global AgriTech conferences</li>
                  <li>NGO & ICT4D event listings</li>
                  <li>Sponsorship prospectuses and exhibitor pages</li>
                  <li>Public social media announcements</li>
                  <li>Industry news and blogs</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {opportunities.length > 0 ? `Found ${opportunities.length} Opportunities` : "Ready to Scan"}
              </h2>
              {opportunities.length > 0 && (
                <Button onClick={handleEmailNow} variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Me This List
                </Button>
              )}
            </div>

            {isScanning ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="h-5 bg-neutral-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-neutral-100 rounded w-1/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-16 bg-neutral-100 rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : opportunities.length > 0 ? (
              <div className="grid gap-4">
                {opportunities.sort((a, b) => b.relevanceScore - a.relevanceScore).map((opp, idx) => (
                  <Card key={idx} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-6 flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={
                                opp.type === 'Conference' ? 'default' : 
                                opp.type === 'Grant' ? 'destructive' : 
                                opp.type === 'Speaking Engagement' ? 'secondary' : 
                                opp.type === 'Sponsorship' ? 'outline' : 'outline'
                              } className={opp.type === 'Sponsorship' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200' : ''}>
                                {opp.type}
                              </Badge>
                              <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                                Match Score: {opp.relevanceScore}/10
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 leading-tight">{opp.title}</h3>
                          </div>
                          <a 
                            href={opp.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            title="Visit Link"
                            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "shrink-0")}
                          >
                            <ExternalLink className="w-5 h-5 text-neutral-400 hover:text-neutral-900" />
                          </a>
                        </div>
                        
                        <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-neutral-600 mb-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1.5 text-neutral-400" />
                            {opp.date}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1.5 text-neutral-400" />
                            {opp.location}
                          </div>
                        </div>
                        
                        <p className="text-sm text-neutral-700 leading-relaxed">
                          {opp.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 bg-transparent">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-1">No opportunities found yet</h3>
                  <p className="text-neutral-500 max-w-sm">
                    Click "Find Opportunities" to scan the web for events, conferences, sponsorships, and grants relevant to your profile.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
