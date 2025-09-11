import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAnimations } from '@/hooks/useAnimations';
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react';

/**
 * Demo component to showcase all animation features
 * This component demonstrates micro-interactions, page transitions, and modal animations
 */
export const AnimationDemo: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { isEnabled, isReducedMotion, classes } = useAnimations();

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Animation System Demo</h1>
        <p className="text-lg text-muted-foreground">
          Showcasing lightweight, performance-optimized animations
        </p>
        <div className="flex items-center justify-center gap-4">
          <Badge variant={isEnabled ? "default" : "secondary"}>
            {isEnabled ? "Animations Enabled" : "Reduced Motion"}
          </Badge>
          <Badge variant="outline">
            {isReducedMotion ? "Accessibility Mode" : "Full Animations"}
          </Badge>
        </div>
      </div>

      {/* Button Micro-interactions */}
      <Card variant="interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Button Micro-interactions
          </CardTitle>
          <CardDescription>
            Hover and click buttons to see smooth scale and shadow animations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Default Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="gradient">Gradient</Button>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <Play className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card Hover Animations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="interactive">
          <CardHeader>
            <CardTitle>Interactive Card</CardTitle>
            <CardDescription>Hover to see lift animation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">This card has hover animations that lift it up and add shadow.</p>
          </CardContent>
        </Card>

        <Card variant="floating">
          <CardHeader>
            <CardTitle>Floating Card</CardTitle>
            <CardDescription>Enhanced hover effects</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">This floating card has more pronounced hover animations.</p>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <CardTitle>Glass Card</CardTitle>
            <CardDescription>Glass morphism effect</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">This card uses glass morphism with backdrop blur.</p>
          </CardContent>
        </Card>
      </div>

      {/* Input Focus Animations */}
      <Card>
        <CardHeader>
          <CardTitle>Input Focus Animations</CardTitle>
          <CardDescription>
            Focus on inputs to see smooth ring and border transitions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              placeholder="Type something..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Input placeholder="Another input field" />
          </div>
          <Input placeholder="Full width input with focus animation" />
        </CardContent>
      </Card>

      {/* Modal Animations */}
      <Card>
        <CardHeader>
          <CardTitle>Modal Animations</CardTitle>
          <CardDescription>
            Open dialogs to see fade and scale animations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button>Open Simple Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Animated Dialog</DialogTitle>
                  <DialogDescription>
                    This dialog animates in with fade and scale effects, plus backdrop blur.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">
                    The dialog uses performance-optimized animations with GPU acceleration.
                    The backdrop has a blur effect and the content scales in smoothly.
                  </p>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Another Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Another Animated Dialog</DialogTitle>
                  <DialogDescription>
                    All dialogs share the same smooth animation system.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Input inside dialog" />
                  <div className="flex gap-2">
                    <Button size="sm">Action</Button>
                    <Button size="sm" variant="outline">Cancel</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Animation Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Animation System Status</CardTitle>
          <CardDescription>
            Current animation system configuration and performance info
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Animations Enabled:</span>
                <Badge variant={isEnabled ? "default" : "secondary"}>
                  {isEnabled ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Reduced Motion:</span>
                <Badge variant={isReducedMotion ? "destructive" : "default"}>
                  {isReducedMotion ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>GPU Acceleration:</span>
                <Badge variant="default">Enabled</Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Micro-interactions:</span>
                <span className="text-muted-foreground">200ms</span>
              </div>
              <div className="flex justify-between">
                <span>Page Transitions:</span>
                <span className="text-muted-foreground">300ms</span>
              </div>
              <div className="flex justify-between">
                <span>Modal Animations:</span>
                <span className="text-muted-foreground">250ms</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              All animations respect the user's motion preferences and use hardware acceleration 
              for optimal performance. Animations are automatically disabled for users who prefer 
              reduced motion.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimationDemo;