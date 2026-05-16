import { useState, useEffect } from "react";
import { apiJson } from "../lib/api";
import {
  Share2, Shield, CheckCircle2, Users, FileText, Eye,
  Download, Send, Plus, X, Clock, Lock, AlertCircle,
  Mail, MessageCircle, Phone, ChevronDown, Video, Mic, User
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { motion, AnimatePresence } from "motion/react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Recipient {
  id: string;
  name: string;
  role: string;
  roleId: string;
  email: string;
  phone?: string;
  permissions: { view: boolean; download: boolean };
}

interface TestimonyDoc {
  id: string;
  title: string;
  type: "video" | "audio" | "text";
  size: string;
  date: string;
}

const roleConfigs: Record<string, { color: string; bg: string; border: string }> = {
  police:  { color: "text-blue-700",    bg: "bg-blue-50",   border: "border-blue-200"   },
  lawyer:  { color: "text-purple-700",  bg: "bg-purple-50", border: "border-purple-200" },
  ngo:     { color: "text-green-700",   bg: "bg-green-50",  border: "border-green-200"  },
  court:   { color: "text-orange-700",  bg: "bg-orange-50", border: "border-orange-200" },
  other:   { color: "text-muted-foreground", bg: "bg-accent", border: "border-border"   },
};

