import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { exchangeOauthCallback } from "@/services/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function OAuthCallback() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const search = new URLSearchParams(location.search);
    const params: Record<string, string> = {};
    search.forEach((v, k) => (params[k] = v));

    exchangeOauthCallback(params)
      .then((res) => {
        localStorage.setItem("rustci_token", res.token);
        login(res.user.provider || "oauth", res.user);
        toast({ title: "Signed in", description: res.user.name });
        navigate("/dashboard", { replace: true });
      })
      .catch((err) => {
        toast({ title: "OAuth failed", description: err?.message || "Try again", variant: "destructive" });
        navigate("/login", { replace: true });
      });
  }, [location.search, login, navigate, toast]);

  return (
    <div className="min-h-svh grid place-items-center">
      <div className="text-center">
        <div className="text-muted-foreground">Completing sign-in...</div>
      </div>
    </div>
  );
}

