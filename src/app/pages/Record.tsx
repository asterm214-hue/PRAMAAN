import { useState, useRef, useEffect, useCallback } from "react";
import {
  Video, Mic, FileText, Pause, Square, Save, Send,
  Lightbulb, Heart, ChevronDown, ChevronUp, Info,
  AlertTriangle, Play, Download
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { AIProcessingModal } from "../components/AIProcessingModal";
import { apiJson, apiForm } from "../lib/api";

const guidedPrompts = [
  { id: 1, prompt: "Describe what happened in your own words. Where were you when this occurred?" },
  { id: 2, prompt: "When did this happen? What time of day, date, or period was it?" },
  { id: 3, prompt: "Who else was present? Can you describe anyone involved?" },
  { id: 4, prompt: "Were there any witnesses? What did they see or hear?" },
  { id: 5, prompt: "How did this affect you? What happened immediately after?" },
];

type RecordState = "idle" | "requesting" | "recording" | "paused" | "stopped" | "error";

export function Record() {
  const [textContent, setTextContent] = useState("");
  const [showProcessing, setShowProcessing] = useState(false);
  const [activePrompt, setActivePrompt] = useState<number | null>(null);
  const [showPrompts, setShowPrompts] = useState(true);

  // --- Audio state ---
  const [audioState, setAudioState] = useState<RecordState>("idle");
  const [audioTime, setAudioTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioError, setAudioError] = useState("");
  const audioRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [bars, setBars] = useState<number[]>(Array(20).fill(4));

  // --- Video state ---
  const [videoState, setVideoState] = useState<RecordState>("idle");
  const [videoTime, setVideoTime] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoError, setVideoError] = useState("");
  const videoRecRef = useRef<MediaRecorder | null>(null);
  const videoChunks = useRef<Blob[]>([]);
  const videoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // Waveform animation
  useEffect(() => {
    if (audioState !== "recording") { setBars(Array(20).fill(4)); return; }
    const id = setInterval(() => {
      if (analyserRef.current) {
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const slice = Math.floor(data.length / 20);
        setBars(Array.from({ length: 20 }, (_, i) => Math.max(4, (data[i * slice] / 255) * 60)));
      } else {
        setBars(Array.from({ length: 20 }, () => Math.random() * 56 + 4));
      }
    }, 80);
    return () => clearInterval(id);
  }, [audioState]);

  // Cleanup on unmount
  useEffect(() => () => {
    audioTimer.current && clearInterval(audioTimer.current);
    videoTimer.current && clearInterval(videoTimer.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close();
  }, []);

  // ── AUDIO ──────────────────────────────────────────────
  const startAudio = async () => {
    setAudioError(""); setAudioState("requesting"); setAudioBlob(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Waveform
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      const mr = new MediaRecorder(stream);
      audioRef.current = mr;
      audioChunks.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) audioChunks.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach(t => t.stop());
        ctx.close();
      };
      mr.start(100);
      setAudioState("recording");
      audioTimer.current = setInterval(() => setAudioTime(p => p + 1), 1000);
    } catch {
      setAudioError("Microphone access denied. Please allow microphone permission and try again.");
      setAudioState("error");
    }
  };

  const pauseAudio = () => {
    if (!audioRef.current) return;
    if (audioState === "recording") {
      audioRef.current.pause();
      audioTimer.current && clearInterval(audioTimer.current);
      setAudioState("paused");
    } else {
      audioRef.current.resume();
      audioTimer.current = setInterval(() => setAudioTime(p => p + 1), 1000);
      setAudioState("recording");
    }
  };

  const stopAudio = () => {
    audioRef.current?.stop();
    audioTimer.current && clearInterval(audioTimer.current);
    setAudioState("stopped");
  };

  const resetAudio = () => { setAudioState("idle"); setAudioTime(0); setAudioBlob(null); setAudioError(""); };

  const submitAudio = async () => {
    if (!audioBlob) return;
    setShowProcessing(true);
    try {
      const fd = new FormData();
      fd.append("file", audioBlob, "testimony-audio.webm");
      await apiForm("/api/testimony/audio", fd);
    } catch (e) {
      console.error(e);
    }
  };

  // ── VIDEO ──────────────────────────────────────────────
  const startVideo = async () => {
    setVideoError(""); setVideoState("requesting"); setVideoBlob(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        liveVideoRef.current.play().catch(() => {});
      }
      const mr = new MediaRecorder(stream);
      videoRecRef.current = mr;
      videoChunks.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) videoChunks.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(videoChunks.current, { type: "video/webm" });
        setVideoBlob(blob);
        stream.getTracks().forEach(t => t.stop());
        if (liveVideoRef.current) liveVideoRef.current.srcObject = null;
      };
      mr.start(100);
      setVideoState("recording");
      videoTimer.current = setInterval(() => setVideoTime(p => p + 1), 1000);
    } catch {
      setVideoError("Camera access denied. Please allow camera/microphone permission and try again.");
      setVideoState("error");
    }
  };

  // Attach blob to preview video when available
  useEffect(() => {
    if (videoBlob && previewVideoRef.current) {
      previewVideoRef.current.src = URL.createObjectURL(videoBlob);
    }
  }, [videoBlob]);

  const pauseVideo = () => {
    if (!videoRecRef.current) return;
    if (videoState === "recording") {
      videoRecRef.current.pause();
      videoTimer.current && clearInterval(videoTimer.current);
      setVideoState("paused");
    } else {
      videoRecRef.current.resume();
      videoTimer.current = setInterval(() => setVideoTime(p => p + 1), 1000);
      setVideoState("recording");
    }
  };

  const stopVideo = () => {
    videoRecRef.current?.stop();
    videoTimer.current && clearInterval(videoTimer.current);
    setVideoState("stopped");
  };

  const resetVideo = () => { setVideoState("idle"); setVideoTime(0); setVideoBlob(null); setVideoError(""); };

  const submitVideo = async () => {
    if (!videoBlob) return;
    setShowProcessing(true);
    try {
      const fd = new FormData();
      fd.append("file", videoBlob, "testimony-video.webm");
      await apiForm("/api/testimony/video", fd);
    } catch (e) {
      console.error(e);
    }
  };

  // ── TEXT ──────────────────────────────────────────────
  const handleSubmitText = async () => {
    if (!textContent.trim()) return;
    setShowProcessing(true);
    try {
      await apiJson("/api/testimony/text", {
        method: "POST",
        body: JSON.stringify({ type: "text", content: textContent }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const insertPromptText = (prompt: string) => {
    setTextContent(prev => (prev.length > 0 ? prev + "\n\n" : "") + prompt + " ");
    setActivePrompt(null);
  };

  // ── UI HELPERS ─────────────────────────────────────────
  const StatusBadge = ({ state, time }: { state: RecordState; time: number }) => {
    if (state !== "recording" && state !== "paused") return null;
    return (
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-rose-500 text-white px-3 py-1.5 rounded-full shadow-md z-10">
        <motion.div className="h-2 w-2 rounded-full bg-white"
          animate={{ opacity: state === "paused" ? 1 : [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }} />
        <span className="text-xs font-medium">{state === "paused" ? "Paused" : "Recording"} · {fmt(time)}</span>
      </div>
    );
  };

  const ErrorBox = ({ msg, onRetry }: { msg: string; onRetry: () => void }) => (
    <div className="flex flex-col items-center gap-3 p-6 text-center">
      <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center">
        <AlertTriangle className="h-6 w-6 text-rose-500" />
      </div>
      <p className="text-sm text-muted-foreground">{msg}</p>
      <Button size="sm" variant="outline" className="rounded-xl" onClick={onRetry}>Try Again</Button>
    </div>
  );

  return (
    <div className="min-h-screen p-5 lg:p-8 pb-24 lg:pb-8">
      <AIProcessingModal isOpen={showProcessing} onClose={() => setShowProcessing(false)} />

      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold mb-1">Record Your Testimony</h1>
              <p className="text-sm text-muted-foreground">Start from anywhere. Take your time. You're in complete control.</p>
            </div>
            <Badge variant="outline" className="text-xs px-3 py-1 rounded-full">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5" />
              Auto-save on
            </Badge>
          </div>
        </motion.div>

        {/* Safety Notice */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="mb-5">
          <div className="flex items-start gap-3 bg-primary/8 border border-primary/15 rounded-2xl p-4">
            <Heart className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">You're safe here.</span> Take breaks whenever you need.
              Your progress is automatically saved. You can return to this testimony at any time.
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <Card className="p-5 mb-5">
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-5 rounded-2xl">
                <TabsTrigger value="text" className="flex items-center gap-2 rounded-xl"><FileText className="h-4 w-4" /><span className="hidden sm:inline">Text</span></TabsTrigger>
                <TabsTrigger value="audio" className="flex items-center gap-2 rounded-xl"><Mic className="h-4 w-4" /><span className="hidden sm:inline">Audio</span></TabsTrigger>
                <TabsTrigger value="video" className="flex items-center gap-2 rounded-xl"><Video className="h-4 w-4" /><span className="hidden sm:inline">Video</span></TabsTrigger>
              </TabsList>

              {/* ── TEXT TAB ── */}
              <TabsContent value="text" className="space-y-4">
                <div className="relative">
                  <Textarea
                    placeholder="Write your testimony here. Start from wherever feels right — the beginning, the end, or any moment that stands out..."
                    className="min-h-[300px] sm:min-h-[380px] text-sm resize-none rounded-2xl bg-input-background leading-relaxed"
                    value={textContent}
                    onChange={e => setTextContent(e.target.value)}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-muted-foreground/60">{textContent.length} characters</div>
                </div>
                <div className="flex flex-wrap justify-between gap-3">
                  <Button variant="outline" className="rounded-xl h-9 text-sm"><Save className="mr-1.5 h-4 w-4" />Save Draft</Button>
                  <Button className="rounded-xl h-9 text-sm shadow-md shadow-primary/20" onClick={handleSubmitText} disabled={textContent.trim().length < 10}>
                    <Send className="mr-1.5 h-4 w-4" />Submit to AI
                  </Button>
                </div>
              </TabsContent>

              {/* ── AUDIO TAB ── */}
              <TabsContent value="audio" className="space-y-4">
                {/* Display area */}
                <div className="relative aspect-video bg-gradient-to-br from-accent/40 to-accent/20 rounded-2xl flex items-center justify-center overflow-hidden">
                  <StatusBadge state={audioState} time={audioTime} />

                  {audioState === "error" ? (
                    <ErrorBox msg={audioError} onRetry={resetAudio} />
                  ) : audioState === "stopped" && audioBlob ? (
                    <div className="flex flex-col items-center gap-4 p-6 w-full">
                      <p className="text-sm font-medium text-foreground">Recording complete — {fmt(audioTime)}</p>
                      <audio controls src={URL.createObjectURL(audioBlob)} className="w-full max-w-md rounded-xl" />
                    </div>
                  ) : audioState === "recording" ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex gap-1.5 items-end justify-center h-16">
                        {bars.map((h, i) => (
                          <motion.div key={i} className="w-1.5 bg-primary rounded-full" animate={{ height: h }} transition={{ duration: 0.08 }} />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">Listening...</p>
                    </div>
                  ) : audioState === "paused" ? (
                    <div className="text-center">
                      <motion.div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3"
                        animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                        <Pause className="h-8 w-8 text-amber-600" />
                      </motion.div>
                      <p className="text-sm text-muted-foreground">Paused — take a breath 💚</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <Mic className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">Click to start audio recording</p>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-3 flex-wrap">
                  {audioState === "idle" || audioState === "error" ? (
                    <Button size="lg" onClick={startAudio} className="rounded-full px-8 shadow-lg shadow-primary/25">
                      <Mic className="mr-2 h-5 w-5" />Start Recording
                    </Button>
                  ) : audioState === "requesting" ? (
                    <Button size="lg" disabled className="rounded-full px-8">
                      <motion.div className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} />
                      Requesting access...
                    </Button>
                  ) : audioState === "stopped" ? (
                    <>
                      <Button size="lg" variant="outline" onClick={resetAudio} className="rounded-full px-6">Record Again</Button>
                      <Button size="lg" onClick={submitAudio} className="rounded-full px-6"><Send className="mr-2 h-4 w-4" />Submit</Button>
                      <a href={audioBlob ? URL.createObjectURL(audioBlob) : "#"} download="testimony-audio.webm">
                        <Button size="lg" variant="outline" className="rounded-full px-6"><Download className="mr-2 h-4 w-4" />Save</Button>
                      </a>
                    </>
                  ) : (
                    <>
                      <Button size="lg" variant="outline" onClick={pauseAudio} className="rounded-full px-6">
                        {audioState === "paused" ? <><Play className="mr-2 h-4 w-4" />Resume</> : <><Pause className="mr-2 h-4 w-4" />Pause</>}
                      </Button>
                      <Button size="lg" variant="destructive" onClick={stopAudio} className="rounded-full px-6">
                        <Square className="mr-2 h-4 w-4" />Stop
                      </Button>
                    </>
                  )}
                </div>
              </TabsContent>

              {/* ── VIDEO TAB ── */}
              <TabsContent value="video" className="space-y-4">
                {/* Display area */}
                <div className="relative aspect-video bg-gradient-to-br from-accent/40 to-accent/20 rounded-2xl flex items-center justify-center overflow-hidden">
                  <StatusBadge state={videoState} time={videoTime} />

                  {/* Live preview (always rendered but hidden when not in use) */}
                  <video
                    ref={liveVideoRef}
                    muted
                    playsInline
                    className={`absolute inset-0 w-full h-full object-cover rounded-2xl ${(videoState === "recording" || videoState === "paused") ? "block" : "hidden"}`}
                  />

                  {videoState === "error" ? (
                    <ErrorBox msg={videoError} onRetry={resetVideo} />
                  ) : videoState === "stopped" && videoBlob ? (
                    <video
                      ref={previewVideoRef}
                      controls
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                    />
                  ) : videoState === "idle" ? (
                    <div className="text-center z-10">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <Video className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">Camera preview will appear here</p>
                    </div>
                  ) : videoState === "requesting" ? (
                    <div className="text-center z-10">
                      <motion.div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent mx-auto mb-3"
                        animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
                      <p className="text-sm text-muted-foreground">Requesting camera access...</p>
                    </div>
                  ) : null}

                  {videoState === "paused" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur rounded-2xl px-5 py-3 text-center shadow-lg z-10">
                      <p className="text-xs font-medium text-primary mb-1">Take a moment 💚</p>
                      <p className="text-xs text-muted-foreground">Breathe in... breathe out... resume when you're ready.</p>
                    </motion.div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-3 flex-wrap">
                  {videoState === "idle" || videoState === "error" ? (
                    <Button size="lg" onClick={startVideo} className="rounded-full px-8 shadow-lg shadow-primary/25">
                      <Video className="mr-2 h-5 w-5" />Start Recording
                    </Button>
                  ) : videoState === "requesting" ? (
                    <Button size="lg" disabled className="rounded-full px-8">
                      <motion.div className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} />
                      Requesting access...
                    </Button>
                  ) : videoState === "stopped" ? (
                    <>
                      <Button size="lg" variant="outline" onClick={resetVideo} className="rounded-full px-6">Record Again</Button>
                      <Button size="lg" onClick={submitVideo} className="rounded-full px-6"><Send className="mr-2 h-4 w-4" />Submit</Button>
                      <a href={videoBlob ? URL.createObjectURL(videoBlob) : "#"} download="testimony-video.webm">
                        <Button size="lg" variant="outline" className="rounded-full px-6"><Download className="mr-2 h-4 w-4" />Save</Button>
                      </a>
                    </>
                  ) : (
                    <>
                      <Button size="lg" variant="outline" onClick={pauseVideo} className="rounded-full px-6">
                        {videoState === "paused" ? <><Play className="mr-2 h-4 w-4" />Resume</> : <><Pause className="mr-2 h-4 w-4" />Pause</>}
                      </Button>
                      <Button size="lg" variant="destructive" onClick={stopVideo} className="rounded-full px-6">
                        <Square className="mr-2 h-4 w-4" />Stop
                      </Button>
                    </>
                  )}
                </div>

                {videoState === "idle" && (
                  <p className="text-center text-xs text-muted-foreground">
                    Your video is processed locally and never uploaded without your explicit consent.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </Card>

          {/* Guided Prompts */}
          <Card className="p-5">
            <button onClick={() => setShowPrompts(!showPrompts)} className="flex items-center justify-between w-full text-left">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Guided Prompts</p>
                  <p className="text-xs text-muted-foreground">Optional memory aids — use only what feels right</p>
                </div>
              </div>
              {showPrompts ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>

            <AnimatePresence>
              {showPrompts && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="mt-4 space-y-2">
                    {guidedPrompts.map(item => (
                      <div key={item.id}
                        className={`p-3.5 bg-card rounded-xl border transition-all cursor-pointer hover:border-primary/40 hover:bg-primary/5 ${activePrompt === item.id ? "border-primary/40 bg-primary/5" : "border-border"}`}
                        onClick={() => setActivePrompt(activePrompt === item.id ? null : item.id)}>
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm leading-relaxed"><span className="font-medium text-primary">Prompt {item.id}:</span> {item.prompt}</p>
                          <AnimatePresence>
                            {activePrompt === item.id && (
                              <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                onClick={e => { e.stopPropagation(); insertPromptText(item.prompt); }}
                                className="flex-shrink-0 text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors">
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
                      These prompts are completely optional. Share your story in any order that feels right to you.
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
