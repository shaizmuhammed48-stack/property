import { MessageCircle } from "lucide-react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { WHATSAPP_NUMBER } from "@/lib/constants";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          "Hello Kerala Estates, I would like a private consultation."
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with the Kerala Estates concierge on WhatsApp"
        className="fixed bottom-6 right-5 z-30 hidden h-12 w-12 items-center justify-center rounded-full bg-primary-container text-secondary-fixed shadow-modal transition-all duration-300 hover:-translate-y-1 hover:bg-primary sm:flex"
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
      </a>
    </div>
  );
}
