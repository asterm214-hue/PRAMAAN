import { Link } from "react-router";
import {
  ArrowRight, Shield, Clock, FileText, Lock, Mic, Brain,
  CheckCircle2, AlertCircle, Flower2, Menu, X, Star, Heart, Users
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { motion } from "motion/react";
import { useState } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Footer } from "../components/Footer";

const FloralBlob = ({ className }: { className?: string }) => (
  <div className={`absolute pointer-events-none select-none opacity-[0.06] ${className}`}>
    <Flower2 className="text-primary w-full h-full" />
  </div>
);

export function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl bg-primary flex items-center justify-center shadow-sm">
                <Flower2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-lg tracking-tight">PRAMAAN</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors">How It Works</a>
              <a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</a>
              <a href="#about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About</a>
              <Link to="/login">
                <Button variant="outline" className="rounded-2xl h-9 text-sm">Log In</Button>
              </Link>
              <Link to="/signup">
                <Button className="rounded-2xl h-9 text-sm shadow-md shadow-primary/20">Sign Up Free</Button>
              </Link>
            </div>

            <button
              className="md:hidden h-9 w-9 rounded-xl flex items-center justify-center hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden pb-5 pt-2 space-y-1 border-t border-border"
            >
              {["How It Works", "Features", "About"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="block py-2.5 px-3 rounded-xl text-sm text-foreground hover:bg-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="pt-2 space-y-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full rounded-2xl">Log In</Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full rounded-2xl">Sign Up Free</Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -left-32 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-secondary/30 blur-3xl" />
          <FloralBlob className="top-24 left-8 h-28 w-28" />
          <FloralBlob className="bottom-12 right-12 h-24 w-24" />
          <FloralBlob className="top-40 right-1/4 h-16 w-16" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Trust badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 border border-primary/20"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Trauma-Informed · End-to-End Encrypted · AI-Powered</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
          >
            One Story. One Time.
            <br />
            <span className="text-primary">Fully Protected.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Record your testimony once. Let AI organize it into a clear, court-ready timeline.
            Share it securely with police, lawyers, or NGOs — without repeating your trauma.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link to="/signup">
              <Button size="lg" className="px-8 rounded-2xl shadow-lg shadow-primary/25 text-base">
                Start Recording — It's Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg" className="px-8 rounded-2xl text-base">
                See How It Works
              </Button>
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            {[
              { icon: Shield, text: "256-bit Encryption" },
              { icon: Lock, text: "Zero Knowledge Storage" },
              { icon: Heart, text: "Trauma-Informed Design" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5">
                <Icon className="h-4 w-4 text-primary" />
                <span>{text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="max-w-4xl mx-auto mt-14 relative z-10"
        >
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-border/50">
            <div className="relative aspect-[16/7]">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1417024321782-1375735f8987?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFjZWZ1bCUyMHdvbWFuJTIwam91cm5hbGluZyUyMGNhbG0lMjBuYXR1cmV8ZW58MXx8fHwxNzc3NzExMjkwfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Peaceful recording environment"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/40" />
              <div className="absolute inset-0 flex items-center">
                <div className="ml-8 sm:ml-16">
                  <p className="text-xs font-medium text-primary mb-2 uppercase tracking-wider">Your Safe Space</p>
                  <p className="text-xl sm:text-2xl font-semibold text-foreground max-w-xs leading-snug">
                    "Your story matters. Tell it once, safely."
                  </p>
                </div>
              </div>
              {/* Floating card overlay */}
              <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg border border-border/50">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-medium">Progress Auto-Saved</p>
                  <p className="text-[11px] text-muted-foreground">Take breaks anytime</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-primary/5 border-y border-border/50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "1×", label: "Tell your story once" },
              { value: "256-bit", label: "AES Encryption" },
              { value: "AI", label: "Timeline structuring" },
              { value: "100%", label: "You control access" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <p className="text-3xl font-bold text-primary mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">The Problem</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-3">Why The System Fails Survivors</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              The current legal process causes additional harm to those who are already vulnerable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: AlertCircle, title: "Repeated Retelling", description: "Survivors must retell their trauma to 5+ different officials, officials, re-opening wounds each time.", color: "text-rose-500" },
              { icon: Clock, title: "Fragmented Memory", description: "Critical details are lost, confused, or contradicted when recalled multiple times under stress.", color: "text-amber-500" },
              { icon: Shield, title: "Re-traumatization", description: "Every retelling reopens deep psychological wounds, often worsening mental health.", color: "text-orange-500" },
              { icon: FileText, title: "Delays in Justice", description: "Inconsistent accounts from trauma weaken legal cases and delay justice.", color: "text-red-500" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-shadow border-border/60">
                  <div className="h-10 w-10 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-accent/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">Simple Process</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-3">Four Steps to Protected Testimony</h2>
            <p className="text-muted-foreground">Designed with survivors in mind — calm, guided, and always in your control.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { step: "01", icon: Mic, title: "Record Your Story", description: "Choose video, audio, or text. Guided prompts help you remember. Pause and resume anytime — your progress is always saved.", color: "from-primary/20 to-primary/5" },
              { step: "02", icon: Brain, title: "AI Organizes Everything", description: "Our AI automatically creates a chronological timeline, identifies key evidence, and structures your testimony for legal use.", color: "from-secondary/40 to-secondary/10" },
              { step: "03", icon: Clock, title: "Review Your Timeline", description: "See your events clearly organized. Edit, add details, or clarify information in a distraction-free environment.", color: "from-primary/20 to-primary/5" },
              { step: "04", icon: Lock, title: "Share Securely", description: "Choose exactly who to share with — police, lawyers, or NGOs. You can revoke access at any moment.", color: "from-secondary/40 to-secondary/10" },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={`p-6 h-full bg-gradient-to-br ${step.color} border-primary/10 hover:shadow-md transition-shadow`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                        <step.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-primary/60 tracking-widest">STEP {step.step}</span>
                      <h3 className="font-semibold mt-1 mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-3">Everything You Need for Safe Testimony</h2>
            <p className="text-muted-foreground">A complete platform built with trauma-informed design principles.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Mic, title: "One-Time Recording", description: "Record once in video, audio, or text. Take as many breaks as you need." },
              { icon: Brain, title: "AI Structuring", description: "Automatic chronological organization and key fact identification for legal use." },
              { icon: Shield, title: "Secure Evidence Vault", description: "AES-256 encrypted vault. Only you control who sees your testimony." },
              { icon: FileText, title: "Court-Ready PDFs", description: "Generate formatted legal documents ready for official proceedings." },
              { icon: Clock, title: "Interactive Timeline", description: "Review and edit your timeline. Add details whenever you remember them." },
              { icon: Users, title: "Controlled Sharing", description: "Share with police, lawyers, or NGOs with granular permission controls." },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-all group hover:border-primary/30">
                  <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About / Trust Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-accent/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-5 w-5 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <blockquote className="text-xl sm:text-2xl font-medium mb-6 leading-relaxed">
              "PRAMAAN gave me the courage to tell my story once, completely, without fear of forgetting details or having to repeat myself again and again."
            </blockquote>
            <p className="text-sm text-muted-foreground">— Anonymous Survivor, shared with permission</p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/30 p-12 text-center border border-primary/20"
          >
            <FloralBlob className="top-0 right-4 h-32 w-32" />
            <FloralBlob className="bottom-0 left-4 h-24 w-24" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Start Your Secure Testimony Today
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Your story matters. Tell it once. Keep it safe. Use it for justice.
                PRAMAAN is here to support you every step of the way.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/signup">
                  <Button size="lg" className="px-8 rounded-2xl shadow-lg shadow-primary/25 text-base">
                    Get Started — Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="px-8 rounded-2xl text-base">
                    Already Have an Account
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mt-6">
                No credit card required · Your data stays private · Cancel anytime
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
