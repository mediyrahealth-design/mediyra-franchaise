import { PageLoader } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { Building2, CheckCircle, FlaskConical, Shield } from "lucide-react";
import { useEffect } from "react";

export default function LoginPage() {
  const {
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    role,
    roleLoading,
    login,
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !roleLoading) {
      if (role === "admin") {
        navigate({ to: "/admin" });
      } else if (role === "partner") {
        navigate({ to: "/partner" });
      }
    }
  }, [isAuthenticated, role, roleLoading, navigate]);

  if (isInitializing || (isAuthenticated && roleLoading)) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-16 h-72 w-72 rounded-full bg-white/5" />
          <div className="absolute bottom-1/4 -right-20 h-96 w-96 rounded-full bg-white/5" />
          <div className="absolute top-3/4 left-1/3 h-48 w-48 rounded-full bg-white/5" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-11 w-11 rounded-xl bg-white/20 flex items-center justify-center">
              <FlaskConical className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white leading-tight">
                Mediyra Lab
              </h1>
              <p className="text-white/60 text-xs tracking-widest uppercase">
                B2B Pathology System
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-4xl font-bold text-white leading-tight">
              Precision Diagnostics.
            </h2>
            <h2 className="font-display text-4xl font-bold text-white/60 leading-tight">
              Trusted Results.
            </h2>
          </div>

          <p className="mt-6 text-white/70 text-lg leading-relaxed max-w-sm">
            A complete laboratory management platform connecting collection
            centers with our diagnostic services seamlessly.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { icon: CheckCircle, text: "Real-time sample tracking" },
            { icon: Shield, text: "Secure & authenticated access" },
            { icon: Building2, text: "Multi-center management" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-white/70 shrink-0" />
              <span className="text-white/80 text-sm">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <FlaskConical className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">
                Mediyra Lab
              </h1>
              <p className="text-xs text-muted-foreground tracking-widest uppercase">
                B2B Pathology System
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Welcome to Mediyra Lab
            </h2>
            <p className="text-muted-foreground text-sm">
              Sign in to access your portal
            </p>
          </div>

          <div className="card-elevated p-6 space-y-5">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">
                Internet Identity
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Secure, decentralized authentication. No password required. Your
                identity is cryptographically verified.
              </p>
            </div>

            <Button
              type="button"
              onClick={login}
              disabled={isLoggingIn || isInitializing}
              className="w-full"
              size="lg"
              data-ocid="login.submit_button"
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign in with Internet Identity"
              )}
            </Button>

            <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
              First sign-in automatically registers your account. You will be
              directed to the appropriate portal after login.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
