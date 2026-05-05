import { Flower2, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border bg-card/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
                <Flower2 className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">PRAMAAN</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              A trauma-informed digital testimony platform for survivors seeking justice.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
            {[
              { title: "Platform", links: ["How It Works", "Features", "Security"] },
              { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Data Rights"] },
              { title: "Support", links: ["Help Center", "Contact Us", "Crisis Resources"] },
            ].map((col) => (
              <div key={col.title}>
                <p className="font-medium mb-3">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-muted-foreground hover:text-primary transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <p className="text-xs text-muted-foreground">© 2026 PRAMAAN. Made with care for survivors everywhere.</p>
            <p className="text-xs font-medium text-primary flex items-center gap-1">
              Developed By <span className="font-bold">PARAMPREET KAUR</span>
            </p>

          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
            <span>End-to-End Encrypted · Zero Knowledge</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
