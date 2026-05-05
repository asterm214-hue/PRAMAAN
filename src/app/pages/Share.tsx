import { useState } from "react";
import {
  Share2, Shield, CheckCircle2, Users, FileText, Eye,
  Download, Send, Plus, X, Clock, Lock, AlertCircle
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { motion, AnimatePresence } from "motion/react";

interface Recipient {
  id: string;
  name: string;
  role: string;
  roleId: string;
  email: string;
  permissions: {
    view: boolean;
    download: boolean;
  };
}

const roleConfigs: Record<string, { color: string; bg: string; border: string }> = {
  police: { color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  lawyer: { color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
  ngo: { color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
  other: { color: "text-muted-foreground", bg: "bg-accent", border: "border-border" },
};

export function Share() {
  const [selectedDocument, setSelectedDocument] = useState("primary-testimony");
  const [recipients, setRecipients] = useState<Recipient[]>([
    {
      id: "1",
      name: "Detective Sarah Williams",
      role: "Police Department",
      roleId: "police",
      email: "s.williams@police.gov",
      permissions: { view: true, download: false },
    },
  ]);
  const [newRecipientEmail, setNewRecipientEmail] = useState("");
  const [showAddRecipient, setShowAddRecipient] = useState(false);
  const [sharedSuccess, setSharedSuccess] = useState(false);

  const recipientCategories = [
    { id: "police", label: "Police", icon: Shield, description: "Law enforcement" },
    { id: "lawyer", label: "Lawyer", icon: FileText, description: "Legal counsel" },
    { id: "ngo", label: "NGO / Support", icon: Users, description: "Support organizations" },
  ];

  const documents = [
    { id: "primary-testimony", title: "Primary Testimony — March 2026", type: "Video", size: "245 MB" },
    { id: "follow-up", title: "Follow-up Statement", type: "Text", size: "12 KB" },
    { id: "timeline", title: "Complete Timeline PDF", type: "PDF", size: "2.4 MB" },
  ];

  const togglePermission = (recipientId: string, permission: "view" | "download") => {
    setRecipients(
      recipients.map((r) =>
        r.id === recipientId
          ? { ...r, permissions: { ...r.permissions, [permission]: !r.permissions[permission] } }
          : r
      )
    );
  };

  const removeRecipient = (recipientId: string) => {
    setRecipients(recipients.filter((r) => r.id !== recipientId));
  };

  const handleShare = () => {
    setSharedSuccess(true);
    setTimeout(() => setSharedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen p-5 lg:p-8 pb-24 lg:pb-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-5"
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

        {/* Step 1: Select Document */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-5"
        >
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">1</div>
              <h3 className="font-semibold text-sm">Choose Document to Share</h3>
            </div>
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocument(doc.id)}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedDocument === doc.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30 hover:bg-accent/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                        selectedDocument === doc.id ? "bg-primary/15" : "bg-accent"
                      }`}>
                        <FileText className={`h-4 w-4 ${selectedDocument === doc.id ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">{doc.type} · {doc.size}</p>
                      </div>
                    </div>
                    {selectedDocument === doc.id && (
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Step 2: Add Recipients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-5"
        >
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">2</div>
              <h3 className="font-semibold text-sm">Add Recipients</h3>
            </div>

            {/* Quick Add */}
            <p className="text-xs text-muted-foreground mb-3">Quick add by role:</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {recipientCategories.map((category) => {
                const Icon = category.icon;
                const config = roleConfigs[category.id];
                return (
                  <button
                    key={category.id}
                    className={`p-3 rounded-xl border-2 transition-all hover:border-primary/50 ${config.bg} ${config.border}`}
                  >
                    <Icon className={`h-5 w-5 mx-auto mb-1.5 ${config.color}`} />
                    <p className={`text-xs font-medium ${config.color}`}>{category.label}</p>
                    <p className="text-[10px] text-muted-foreground">{category.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Custom Add */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground">Or add by email:</p>
              <button
                onClick={() => setShowAddRecipient(!showAddRecipient)}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add custom
              </button>
            </div>

            <AnimatePresence>
              {showAddRecipient && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="flex gap-2 p-3 bg-accent/40 rounded-xl">
                    <Input
                      type="email"
                      placeholder="recipient@example.com"
                      value={newRecipientEmail}
                      onChange={(e) => setNewRecipientEmail(e.target.value)}
                      className="rounded-xl h-9 text-sm bg-card"
                    />
                    <Button className="rounded-xl h-9 text-sm px-4">Add</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recipients List */}
            {recipients.length > 0 && (
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
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-2 py-0.5 rounded-full ${config.bg} ${config.color} ${config.border}`}
                              >
                                {recipient.role}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{recipient.email}</span>
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

                      <div className="grid grid-cols-2 gap-2">
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
                    </div>
                  );
                })}
              </div>
            )}

            {recipients.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No recipients added yet</p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Share Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-5"
        >
          <AnimatePresence mode="wait">
            {sharedSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
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
              <motion.div key="button">
                <Button
                  size="lg"
                  className="w-full rounded-2xl shadow-lg shadow-primary/20 text-base"
                  disabled={recipients.length === 0}
                  onClick={handleShare}
                >
                  <Send className="mr-2 h-5 w-5" />
                  Share Securely with {recipients.length}{" "}
                  {recipients.length === 1 ? "Recipient" : "Recipients"}
                </Button>
                {recipients.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Add at least one recipient to share
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Sharing History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <Card className="p-5">
            <h3 className="font-semibold text-sm mb-4">Sharing History</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-accent/40 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Shield className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Shared with Detective S. Williams</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      March 18, 2026 · View only
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border-green-200">
                  Active
                </Badge>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
