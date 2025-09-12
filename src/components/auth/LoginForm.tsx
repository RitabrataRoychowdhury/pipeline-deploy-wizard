import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { login as loginApi, oauthStartUrl } from "@/services/auth";
import type { OAuthProvider } from "@/api/endpoints";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Github, Mail, Lock } from "lucide-react";

interface Props extends React.ComponentProps<"form"> {}

export function LoginForm({ className, ...props }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await loginApi({ email, password });
      localStorage.setItem("rustci_token", res.token);
      login(res.user.provider || "password", res.user);
      toast({ title: "Welcome back", description: res.user.name });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Login failed", description: err?.message || "Try again", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOAuth = (provider: OAuthProvider) => {
    const redirect = `${window.location.origin}/auth/callback`;
    window.location.href = oauthStartUrl(provider, redirect);
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={onSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" />
          </div>
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
              Forgot your password?
            </a>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Logging in..." : "Login"}
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">Or continue with</span>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <Button type="button" variant="outline" className="w-full" onClick={() => handleOAuth("github")}> 
            <Github className="mr-2 size-4" /> Login with GitHub
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={() => handleOAuth("google")}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="mr-2 size-4"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.044,6.053,28.761,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C33.044,6.053,28.761,4,24,4C16.318,4,9.656,8.248,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.186l-6.191-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.624-3.325-11.281-7.958l-6.536,5.036C9.597,40.556,16.278,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.095,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.194,5.242C35.989,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
            Login with Google
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={() => handleOAuth("microsoft")}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23" className="mr-2 size-4"><path fill="#f25022" d="M1 1h10v10H1z"/><path fill="#7fba00" d="M12 1h10v10H12z"/><path fill="#00a4ef" d="M1 12h10v10H1z"/><path fill="#ffb900" d="M12 12h10v10H12z"/></svg>
            Login with Microsoft
          </Button>
        </div>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account? <Link to="/signup" className="underline underline-offset-4">Sign up</Link>
      </div>
    </form>
  );
}

