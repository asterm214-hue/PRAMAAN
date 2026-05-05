import { motion, AnimatePresence } from "motion/react";
import { Brain, CheckCircle2, Clock, FileText, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router";

interface AIProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  { icon: Brain, label: "Analyzing your testimony", duration: 1500 },
  { icon: Clock, label: "Building chronological timeline", duration: 2500 },
  { icon: FileText, label: "Identifying key facts & evidence", duration: 3500 },
  { icon: Sparkles, label: "Preparing your secure vault entry", duration: 4500 },
];

export function AIProcessingModal({ isOpen, onClose }: AIProcessingModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-md text-center"
          >
            {/* Animated Orb */}
            <div className="relative mx-auto mb-8 h-28 w-28">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-primary/40"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.6,
                  }}
                />
              ))}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Brain className="h-10 w-10 text-primary" />
                </motion.div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mb-2">AI is Organizing Your Testimony</h2>
            <p className="text-muted-foreground mb-8">
              Take a breath. We're carefully structuring your testimony into a clear, chronological timeline.
            </p>

            {/* Steps */}
            <div className="space-y-3 text-left mb-8">
              {steps.map((step, index) => (
                <AIStep
                  key={step.label}
                  icon={step.icon}
                  label={step.label}
                  delay={step.duration}
                  index={index}
                />
              ))}
            </div>

            {/* Done Button (appears after all steps) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 5.5 }}
            >
              <Link to="/app/timeline" onClick={onClose}>
                <Button size="lg" className="w-full rounded-2xl">
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  View Your Timeline
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-3">
                Your testimony is securely saved in your vault.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AIStep({
  icon: Icon,
  label,
  delay,
  index,
}: {
  icon: React.ElementType;
  label: string;
  delay: number;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0.3 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay / 1000 - 0.5, duration: 0.4 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-accent/40"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: delay / 1000 - 0.5, type: "spring" }}
        className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0"
      >
        <Icon className="h-4 w-4 text-primary" />
      </motion.div>
      <span className="text-sm text-foreground">{label}</span>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay / 1000, type: "spring", stiffness: 400 }}
        className="ml-auto"
      >
        <CheckCircle2 className="h-4 w-4 text-primary" />
      </motion.div>
    </motion.div>
  );
}
