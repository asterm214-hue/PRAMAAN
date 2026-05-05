import { Link, useNavigate } from "react-router";
import { Flower2, Mail, Lock, User, Eye, EyeOff, Shield, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { motion } from "motion/react";
import { useState } from "react";
import { apiJson } from "../lib/api";
import { Footer } from "../components/Footer";

const FloralAccent = ({ className }: { className: string }) => (
  <div className={`absolute pointer-events-none select-none ${className}`}>
    <Flower2 className="text-primary/8 w-full h-full" />
  </div>
);

export function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const email = formData.email.trim();
    const name = formData.name.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!name) {
      setError("Please enter your full name.");
      return;
    }
    if (name.length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreed) {
      setError("Please accept the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      await apiJson("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });
      setSuccess("Account created successfully. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Signup failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const passwordStrength = () => {
    if (!formData.password) return null;
    if (formData.password.length < 6) return { label: "Weak", color: "bg-rose-400", width: "w-1/4" };
    if (formData.password.length < 10) return { label: "Fair", color: "bg-amber-400", width: "w-1/2" };
    if (formData.password.length < 14) return { label: "Good", color: "bg-primary", width: "w-3/4" };
    return { label: "Strong", color: "bg-green-500", width: "w-full" };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-secondary/25 blur-3xl translate-x-1/4 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-primary/8 blur-3xl -translate-x-1/4 translate-y-1/4" />
          <FloralAccent className="top-20 right-12 h-28 w-28" />
          <FloralAccent className="bottom-20 left-16 h-24 w-24" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-sm relative z-10 py-12"
        >
          {/* Logo */}
          <div className="text-center mb-7">
            <Link to="/" className="inline-flex flex-col items-center gap-3">
              <div className="h-14 w-14 rounded-3xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                <Flower2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="font-semibold text-xl tracking-tight text-foreground">PRAMAAN</p>
                <p className="text-xs text-muted-foreground">Digital Testimony Platform</p>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground mt-3">Create your secure account. Your voice matters. 💚</p>
          </div>

          {/* Card */}
          <div className="bg-card border border-border/60 rounded-3xl shadow-xl shadow-black/5 p-6">
            <h2 className="text-xl font-semibold mb-1">Create Account</h2>
            <p className="text-sm text-muted-foreground mb-5">Join securely — it's free</p>

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
              {success && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-2xl px-4 py-3"
                >
                  {success}
                </motion.div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10 rounded-2xl h-11 bg-input-background text-sm"
                    required
                  />
                </div>
              </div>

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
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 rounded-2xl h-11 bg-input-background text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={handleChange}
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
                {strength && (
                  <div>
                    <div className="h-1.5 bg-accent rounded-full overflow-hidden mt-1.5">
                      <div className={`h-full ${strength.color} ${strength.width} rounded-full transition-all duration-300`} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{strength.label} password</p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 pr-10 rounded-2xl h-11 bg-input-background text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="h-4 w-4 mt-0.5 rounded border-border accent-primary cursor-pointer flex-shrink-0"
                  required
                />
                <label htmlFor="agree" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                  I agree to the{" "}
                  <a href="#" className="text-primary hover:underline">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full rounded-2xl h-11 text-sm shadow-md shadow-primary/20"
                size="lg"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create My Account"}
              </Button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 text-xs text-muted-foreground">Already have an account?</span>
              </div>
            </div>

            <Link to="/login">
              <Button variant="outline" className="w-full rounded-2xl h-11 text-sm">
                Log In Instead
              </Button>
            </Link>
          </div>

          {/* Trust indicator */}
          <div className="flex items-center justify-center gap-2 mt-5 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span>End-to-end encrypted. Your privacy is our priority.</span>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
