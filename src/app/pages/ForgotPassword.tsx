import { Link } from "react-router";
import { Flower2, Mail, ArrowLeft, CheckCircle2, Shield } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { apiJson } from "../lib/api";
import { Footer } from "../components/Footer";

const FloralAccent = ({ className }: { className: string }) => (
  <div className={`absolute pointer-events-none select-none ${className}`}>
    <Flower2 className="text-primary/8 w-full h-full" />
  </div>
);

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await apiJson<{ msg: string }>("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setIsSubmitted(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Request failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 h-64 w-64 rounded-full bg-primary/8 blur-3xl -translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-secondary/25 blur-3xl translate-x-1/4 translate-y-1/4" />
          <FloralAccent className="top-16 left-16 h-24 w-24" />
          <FloralAccent className="bottom-20 right-12 h-28 w-28" />
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
            <p className="text-sm text-muted-foreground mt-3">
              We'll help you regain access safely and securely.
            </p>
          </div>

          {/* Card */}
          <div className="bg-card border border-border/60 rounded-3xl shadow-xl shadow-black/5 p-6">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="text-xl font-semibold mb-1">Reset Password</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Enter your email and we'll send you a secure reset link
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3">
                        {error}
                      </div>
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

                    <Button
                      type="submit"
                      className="w-full rounded-2xl h-11 text-sm shadow-md shadow-primary/20"
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </form>

                  <div className="mt-5 text-center">
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back to Log In
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25 }}
                  className="text-center py-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                    className="h-16 w-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  </motion.div>

                  <h3 className="text-xl font-semibold mb-2">Check Your Email</h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    We've sent a reset link to:
                  </p>
                  <p className="text-sm font-medium text-primary mb-4">{email}</p>
                  <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                    The link will expire in 30 minutes. If you don't see the email, please check your spam folder.
                  </p>

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsSubmitted(false)}
                      className="w-full rounded-2xl h-11 text-sm"
                    >
                      Try a Different Email
                    </Button>
                    <Link to="/login">
                      <Button variant="ghost" className="w-full rounded-2xl h-11 text-sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Log In
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Trust indicator */}
          <div className="flex items-center justify-center gap-2 mt-5 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span>Secure password reset via encrypted email link.</span>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
