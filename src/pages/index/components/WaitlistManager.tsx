import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Users, Mail, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WaitlistEntry {
  email: string;
  timestamp: string;
  source: 'hero' | 'footer' | 'direct';
}

export const WaitlistManager = () => {
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load waitlist from localStorage
    const savedWaitlist = localStorage.getItem('rustci-waitlist');
    if (savedWaitlist) {
      try {
        setWaitlistEntries(JSON.parse(savedWaitlist));
      } catch (error) {
        console.error('Error loading waitlist:', error);
      }
    }
  }, []);

  const addToWaitlist = (email: string, source: 'hero' | 'footer' | 'direct' = 'direct') => {
    const newEntry: WaitlistEntry = {
      email,
      timestamp: new Date().toISOString(),
      source
    };

    const updatedWaitlist = [...waitlistEntries, newEntry];
    setWaitlistEntries(updatedWaitlist);
    localStorage.setItem('rustci-waitlist', JSON.stringify(updatedWaitlist));

    toast({
      title: "Added to Waitlist! 🎉",
      description: `${email} has been added to the RustCI & Valkyrie Protocol waitlist.`,
    });
  };

  const downloadWaitlist = () => {
    setIsDownloading(true);

    try {
      // Create CSV content
      const csvHeader = 'Email,Timestamp,Source,Registration Date\n';
      const csvContent = waitlistEntries
        .map(entry => 
          `"${entry.email}","${entry.timestamp}","${entry.source}","${new Date(entry.timestamp).toLocaleDateString()}"`
        )
        .join('\n');

      const fullCsv = csvHeader + csvContent;

      // Create and download file
      const blob = new Blob([fullCsv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `rustci-waitlist-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Complete! 📊",
        description: `Waitlist with ${waitlistEntries.length} entries has been downloaded.`,
      });

    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error downloading the waitlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Expose addToWaitlist globally for use in other components
  useEffect(() => {
    (window as any).addToRustCIWaitlist = addToWaitlist;
    return () => {
      delete (window as any).addToRustCIWaitlist;
    };
  }, [waitlistEntries]);

  const stats = {
    total: waitlistEntries.length,
    thisWeek: waitlistEntries.filter(entry => 
      new Date(entry.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
    heroSignups: waitlistEntries.filter(entry => entry.source === 'hero').length,
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Waitlist Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Signups</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">{stats.thisWeek}</div>
            <div className="text-sm text-muted-foreground">This Week</div>
          </div>
        </div>

        {/* Source Breakdown */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Sources:</div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              <Mail className="h-3 w-3 mr-1" />
              Hero: {stats.heroSignups}
            </Badge>
            <Badge variant="outline">
              <Calendar className="h-3 w-3 mr-1" />
              Other: {stats.total - stats.heroSignups}
            </Badge>
          </div>
        </div>

        {/* Download Button */}
        <Button 
          onClick={downloadWaitlist}
          disabled={waitlistEntries.length === 0 || isDownloading}
          className="w-full"
          variant="outline"
        >
          <Download className="h-4 w-4 mr-2" />
          {isDownloading ? 'Downloading...' : 'Download Waitlist CSV'}
        </Button>

        {waitlistEntries.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">
            No signups yet. Share the waitlist to get started!
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Export the add function for external use
export const addToRustCIWaitlist = (email: string, source?: 'hero' | 'footer' | 'direct') => {
  if ((window as any).addToRustCIWaitlist) {
    (window as any).addToRustCIWaitlist(email, source);
  }
};