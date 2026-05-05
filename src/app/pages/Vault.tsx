import { useState, useEffect } from "react";
import { apiJson } from "../lib/api";
import {
  Shield, Lock, Download, Eye, Share2, FileText,
  Video, Mic, MoreVertical, Calendar, Search, Filter,
  CheckCircle2, Clock
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { motion } from "motion/react";
import { Link } from "react-router";

interface VaultItem {
  id: string;
  title: string;
  type: "video" | "audio" | "text";
  date: string;
  status: "draft" | "completed" | "shared";
  size: string;
  encrypted: boolean;
  events?: number;
}

export function Vault() {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await apiJson<any[]>("/api/testimony/");
        const mappedItems = data.map((t: any) => ({
          id: t.id.toString(),
          title: t.filename || `Testimony: ${t.type.toUpperCase()}`,
          type: t.type,
          date: new Date(t.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          status: t.processed ? "completed" : "draft",
          size: t.size ? `${(t.size / 1024).toFixed(1)} KB` : "0 KB",
          encrypted: true,
          events: t.timeline_events?.length || 0,
        }));
        
        if (mappedItems.length === 0) {
          setItems([
            {
              id: "1",
              title: "Primary Testimony (Demo Data)",
              type: "video",
              date: "March 15, 2026",
              status: "completed",
              size: "245 MB",
              encrypted: true,
              events: 4,
            }
          ]);
        } else {
          setItems(mappedItems);
        }
      } catch (err) {
        console.error("Failed to fetch vault items:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-5 w-5" />;
      case "audio": return <Mic className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "video": return "Video";
      case "audio": return "Audio";
      default: return "Text";
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return { label: "Completed", className: "bg-green-100 text-green-700 border-green-200" };
      case "draft":
        return { label: "Draft", className: "bg-amber-100 text-amber-700 border-amber-200" };
      case "shared":
        return { label: "Shared", className: "bg-primary/15 text-primary border-primary/20" };
      default:
        return { label: status, className: "" };
    }
  };

  return (
    <div className="min-h-screen p-5 lg:p-8 pb-24 lg:pb-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Secure Vault</h1>
              <p className="text-sm text-muted-foreground">
                All testimonies are encrypted and protected
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="px-3 py-1 rounded-full text-xs">
              <Lock className="mr-1 h-3 w-3" />
              End-to-End Encrypted
            </Badge>
            <Badge variant="outline" className="px-3 py-1 rounded-full text-xs">
              {items.length} Testimonies
            </Badge>
          </div>
        </motion.div>

        {/* Security Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-5"
        >
          <Card className="p-4 bg-gradient-to-r from-primary/8 to-secondary/15 border-primary/15">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Lock className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Your Data is Secure</p>
                <p className="text-xs text-muted-foreground">
                  Military-grade AES-256 encryption. Only you have access unless you explicitly choose to share.
                </p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
            </div>
          </Card>
        </motion.div>

        {/* Search + Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-5 flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search testimonies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-2xl h-10 bg-input-background text-sm"
            />
          </div>
          <Button variant="outline" className="rounded-2xl h-10 px-4">
            <Filter className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline text-sm">Filter</span>
          </Button>
        </motion.div>

        {/* Vault Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item, index) => {
            const statusConfig = getStatusConfig(item.status);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.08 }}
              >
                <Card className="p-5 hover:shadow-lg transition-all group border-border/60 hover:border-primary/25">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      {getTypeIcon(item.type)}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl">
                        <DropdownMenuItem className="rounded-xl">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl">
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mb-1.5">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-2 py-0.5 rounded-full mb-2 ${statusConfig.className}`}
                    >
                      {statusConfig.label}
                    </Badge>
                    <h3 className="font-semibold text-sm line-clamp-2 leading-snug">{item.title}</h3>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{item.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{item.events} timeline event{item.events !== 1 ? "s" : ""}</span>
                      <span className="text-muted-foreground/50">·</span>
                      <span>{item.size}</span>
                    </div>
                  </div>

                  {item.encrypted && (
                    <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/8 rounded-xl px-3 py-1.5 mb-4">
                      <Lock className="h-3 w-3" />
                      <span>Encrypted · {getTypeLabel(item.type)}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl h-8 text-xs">
                      <Eye className="mr-1 h-3.5 w-3.5" />
                      View
                    </Button>
                    <Link to="/app/share" className="flex-1">
                      <Button size="sm" className="w-full rounded-xl h-8 text-xs">
                        <Share2 className="mr-1 h-3.5 w-3.5" />
                        Share
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            );
          })}

          {/* Add New Testimony Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Link to="/app/record">
              <Card className="p-5 h-full min-h-[200px] flex flex-col items-center justify-center text-center border-2 border-dashed border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <Mic className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium mb-1">New Testimony</p>
                <p className="text-xs text-muted-foreground">Record a new testimony to add to your vault</p>
              </Card>
            </Link>
          </motion.div>
        </div>

        {/* Storage Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-5"
        >
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Storage Usage</p>
                <p className="text-xs text-muted-foreground">275 MB of 5 GB used (5.5%)</p>
              </div>
              <div className="w-full sm:w-48 h-2 bg-accent rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "5.5%" }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="bg-primary h-full rounded-full"
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
