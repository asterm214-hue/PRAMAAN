import { useState, useEffect } from "react";
import { Link } from "react-router";
import { apiJson } from "../lib/api";
import {
  Mic, FileText, Shield, Clock, ArrowRight, Flower2,
  TrendingUp, CheckCircle2, Sparkles, BookOpen, Bell
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { motion } from "motion/react";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const motivationalMessages = [
  "You're in a safe space. Take your time.",
  "Every step forward matters. You're doing great.",
  "Your courage inspires us. We're here with you.",
  "Remember: your progress is always saved.",
];

export function Dashboard() {
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, recentData] = await Promise.all([
          apiJson<any>("/api/testimony/stats"),
          apiJson<any[]>("/api/testimony/recent"),
        ]);
        
        setStats([
          { label: "Testimonies", value: statsData.testimonies.toString(), icon: BookOpen, trend: null },
          { label: "Timeline Events", value: statsData.events.toString(), icon: Clock, trend: null },
          { label: "Documents", value: statsData.documents.toString(), icon: FileText, trend: null },
          { label: "Privacy Score", value: statsData.privacy, icon: Shield, trend: "Excellent" },
        ]);
        
        if (recentData.length === 0) {
          setRecentActivities([
            { type: "record", title: "Started new testimony", subtitle: "No data yet", time: "Just now", status: "in-progress" },
          ]);
        } else {
          setRecentActivities(recentData);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };
    fetchData();
  }, []);

  const currentMessage = motivationalMessages[new Date().getHours() % motivationalMessages.length];

  const quickActions = [
    {
      to: "/app/record",
      icon: Mic,
      title: "Start Recording",
      description: "Begin a new testimony in video, audio, or text",
      cta: "Record Now",
      primary: true,
    },
    {
      to: "/app/timeline",
      icon: Clock,
      title: "My Timeline",
      description: "View your AI-organized chronological events",
      cta: "View Timeline",
      primary: false,
    },
    {
      to: "/app/vault",
      icon: Shield,
      title: "Secure Vault",
      description: "Access your encrypted testimonies & documents",
      cta: "Open Vault",
      primary: false,
    },
    {
      to: "/app/share",
      icon: FileText,
      title: "Share Securely",
      description: "Share with police, lawyers, or NGOs",
      cta: "Manage Sharing",
      primary: false,
    },
  ];

  return (
    <div className="min-h-screen p-5 lg:p-8 pb-24 lg:pb-8">
      <div className="max-w-6xl mx-auto">

        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/15 via-primary/10 to-secondary/20 p-6 border border-primary/15"
        >
          <div className="absolute right-4 top-0 bottom-0 flex items-center opacity-10">
            <Flower2 className="h-32 w-32 text-primary" />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-primary uppercase tracking-wider">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </span>
              </div>
              <h1 className="text-2xl font-semibold mb-1">{getGreeting()} 👋</h1>
              <p className="text-sm text-muted-foreground">{currentMessage}</p>
            </div>

            <div className="flex gap-2">
              <Link to="/app/record">
                <Button className="rounded-2xl shadow-md shadow-primary/20" size="sm">
                  <Mic className="mr-1.5 h-3.5 w-3.5" />
                  New Recording
                </Button>
              </Link>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative z-10 mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Your testimony progress</span>
              <span className="text-xs font-medium text-primary">65% complete</span>
            </div>
            <div className="h-2 bg-primary/15 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "65%" }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.to}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.07 }}
              >
                <Link to={action.to}>
                  <Card
                    className={`p-5 h-full hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-primary/50 ${
                      action.primary
                        ? "bg-primary border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <div
                      className={`h-10 w-10 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${
                        action.primary
                          ? "bg-white/20"
                          : "bg-primary/10"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${action.primary ? "text-white" : "text-primary"}`}
                      />
                    </div>
                    <h3
                      className={`font-semibold text-sm mb-1 ${action.primary ? "text-white" : ""}`}
                    >
                      {action.title}
                    </h3>
                    <p
                      className={`text-xs mb-3 leading-relaxed ${
                        action.primary ? "text-white/80" : "text-muted-foreground"
                      }`}
                    >
                      {action.description}
                    </p>
                    <div
                      className={`flex items-center text-xs font-medium ${
                        action.primary ? "text-white/90" : "text-primary"
                      }`}
                    >
                      {action.cta}
                      <ArrowRight className="ml-1.5 h-3 w-3" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Stats + Activity + Privacy */}
        <div className="grid lg:grid-cols-3 gap-5 mb-5">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="p-5 h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Recent Activity</h2>
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  <Bell className="h-2.5 w-2.5 mr-1" />
                  3 updates
                </Badge>
              </div>
              <div className="space-y-2">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors"
                  >
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {activity.type === "record" && <Mic className="h-4 w-4 text-primary" />}
                      {activity.type === "timeline" && <Clock className="h-4 w-4 text-primary" />}
                      {activity.type === "vault" && <Shield className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.subtitle}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                      {activity.status === "complete" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary ml-auto mt-0.5" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-amber-400 ml-auto mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Draft */}
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200/60 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-amber-100 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Continue Your Draft</p>
                      <p className="text-xs text-muted-foreground">Text testimony · 847 chars · Saved 2h ago</p>
                    </div>
                  </div>
                  <Link to="/app/record">
                    <Button size="sm" variant="outline" className="rounded-xl text-xs border-amber-200 text-amber-700 hover:bg-amber-50">
                      Continue
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Privacy + Safety */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="space-y-4"
          >
            <Card className="p-5 bg-gradient-to-br from-primary/10 to-secondary/20 border-primary/15">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-sm">Your Privacy</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                All testimonies are encrypted end-to-end. Only you can access your vault unless you choose to share.
              </p>
              <div className="space-y-1.5">
                {["AES-256 Encryption", "Zero-Knowledge Storage", "You control access"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <Link to="/app/profile">
                <Button variant="outline" className="w-full mt-4 rounded-xl text-xs h-8 border-primary/20 text-primary hover:bg-primary/5">
                  Privacy Settings
                </Button>
              </Link>
            </Card>

            <Card className="p-5 border-primary/10 bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-sm">AI Insights</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your timeline has <strong className="text-primary">2 key facts</strong> identified. AI suggests adding more details about location and time.
              </p>
              <Link to="/app/timeline">
                <Button className="w-full mt-3 rounded-xl text-xs h-8">
                  View Timeline
                  <TrendingUp className="ml-1.5 h-3 w-3" />
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="p-4 text-center hover:shadow-md transition-shadow">
                <div className="h-9 w-9 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                {stat.trend && (
                  <span className="text-[10px] text-primary/70 bg-primary/8 px-2 py-0.5 rounded-full mt-1 inline-block">
                    {stat.trend}
                  </span>
                )}
              </Card>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
