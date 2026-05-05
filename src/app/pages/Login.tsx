import { Link, useNavigate } from "react-router";
import { Flower2, Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { apiJson, getToken, setToken } from "../lib/api";
import { Footer } from "../components/Footer";

const FloralAccent = ({ className }: { className: string }) => (
  <div className={`absolute pointer-events-none select-none ${className}`}>
    <Flower2 className="text-primary/8 w-full h-full" />
  </div>
);

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (getToken()) navigate("/app");
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const data = await apiJson<{ access_token: string; token_type: string }>(
        "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email: trimmedEmail, password }),
        },
      );
      setToken(data.access_token);
      navigate("/app");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-primary/8 blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-secondary/30 blur-3xl translate-x-1/4 translate-y-1/4" />
          <FloralAccent className="top-16 left-12 h-24 w-24" />
          <FloralAccent className="bottom-16 right-16 h-32 w-32" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-sm relative z-10 py-12"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex flex-col items-center gap-3">
              <div className="h-14 w-14 rounded-3xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                <Flower2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="font-semibold text-xl tracking-tight text-foreground">PRAMAAN</p>
                <p className="text-xs text-muted-foreground">Digital Testimony Platform</p>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">Welcome back. Your story is safe here. 💚</p>
          </div>

          {/* Card */}
          <div className="bg-card border border-border/60 rounded-3xl shadow-xl shadow-black/5 p-6">
            <h2 className="text-xl font-semibold mb-1">Log In</h2>
            <p className="text-sm text-muted-foreground mb-6">Enter your credentials to continue</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3"
                >
                  {error}
                </motion.div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 rounded-2xl h-11 bg-input-background text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 rounded-2xl h-11 bg-input-background text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                />
                <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                  Keep me logged in
                </label>
              </div>

              <Button
                type="submit"
                className="w-full rounded-2xl h-11 text-sm shadow-md shadow-primary/20 mt-2"
                size="lg"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log In Securely"}
              </Button>
            </form>

            <div className="mt-6 p-4 rounded-2xl border border-primary/20 bg-primary/5 text-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">
                  Demo Credentials
                </p>
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Email:</span>
                  <span className="text-xs font-mono font-medium text-foreground bg-background px-2 py-0.5 rounded-md border border-border">demo@pramaan.ai</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Password:</span>
                  <span className="text-xs font-mono font-medium text-foreground bg-background px-2 py-0.5 rounded-md border border-border">demo123</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl h-9 text-xs font-medium border-primary/20 hover:bg-primary/10 hover:text-primary transition-all"
                onClick={() => {
                  setEmail("demo@pramaan.ai");
                  setPassword("demo123");
                }}
              >
                Auto-fill Demo Account
              </Button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 text-xs text-muted-foreground uppercase tracking-widest">or</span>
              </div>
            </div>

            <Link to="/signup">
              <Button variant="outline" className="w-full rounded-2xl h-11 text-sm font-medium">
                Create Free Account
              </Button>
            </Link>
          </div>

          {/* Trust indicator */}
          <div className="flex items-center justify-center gap-2 mt-5 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span>Your data is encrypted and protected.</span>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
