import { useState, useRef, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { Home, Mic, Clock, Shield, Share2, User, Menu, X, Flower2, Bot, Send, Sparkles, ChevronRight, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "motion/react";
import { clearToken, getToken, apiJson } from "../lib/api";
import { Footer } from "./Footer";

const navItems = [
  { path: "/app", icon: Home, label: "Home", exact: true },
  { path: "/app/record", icon: Mic, label: "Record" },
  { path: "/app/timeline", icon: Clock, label: "Timeline" },
  { path: "/app/vault", icon: Shield, label: "Vault" },
  { path: "/app/share", icon: Share2, label: "Share" },
  { path: "/app/profile", icon: User, label: "Profile" },
];

interface Message {
  id: string;
  from: "user" | "bot";
  text: string;
  timestamp: Date;
}

const quickPrompts = [
  "How do I start recording?",
  "Is my data safe?",
  "How to share with a lawyer?",
  "Can I edit my timeline?",
];

const botResponses: Record<string, string> = {
  "How do I start recording?":
    "To start recording, go to the **Record** page from the sidebar. You can choose video, audio, or text. Take your time — there's no rush, and you can save your progress and return anytime. 💚",
  "Is my data safe?":
    "Absolutely. All your testimonies are encrypted end-to-end using AES-256 encryption. Only you can access your vault unless you explicitly choose to share. Your privacy is our highest priority. 🔒",
  "How to share with a lawyer?":
    "From the **Share** page, add your lawyer's email as a recipient, set their permissions (view/download), and click 'Share Securely'. You can revoke access at any time. 📤",
  "Can I edit my timeline?":
    "Yes! On the **Timeline** page, each event has an edit button. You can modify descriptions, add details, change dates, or add entirely new events whenever you're ready. ✏️",
};

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      from: "bot",
      text: "Hello 💚 I'm your PRAMAAN AI assistant. I'm here to guide you through this process at your own pace. What would you like help with today?",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await apiJson<{ name: string; email: string }>("/api/auth/me");
        setUserData(data);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };
    fetchUser();
  }, []);

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!getToken()) navigate("/login");
  }, [navigate]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      from: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      const responseText =
        botResponses[text] ||
        "Thank you for reaching out. Please know you're supported every step of the way. For specific concerns about your case, consider speaking with a legal professional. I'm here to help you navigate this platform. 💚";

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        from: "bot",
        text: responseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const currentPage = navItems.find((item) =>
    isActive(item.path, item.exact)
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-border">
          <Link
            to="/"
            className="flex items-center gap-3"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center shadow-md">
              <Flower2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-base leading-none">PRAMAAN</p>
              <p className="text-xs text-muted-foreground mt-0.5">Digital Testimony</p>
            </div>
          </Link>
        </div>

        {/* User Info */}
        <div className="px-4 py-3 mx-3 mt-3 rounded-2xl bg-primary/8 border border-primary/15">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{userData?.name || "Anonymous User"}</p>
              <p className="text-xs text-muted-foreground">Protected & Private</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  active
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-foreground hover:bg-accent/80"
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
                {active && <ChevronRight className="h-3 w-3 ml-auto opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-primary" />
              <p className="text-xs font-medium text-primary">End-to-End Encrypted</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Your data is always private. Only you have access.
            </p>
          </div>
          <button
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-accent/80 transition-colors text-sm"
            onClick={() => {
              clearToken();
              navigate("/login");
            }}
          >
            <LogOut className="h-4 w-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile Top Bar */}
        <header className="lg:hidden sticky top-0 bg-card/90 backdrop-blur-md border-b border-border z-30 flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-accent transition-colors"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="flex items-center gap-2">
            <Flower2 className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">PRAMAAN</span>
          </div>

          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
        </header>

        {/* Page Breadcrumb - Desktop */}
        {currentPage && (
          <div className="hidden lg:flex items-center px-8 pt-5 pb-0">
            <span className="text-xs text-muted-foreground">PRAMAAN</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground mx-1" />
            <span className="text-xs text-primary font-medium">{currentPage.label}</span>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1">
          <Outlet />
          <div className="mt-auto">
            <Footer />
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-30 pb-safe">
          <div className="flex items-center justify-around py-2">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <div className={`p-1.5 rounded-xl transition-all ${active ? "bg-primary/10" : ""}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating AI Chatbot Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-20 right-5 lg:bottom-6 lg:right-6 h-14 w-14 rounded-full bg-primary text-white shadow-xl shadow-primary/30 flex items-center justify-center z-40"
      >
        <AnimatePresence mode="wait">
          {chatOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Bot className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
        {!chatOpen && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-36 right-5 lg:bottom-24 lg:right-6 w-[calc(100vw-2.5rem)] max-w-sm bg-card rounded-3xl shadow-2xl border border-border z-40 overflow-hidden flex flex-col"
            style={{ maxHeight: "70vh" }}
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-sm">PRAMAAN AI Assistant</p>
                <p className="text-xs opacity-80">Here to guide & support you</p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-300 animate-pulse" />
                <span className="text-xs opacity-80">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.from === "bot" && (
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.from === "user"
                        ? "bg-primary text-white rounded-br-md"
                        : "bg-accent/70 text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="bg-accent/70 px-4 py-3 rounded-2xl rounded-bl-md flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="h-2 w-2 rounded-full bg-primary/50"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(inputText)}
                  placeholder="Ask anything..."
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-input-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={() => sendMessage(inputText)}
                  disabled={!inputText.trim()}
                  className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
