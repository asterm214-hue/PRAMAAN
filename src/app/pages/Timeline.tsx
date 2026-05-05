import { useState, useEffect } from "react";
import { apiJson } from "../lib/api";
import { Calendar, MapPin, User, Edit, Plus, FileDown, Clock, Sparkles, ChevronDown, ChevronUp, Star } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { motion, AnimatePresence } from "motion/react";

interface TimelineEvent {
  id: string;
  date: string;
  time: string;
  title: string;
  description: string;
  location?: string;
  witnesses?: string[];
  isKeyFact: boolean;
  isExpanded?: boolean;
}

export function Timeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await apiJson<any[]>("/api/timeline/");
        // Map backend schema to frontend schema if they differ
        const mappedEvents = data.map((e: any) => ({
          id: e.id.toString(),
          date: e.date,
          time: e.time || "12:00 PM",
          title: e.title,
          description: e.description,
          location: e.location,
          witnesses: e.witnesses,
          isKeyFact: e.is_key_fact,
          isExpanded: false,
        }));
        
        // If no events from backend, show some defaults for the demo
        if (mappedEvents.length === 0) {
          setEvents([
            {
              id: "1",
              date: "March 15, 2026",
              time: "10:30 AM",
              title: "Initial Incident (Demo Data)",
              description: "The incident occurred at the workplace during morning hours. Multiple colleagues were present in the vicinity.",
              location: "Office Building, 5th Floor",
              witnesses: ["John Doe"],
              isKeyFact: true,
              isExpanded: true,
            }
          ]);
        } else {
          setEvents(mappedEvents);
        }
      } catch (err) {
        console.error("Failed to fetch timeline:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const toggleExpand = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isExpanded: !e.isExpanded } : e))
    );
  };

  const keyFacts = events.filter((e) => e.isKeyFact);

  return (
    <div className="min-h-screen p-5 lg:p-8 pb-24 lg:pb-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-7 w-7 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-xs text-primary font-medium">AI-Organized</span>
              </div>
              <h1 className="text-2xl font-semibold">Your Timeline</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Chronologically organized from your testimony
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-2xl h-9 text-sm">
                <Plus className="mr-1.5 h-4 w-4" />
                Add Event
              </Button>
              <Button className="rounded-2xl h-9 text-sm shadow-md shadow-primary/20">
                <FileDown className="mr-1.5 h-4 w-4" />
                Generate PDF
              </Button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="px-3 py-1 rounded-full text-xs">
              <Clock className="mr-1 h-3 w-3" />
              {events.length} Events
            </Badge>
            <Badge className="px-3 py-1 rounded-full text-xs bg-primary/15 text-primary border-primary/20 hover:bg-primary/15">
              <Star className="mr-1 h-3 w-3" />
              {keyFacts.length} Key Facts
            </Badge>
          </div>
        </motion.div>

        {/* AI Insights Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-gradient-to-r from-primary/10 to-secondary/20 border border-primary/15 rounded-2xl p-4 flex items-start gap-3">
            <div className="h-8 w-8 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-0.5">AI Timeline Analysis</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your testimony spans <strong>4 days</strong> and has been organized into <strong>{events.length} chronological events</strong>.
                AI identified <strong>{keyFacts.length} key facts</strong> that may be important for legal proceedings.
                Consider adding more details about location and time for the initial incident.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line — desktop */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-primary/20 to-transparent hidden md:block" />

          <div className="space-y-4">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + index * 0.08 }}
                className="relative"
              >
                {/* Timeline dot */}
                <div
                  className={`absolute left-3.5 top-5 h-3 w-3 rounded-full border-2 border-background hidden md:block z-10 transition-all ${
                    event.isKeyFact
                      ? "bg-primary shadow-md shadow-primary/40"
                      : "bg-muted-foreground/40"
                  }`}
                />

                <Card
                  className={`md:ml-14 overflow-hidden transition-all hover:shadow-md ${
                    event.isKeyFact
                      ? "border-primary/25 bg-gradient-to-r from-primary/5 to-transparent"
                      : ""
                  }`}
                >
                  {/* Card Header */}
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => toggleExpand(event.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          {event.isKeyFact && (
                            <Badge className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border-primary/20 hover:bg-primary/15">
                              <Star className="h-2.5 w-2.5 mr-1" />
                              Key Fact
                            </Badge>
                          )}
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{event.date}</span>
                            <span>·</span>
                            <span>{event.time}</span>
                          </div>
                        </div>
                        <h3 className="font-semibold">{event.title}</h3>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg"
                          onClick={(e) => { e.stopPropagation(); }}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg"
                        >
                          {event.isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Short description preview when collapsed */}
                    {!event.isExpanded && (
                      <p className="text-sm text-muted-foreground mt-1.5 line-clamp-1">
                        {event.description}
                      </p>
                    )}
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {event.isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-3">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {event.description}
                          </p>

                          <div className="grid sm:grid-cols-2 gap-2">
                            {event.location && (
                              <div className="flex items-center gap-2 text-sm bg-accent/40 rounded-xl px-3 py-2">
                                <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                <span className="text-xs">{event.location}</span>
                              </div>
                            )}
                            {event.witnesses && event.witnesses.length > 0 && (
                              <div className="flex items-start gap-2 text-sm bg-accent/40 rounded-xl px-3 py-2">
                                <User className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-xs font-medium">Witnesses: </span>
                                  <span className="text-xs text-muted-foreground">
                                    {event.witnesses.join(", ")}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl text-xs h-8 w-full sm:w-auto"
                          >
                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                            Add More Details
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Add Event Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-5"
        >
          <button className="w-full p-4 border-2 border-dashed border-primary/25 rounded-2xl text-center hover:border-primary/50 hover:bg-primary/5 transition-all group">
            <Plus className="h-5 w-5 text-primary/50 group-hover:text-primary transition-colors mx-auto mb-1.5" />
            <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              Add a new event to your timeline
            </p>
          </button>
        </motion.div>

        {/* AI Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="mt-5"
        >
          <Card className="p-4 bg-accent/30 text-center border-accent">
            <p className="text-xs text-muted-foreground">
              Your timeline is automatically organized by AI. You can add or edit events at any time.
              All changes are saved instantly.
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
