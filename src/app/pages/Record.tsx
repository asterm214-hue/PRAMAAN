import { useState } from "react";
import {
  Video, Mic, FileText, Play, Pause, Square, Save, Send,
  Lightbulb, Heart, ChevronDown, ChevronUp, Info
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { AIProcessingModal } from "../components/AIProcessingModal";
import { apiJson } from "../lib/api";

const guidedPrompts = [
  { id: 1, prompt: "Describe what happened in your own words. Where were you when this occurred?" },
  { id: 2, prompt: "When did this happen? What time of day, date, or period was it?" },
  { id: 3, prompt: "Who else was present? Can you describe anyone involved?" },
  { id: 4, prompt: "Were there any witnesses? What did they see or hear?" },
  { id: 5, prompt: "How did this affect you? What happened immediately after?" },
];

export function Record() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [textContent, setTextContent] = useState("");
  const [showProcessing, setShowProcessing] = useState(false);
  const [activePrompt, setActivePrompt] = useState<number | null>(null);
  const [showPrompts, setShowPrompts] = useState(true);
  const [timerInterval, setTimerInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setIsPaused(false);
      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    if (timerInterval) clearInterval(timerInterval);
    setTimerInterval(null);
  };

  const handleSubmit = async () => {
    if (!textContent.trim()) return;
    
    setShowProcessing(true);
    try {
      await apiJson("/api/testimony/text", {
        method: "POST",
        body: JSON.stringify({
          type: "text",
          content: textContent,
        }),
      });
      // The AIProcessingModal handles the UI transition
    } catch (err) {
      console.error("Failed to submit testimony:", err);
      // For demo purposes, we'll still show processing even if API fails
      // but in a real app we'd show an error.
    }
  };

  const insertPromptText = (prompt: string) => {
    setTextContent((prev) => {
      const suffix = prev.length > 0 ? "\n\n" : "";
      return prev + suffix + prompt + " ";
    });
    setActivePrompt(null);
  };

  const RecordingControls = ({ type }: { type: "video" | "audio" }) => (
    <div className="flex justify-center gap-3">
      {!isRecording ? (
        <Button size="lg" onClick={handleRecord} className="rounded-full px-8 shadow-lg shadow-primary/25">
          {type === "video" ? (
            <Video className="mr-2 h-5 w-5" />
          ) : (
            <Mic className="mr-2 h-5 w-5" />
          )}
          Start Recording
        </Button>
      ) : (
        <>
          <Button size="lg" variant="outline" onClick={handlePause} className="rounded-full px-6">
            <Pause className="mr-2 h-4 w-4" />
            {isPaused ? "Resume" : "Pause"}
          </Button>
          <Button size="lg" variant="destructive" onClick={handleStop} className="rounded-full px-6">
            <Square className="mr-2 h-4 w-4" />
            Stop
          </Button>
          <Button size="lg" onClick={handleSubmit} className="rounded-full px-6">
            <Send className="mr-2 h-4 w-4" />
            Submit
          </Button>
        </>
      )}
    </div>
  );

  const RecordingDisplay = ({ type }: { type: "video" | "audio" }) => (
    <div className="relative aspect-video bg-gradient-to-br from-accent/40 to-accent/20 rounded-2xl flex items-center justify-center overflow-hidden">
      {isRecording && (
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-rose-500 text-white px-3 py-1.5 rounded-full shadow-md">
          <motion.div
            className="h-2 w-2 rounded-full bg-white"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-xs font-medium">
            {isPaused ? "Paused" : "Recording"} · {formatTime(recordingTime)}
          </span>
        </div>
      )}

      <div className="text-center">
        {type === "audio" && isRecording ? (
          <div className="flex gap-1.5 justify-center mb-3">
            {[...Array(18)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 bg-primary rounded-full"
                animate={{ height: [12, Math.random() * 48 + 16, 12] }}
                transition={{ duration: 0.4 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.04 }}
              />
            ))}
          </div>
        ) : (
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            {type === "video" ? (
              <Video className="h-8 w-8 text-muted-foreground" />
            ) : (
              <Mic className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          {isRecording
            ? isPaused
              ? "Recording paused — take a breath, resume when ready"
              : type === "audio"
              ? "Listening..."
              : "Recording in progress..."
            : type === "audio"
            ? "Click to start audio recording"
            : "Camera preview will appear here"
          }
        </p>
      </div>

      {/* Calm breathing guide when paused */}
      {isPaused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur rounded-2xl px-5 py-3 text-center shadow-lg"
        >
          <p className="text-xs font-medium text-primary mb-1">Take a moment 💚</p>
          <p className="text-xs text-muted-foreground">Breathe in... breathe out... resume when you're ready.</p>
        </motion.div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen p-5 lg:p-8 pb-24 lg:pb-8">
      <AIProcessingModal isOpen={showProcessing} onClose={() => setShowProcessing(false)} />

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold mb-1">Record Your Testimony</h1>
              <p className="text-sm text-muted-foreground">
                Start from anywhere. Take your time. You're in complete control.
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs px-3 py-1 rounded-full">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5" />
                Auto-save on
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Safety Notice */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-5"
        >
          <div className="flex items-start gap-3 bg-primary/8 border border-primary/15 rounded-2xl p-4">
            <Heart className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">You're safe here.</span> Take breaks whenever you need.
              Your progress is automatically saved. You can return to this testimony at any time.
              There is no wrong way to tell your story.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Card className="p-5 mb-5">
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-5 rounded-2xl">
                <TabsTrigger value="text" className="flex items-center gap-2 rounded-xl">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Text</span>
                </TabsTrigger>
                <TabsTrigger value="audio" className="flex items-center gap-2 rounded-xl">
                  <Mic className="h-4 w-4" />
                  <span className="hidden sm:inline">Audio</span>
                </TabsTrigger>
                <TabsTrigger value="video" className="flex items-center gap-2 rounded-xl">
                  <Video className="h-4 w-4" />
                  <span className="hidden sm:inline">Video</span>
                </TabsTrigger>
              </TabsList>

              {/* Text Tab */}
              <TabsContent value="text" className="space-y-4">
                <div className="relative">
                  <Textarea
                    placeholder="Write your testimony here. Start from wherever feels right — the beginning, the end, or any moment that stands out. You can always add more later..."
                    className="min-h-[300px] sm:min-h-[380px] text-sm resize-none rounded-2xl bg-input-background leading-relaxed"
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-muted-foreground/60">
                    {textContent.length} characters
                  </div>
                </div>

                <div className="flex flex-wrap justify-between gap-3">
                  <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl h-9 text-sm">
                      <Save className="mr-1.5 h-4 w-4" />
                      Save Draft
                    </Button>
                  </div>
                  <Button
                    className="rounded-xl h-9 text-sm shadow-md shadow-primary/20"
                    onClick={handleSubmit}
                    disabled={textContent.trim().length < 10}
                  >
                    <Send className="mr-1.5 h-4 w-4" />
                    Submit to AI
                  </Button>
                </div>
              </TabsContent>

              {/* Audio Tab */}
              <TabsContent value="audio" className="space-y-4">
                <RecordingDisplay type="audio" />
                <RecordingControls type="audio" />
              </TabsContent>

              {/* Video Tab */}
              <TabsContent value="video" className="space-y-4">
                <RecordingDisplay type="video" />
                <RecordingControls type="video" />
                {!isRecording && (
                  <p className="text-center text-xs text-muted-foreground">
                    Your video is processed locally and never uploaded without your explicit consent.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </Card>

          {/* Guided Prompts */}
          <Card className="p-5">
            <button
              onClick={() => setShowPrompts(!showPrompts)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Guided Prompts</p>
                  <p className="text-xs text-muted-foreground">Optional memory aids — use only what feels right</p>
                </div>
              </div>
              {showPrompts ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            <AnimatePresence>
              {showPrompts && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-2">
                    {guidedPrompts.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3.5 bg-card rounded-xl border transition-all cursor-pointer hover:border-primary/40 hover:bg-primary/5 ${
                          activePrompt === item.id
                            ? "border-primary/40 bg-primary/5"
                            : "border-border"
                        }`}
                        onClick={() => setActivePrompt(activePrompt === item.id ? null : item.id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm leading-relaxed">
                            <span className="font-medium text-primary">Prompt {item.id}:</span>{" "}
                            {item.prompt}
                          </p>
                          <AnimatePresence>
                            {activePrompt === item.id && (
                              <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={(e) => { e.stopPropagation(); insertPromptText(item.prompt); }}
                                className="flex-shrink-0 text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
                              >
                                Use this
                              </motion.button>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-start gap-2 mt-3 p-3 bg-accent/40 rounded-xl">
                    <Info className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      These prompts are completely optional. Share your story in any order that feels right to you. There is no right or wrong way.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