const roleOptions = [
  { id: "police",  label: "Police",          icon: Shield    },
  { id: "lawyer",  label: "Lawyer",          icon: FileText  },
  { id: "ngo",     label: "NGO / Support",   icon: Users     },
  { id: "court",   label: "Court Official",  icon: Eye       },
  { id: "other",   label: "Other",           icon: User      },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function Share() {
  const [documents, setDocuments] = useState<TestimonyDoc[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [sharedSuccess, setSharedSuccess] = useState(false);

  // Add-recipient form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("other");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");

  // Fetch real testimonies
  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiJson<any[]>("/api/testimony/");
        const docs: TestimonyDoc[] = data.map((t: any) => ({
          id: t.id.toString(),
          title: t.filename
            ? t.filename.replace(/\.[^.]+$/, "").replace(/_/g, " ")
            : t.content
            ? t.content.substring(0, 40) + (t.content.length > 40 ? "…" : "")
            : `${t.type.charAt(0).toUpperCase() + t.type.slice(1)} Testimony`,
          type: t.type as "video" | "audio" | "text",
          size: t.size ? `${(t.size / 1024).toFixed(1)} KB` : "—",
          date: t.created_at
            ? new Date(t.created_at).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              })
            : "—",
        }));

        // Fallback demo doc if empty
        if (docs.length === 0) {
          docs.push({
            id: "demo",
            title: "Primary Testimony (Demo)",
            type: "video",
            size: "245 MB",
            date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          });
        }

        setDocuments(docs);
        setSelectedDocId(docs[0].id);
      } catch (err) {
        console.error("Failed to load testimonies for Share:", err);
      }
    };
    load();
  }, []);

  const selectedDoc = documents.find((d) => d.id === selectedDocId);

  const typeIcon = (type: string) => {
    if (type === "video") return <Video className="h-4 w-4" />;
    if (type === "audio") return <Mic className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  // ── Recipient actions ────────────────────────────────────────────────────────

  const addRecipient = () => {
    if (!newName.trim() || (!newEmail.trim() && !newPhone.trim())) return;
    const newR: Recipient = {
      id: Date.now().toString(),
      name: newName.trim(),
      role: roleOptions.find((r) => r.id === newRole)?.label ?? "Other",
      roleId: newRole,
      email: newEmail.trim(),
      phone: newPhone.trim(),
      permissions: { view: true, download: false },
    };
    setRecipients((prev) => [...prev, newR]);
    setNewName(""); setNewEmail(""); setNewPhone(""); setNewRole("other");
    setShowAddForm(false);
  };

  const togglePermission = (id: string, perm: "view" | "download") => {
    setRecipients((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, permissions: { ...r.permissions, [perm]: !r.permissions[perm] } } : r
      )
    );
  };

  const removeRecipient = (id: string) => setRecipients((prev) => prev.filter((r) => r.id !== id));

  // ── Sharing actions ──────────────────────────────────────────────────────────

  const buildShareMessage = () => {
    const docTitle = selectedDoc?.title ?? "Testimony";
    return (
      `*PRAMAAN – Secure Testimony Share*\n\n` +
      `You have been granted access to: *${docTitle}*\n` +
      `Date: ${selectedDoc?.date ?? ""}\n\n` +
      `Access the PRAMAAN platform to view the shared testimony. ` +
      `Your access expires in 30 days.\n\n` +
      `_This is a secure, encrypted link. Do not forward without consent._`
    );
  };

  const shareViaWhatsApp = (recipient: Recipient) => {
    const msg = encodeURIComponent(buildShareMessage());
    const phone = recipient.phone?.replace(/\D/g, "");
    const url = phone
      ? `https://wa.me/${phone}?text=${msg}`
      : `https://wa.me/?text=${msg}`;
    window.open(url, "_blank");
  };

  const shareViaEmail = (recipient: Recipient) => {
    const subject = encodeURIComponent(`PRAMAAN – Secure Testimony: ${selectedDoc?.title ?? ""}`);
    const body = encodeURIComponent(
      `Dear ${recipient.name},\n\n${buildShareMessage().replace(/\*/g, "")}`
    );
    window.open(`mailto:${recipient.email}?subject=${subject}&body=${body}`, "_blank");
  };

  const handleShareAll = () => {
    setSharedSuccess(true);
    setTimeout(() => setSharedSuccess(false), 3000);
  };

  // Legal Doc Generation
  const [showLegalDialog, setShowLegalDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [legalDetails, setLegalDetails] = useState({
    court_name: "",
    case_title: "",
    fir_no: "",
    fir_year: new Date().getFullYear().toString(),
    police_station: "",
    victim_age: "",
    victim_address: "",
    incident_date: "",
    incident_time: "",
    incident_location: "",
    physical_impact: "",
    emotional_impact: "",
    financial_impact: "",
    police_station_reported: "",
    fir_no_reported: "",
    fir_date_reported: "",
    verified_place: "",
  });

  const [docType, setDocType] = useState("Primary Victim Statement");

  const handleGeneratePDF = async () => {
    if (!selectedDocId || selectedDocId === "demo") {
      alert("Please select a real testimony first.");
      return;
    }
    setIsGenerating(true);
    try {
      const response = await apiJson<any>("/api/legal/generate", {
        method: "POST",
        body: JSON.stringify({
          testimony_id: parseInt(selectedDocId),
          doc_type: docType,
          ...legalDetails,
        }),
      });
      // Trigger download
      window.open(`/uploads/${response.pdf_path}`, "_blank");
      setShowLegalDialog(false);
    } catch (err) {
      console.error("PDF Generation failed:", err);
      alert("Failed to generate PDF. Please ensure all details are correct.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen p-5 lg:p-8 pb-24 lg:pb-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }} className="mb-6"
        >
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Share2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Share Testimony</h1>
              <p className="text-sm text-muted-foreground">
                You decide who sees your testimony and what they can do with it
              </p>
            </div>
          </div>
        </motion.div>

        {/* Control Notice */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }} className="mb-5"
        >
          <Card className="p-4 bg-gradient-to-r from-primary/8 to-secondary/15 border-primary/15">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Lock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">You're Always in Control</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  You can revoke access at any time. All shared links expire after 30 days by default.
                  Recipients will be notified of any permission changes.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Step 1: Select Testimony */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }} className="mb-5"
        >
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">1</div>
              <h3 className="font-semibold text-sm">Choose Testimony to Share</h3>
            </div>
            {documents.length === 0 ? (
              <div className="text-center py-6">
                <motion.div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent mx-auto"
                  animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
                <p className="text-xs text-muted-foreground mt-2">Loading your testimonies...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedDocId === doc.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30 hover:bg-accent/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                          selectedDocId === doc.id ? "bg-primary/15 text-primary" : "bg-accent text-muted-foreground"
                        }`}>
                          {typeIcon(doc.type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium line-clamp-1">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.type.toUpperCase()} · {doc.size} · {doc.date}
                          </p>
                        </div>
                      </div>
                      {selectedDocId === doc.id && (
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Step 2: Add Recipients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }} className="mb-5"
        >
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">2</div>
                <h3 className="font-semibold text-sm">Add Recipients</h3>
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Person
              </button>
            </div>

            {/* Add Recipient Form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="p-4 bg-accent/30 rounded-2xl border border-border/60 space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Recipient Details
                    </p>

                    {/* Name */}
                    <div>
                      <Label className="text-xs mb-1.5 block">Full Name *</Label>
                      <Input
                        placeholder="e.g. Detective Sarah Williams"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="rounded-xl h-9 text-sm bg-card"
                      />
                    </div>

                    {/* Role */}
                    <div>
                      <Label className="text-xs mb-1.5 block">Role / Organisation</Label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {roleOptions.map((opt) => {
                          const Icon = opt.icon;
                          const cfg = roleConfigs[opt.id];
                          return (
                            <button
                              key={opt.id}
                              onClick={() => setNewRole(opt.id)}
                              className={`p-2.5 rounded-xl border-2 text-center transition-all ${
                                newRole === opt.id
                                  ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                                  : "border-border hover:border-primary/40 bg-card"
                              }`}
                            >
                              <Icon className={`h-4 w-4 mx-auto mb-1 ${newRole === opt.id ? cfg.color : "text-muted-foreground"}`} />
                              <p className="text-[10px] font-medium">{opt.label}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <Label className="text-xs mb-1.5 block">Email Address</Label>
                      <Input
                        type="email"
                        placeholder="recipient@example.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="rounded-xl h-9 text-sm bg-card"
                      />
                    </div>

                    {/* Phone (for WhatsApp) */}
                    <div>
                      <Label className="text-xs mb-1.5 block">
                        Phone / WhatsApp
                        <span className="text-muted-foreground font-normal ml-1">(with country code, e.g. +919876543210)</span>
                      </Label>
                      <Input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="rounded-xl h-9 text-sm bg-card"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl h-8 text-xs"
                        onClick={() => setShowAddForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="rounded-xl h-8 text-xs flex-1"
                        onClick={addRecipient}
                        disabled={!newName.trim() || (!newEmail.trim() && !newPhone.trim())}
                      >
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Add Recipient
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recipients List */}
            {recipients.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {recipients.length} Recipient{recipients.length !== 1 ? "s" : ""}
                </p>
                {recipients.map((recipient) => {
                  const config = roleConfigs[recipient.roleId] || roleConfigs.other;
                  return (
                    <div key={recipient.id} className="border border-border rounded-2xl p-4 hover:bg-accent/30 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
                            <Users className={`h-4 w-4 ${config.color}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{recipient.name}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-2 py-0.5 rounded-full ${config.bg} ${config.color} ${config.border}`}
                              >
                                {recipient.role}
                              </Badge>
                              {recipient.email && (
                                <span className="text-xs text-muted-foreground">{recipient.email}</span>
                              )}
                              {recipient.phone && (
                                <span className="text-xs text-muted-foreground">{recipient.phone}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeRecipient(recipient.id)}
                          className="h-7 w-7 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Permissions */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="flex items-center justify-between bg-accent/40 rounded-xl px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            <Label htmlFor={`view-${recipient.id}`} className="text-xs cursor-pointer">Can View</Label>
                          </div>
                          <Switch
                            id={`view-${recipient.id}`}
                            checked={recipient.permissions.view}
                            onCheckedChange={() => togglePermission(recipient.id, "view")}
                            className="scale-75"
                          />
                        </div>
                        <div className="flex items-center justify-between bg-accent/40 rounded-xl px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Download className="h-3.5 w-3.5 text-muted-foreground" />
                            <Label htmlFor={`dl-${recipient.id}`} className="text-xs cursor-pointer">Download</Label>
                          </div>
                          <Switch
                            id={`dl-${recipient.id}`}
                            checked={recipient.permissions.download}
                            onCheckedChange={() => togglePermission(recipient.id, "download")}
                            className="scale-75"
                          />
                        </div>
                      </div>

                      {/* Direct Share Buttons */}
                      <div className="flex gap-2">
                        {recipient.phone && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 rounded-xl h-8 text-xs text-green-700 border-green-200 hover:bg-green-50"
                            onClick={() => shareViaWhatsApp(recipient)}
                          >
                            <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                            WhatsApp
                          </Button>
                        )}
                        {recipient.email && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 rounded-xl h-8 text-xs text-blue-700 border-blue-200 hover:bg-blue-50"
                            onClick={() => shareViaEmail(recipient)}
                          >
                            <Mail className="mr-1.5 h-3.5 w-3.5" />
                            Email
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No recipients added yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Click "Add Person" to get started</p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Share All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }} className="mb-5"
        >
          <AnimatePresence mode="wait">
            {sharedSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3"
              >
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Shared Successfully!</p>
                  <p className="text-xs text-green-600">Recipients have been notified securely.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="button" className="space-y-2">
                {/* Quick share row */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-2xl text-sm text-green-700 border-green-200 hover:bg-green-50"
                    disabled={recipients.filter(r => r.phone).length === 0}
                    onClick={() => recipients.filter(r => r.phone).forEach(shareViaWhatsApp)}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Share via WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-2xl text-sm text-blue-700 border-blue-200 hover:bg-blue-50"
                    disabled={recipients.filter(r => r.email).length === 0}
                    onClick={() => recipients.filter(r => r.email).forEach(shareViaEmail)}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Share via Email
                  </Button>
                </div>

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full rounded-2xl border-primary/30 text-primary hover:bg-primary/5 mb-2"
                  disabled={!selectedDocId || selectedDocId === "demo"}
                  onClick={() => setShowLegalDialog(true)}
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Generate Official PDF (Single-Point Format)
                </Button>

                <Button
                  size="lg"
                  className="w-full rounded-2xl shadow-lg shadow-primary/20 text-base"
                  disabled={recipients.length === 0 || !selectedDocId}
                  onClick={handleShareAll}
                >
                  <Send className="mr-2 h-5 w-5" />
                  Share Securely with {recipients.length}{" "}
                  {recipients.length === 1 ? "Recipient" : "Recipients"}
                </Button>

                {recipients.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Add at least one recipient to share
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Legal Details Dialog Overlay */}
        <AnimatePresence>
          {showLegalDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-background border border-border rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="p-5 border-b border-border flex items-center justify-between bg-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Official PDF Details</h2>
                      <p className="text-xs text-muted-foreground">Fill in court & case details for the official template</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowLegalDialog(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Doc Type Selector */}
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Document Format</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "Primary Victim Statement", label: "Statement", icon: FileText },
                        { id: "Section 65B Certificate", label: "65B Cert", icon: Shield },
                        { id: "Exhibit List", label: "Exhibit List", icon: Users },
                      ].map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setDocType(type.id)}
                          className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                            docType === type.id 
                              ? "border-primary bg-primary/5 text-primary" 
                              : "border-border hover:border-primary/20"
                          }`}
                        >
                          <type.icon className="h-4 w-4" />
                          <span className="text-[11px] font-medium">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Court & Case Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
                      <Shield className="h-4 w-4" /> Court & Case Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Court Name</Label>
                        <Input 
                          placeholder="e.g. Session Court, Delhi" 
                          value={legalDetails.court_name}
                          onChange={(e) => setLegalDetails({...legalDetails, court_name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Case Title</Label>
                        <Input 
                          placeholder="e.g. State vs John Doe" 
                          value={legalDetails.case_title}
                          onChange={(e) => setLegalDetails({...legalDetails, case_title: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">FIR No. / Year</Label>
                        <div className="flex gap-2">
                          <Input 
                            className="flex-1" 
                            placeholder="FIR #" 
                            value={legalDetails.fir_no}
                            onChange={(e) => setLegalDetails({...legalDetails, fir_no: e.target.value})}
                          />
                          <Input 
                            className="w-24" 
                            placeholder="Year" 
                            value={legalDetails.fir_year}
                            onChange={(e) => setLegalDetails({...legalDetails, fir_year: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Police Station</Label>
                        <Input 
                          placeholder="Station Name" 
                          value={legalDetails.police_station}
                          onChange={(e) => setLegalDetails({...legalDetails, police_station: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Personal Details */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
                      <User className="h-4 w-4" /> Victim Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Age</Label>
                        <Input 
                          placeholder="Years" 
                          value={legalDetails.victim_age}
                          onChange={(e) => setLegalDetails({...legalDetails, victim_age: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs">Address</Label>
                        <Input 
                          placeholder="Full residential address" 
                          value={legalDetails.victim_address}
                          onChange={(e) => setLegalDetails({...legalDetails, victim_address: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Incident Context */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
                      <Clock className="h-4 w-4" /> Incident Context
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Date</Label>
                        <Input 
                          type="date" 
                          value={legalDetails.incident_date}
                          onChange={(e) => setLegalDetails({...legalDetails, incident_date: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Time</Label>
                        <Input 
                          type="time" 
                          value={legalDetails.incident_time}
                          onChange={(e) => setLegalDetails({...legalDetails, incident_time: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Location</Label>
                        <Input 
                          placeholder="Place of incident" 
                          value={legalDetails.incident_location}
                          onChange={(e) => setLegalDetails({...legalDetails, incident_location: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Impact */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
                      <AlertCircle className="h-4 w-4" /> Impact & Aftermath
                    </h3>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Physical Impact</Label>
                        <Input 
                          placeholder="Injuries, medical treatment, etc." 
                          value={legalDetails.physical_impact}
                          onChange={(e) => setLegalDetails({...legalDetails, physical_impact: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Emotional Impact</Label>
                        <Input 
                          placeholder="Trauma, distress, fear, etc." 
                          value={legalDetails.emotional_impact}
                          onChange={(e) => setLegalDetails({...legalDetails, emotional_impact: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 border-t border-border flex gap-3 bg-accent/20">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowLegalDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    className="flex-[2] rounded-xl" 
                    onClick={handleGeneratePDF}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <motion.div 
                          className="h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                        />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Generate & Download PDF
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sharing History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <Card className="p-5">
            <h3 className="font-semibold text-sm mb-4">Recent Sharing Activity</h3>
            {recipients.length > 0 ? (
              <div className="space-y-2">
                {recipients.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-accent/40 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full ${roleConfigs[r.roleId]?.bg ?? "bg-accent"} flex items-center justify-center`}>
                        <Shield className={`h-3.5 w-3.5 ${roleConfigs[r.roleId]?.color ?? "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{r.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Just now · {r.permissions.view ? "View" : ""}{r.permissions.download ? " + Download" : ""} only
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border-amber-200">
                      Pending
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                No sharing activity yet. Add recipients and share securely.
              </p>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
