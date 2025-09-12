import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, Activity, GitBranch, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const weeklyData = [
  { day: 'Mon', builds: 24, success: 22, deployments: 8 },
  { day: 'Tue', builds: 31, success: 28, deployments: 12 },
  { day: 'Wed', builds: 28, success: 25, deployments: 10 },
  { day: 'Thu', builds: 35, success: 33, deployments: 15 },
  { day: 'Fri', builds: 42, success: 38, deployments: 18 },
  { day: 'Sat', builds: 18, success: 17, deployments: 6 },
  { day: 'Sun', builds: 12, success: 11, deployments: 4 },
];

const monthlyTrends = [
  { month: 'Jan', builds: 890, deployments: 245 },
  { month: 'Feb', builds: 1020, deployments: 298 },
  { month: 'Mar', builds: 1150, deployments: 342 },
  { month: 'Apr', builds: 980, deployments: 289 },
  { month: 'May', builds: 1280, deployments: 387 },
  { month: 'Jun', builds: 1420, deployments: 425 },
];

export const AnalyticsChart = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
      {/* Build Analytics */}
      <Card className="border-border/30 bg-card/60 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 group">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-3 group-hover:text-primary transition-colors">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                Build Analytics
              </CardTitle>
              <CardDescription className="mt-2 text-base font-medium">
                Weekly build performance and success rates
              </CardDescription>
            </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 bg-background/60 backdrop-blur-sm hover:bg-background/80 transition-all">
                    <Calendar className="h-4 w-4 mr-2" />
                    7 days
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-md border-border/40 shadow-xl">
                <DropdownMenuItem className="hover:bg-primary/10 cursor-pointer">Last 7 days</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-primary/10 cursor-pointer">Last 30 days</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-primary/10 cursor-pointer">Last 3 months</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px hsl(var(--foreground) / 0.1)'
                }}
              />
              <Bar dataKey="builds" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="success" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Deployment Trends */}
      <Card className="border-border/30 bg-card/60 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 group">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-3 group-hover:text-primary transition-colors">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                Deployment Trends
              </CardTitle>
              <CardDescription className="mt-2 text-base font-medium">
                Monthly deployment and build volume trends
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 bg-background/60 backdrop-blur-sm hover:bg-background/80 transition-all">
                  <GitBranch className="h-4 w-4 mr-2" />
                  All branches
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-md border-border/40 shadow-xl">
                <DropdownMenuItem className="hover:bg-primary/10 cursor-pointer">All branches</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-primary/10 cursor-pointer">main only</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-primary/10 cursor-pointer">develop only</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="buildsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="deploymentsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px hsl(var(--foreground) / 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="builds" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#buildsGradient)"
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="deployments" 
                stroke="hsl(var(--success))" 
                fillOpacity={1} 
                fill="url(#deploymentsGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};