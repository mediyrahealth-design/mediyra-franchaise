import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  HeadphonesIcon,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

const LAB_INFO = {
  name: "Mediyra Pathology Laboratory",
  phone: "+91 98765 43210",
  whatsapp: "919876543210",
  address: "12, Medical Complex, Near City Hospital,\nMG Road, Mumbai – 400001",
  hours: "Mon – Sat: 7:00 AM – 8:00 PM\nSunday: 8:00 AM – 2:00 PM",
  email: "support@mediyra.com",
};

function ContactCard({
  icon: Icon,
  title,
  value,
  action,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card-elevated p-5 flex items-start gap-4">
      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          {title}
        </p>
        <p className="font-medium text-foreground mt-1 whitespace-pre-line leading-relaxed">
          {value}
        </p>
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}

export default function SupportPage() {
  return (
    <div className="space-y-6 max-w-lg" data-ocid="support.page">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <HeadphonesIcon className="h-6 w-6 text-primary" />
          Support
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Get in touch with the Mediyra Lab team
        </p>
      </div>

      {/* Hero card */}
      <div className="card-elevated p-6 bg-primary/5 border-primary/20 space-y-2">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <HeadphonesIcon className="h-6 w-6 text-primary" />
        </div>
        <h2 className="font-display font-bold text-foreground text-lg">
          {LAB_INFO.name}
        </h2>
        <p className="text-sm text-muted-foreground">
          Our team is here to assist you with reports, sample tracking, and
          partner queries.
        </p>
      </div>

      {/* Contact cards */}
      <div className="space-y-3">
        <ContactCard
          icon={Phone}
          title="Phone"
          value={LAB_INFO.phone}
          action={
            <a href={`tel:${LAB_INFO.phone.replace(/\s/g, "")}`}>
              <Button
                size="sm"
                className="gap-2"
                data-ocid="support.call_button"
              >
                <Phone className="h-3.5 w-3.5" />
                Call Now
              </Button>
            </a>
          }
        />

        <ContactCard
          icon={MessageCircle}
          title="WhatsApp"
          value="Chat with us on WhatsApp for quick support"
          action={
            <a
              href={`https://wa.me/${LAB_INFO.whatsapp}?text=Hello%20Mediyra%20Lab%2C%20I%20need%20support`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="sm"
                variant="outline"
                className="gap-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50"
                data-ocid="support.whatsapp_button"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Open WhatsApp
              </Button>
            </a>
          }
        />

        <ContactCard
          icon={MapPin}
          title="Lab Address"
          value={LAB_INFO.address}
        />

        <ContactCard
          icon={Clock}
          title="Working Hours"
          value={LAB_INFO.hours}
        />
      </div>

      <Separator />

      {/* Note */}
      <div className="text-sm text-muted-foreground space-y-2">
        <p className="font-medium text-foreground">
          Frequently Asked Questions
        </p>
        {[
          {
            q: "How do I get a report?",
            a: "Once the status is 'Report Ready', use the Download Report button in My Bookings or Track Sample.",
          },
          {
            q: "How long does sample processing take?",
            a: "Most tests are processed within 4–8 hours. Individual test report times are listed in the Price List.",
          },
          {
            q: "Who do I contact for billing issues?",
            a: "Call or WhatsApp us directly. The Billing page shows read-only summaries.",
          },
        ].map((item) => (
          <div key={item.q} className="card-elevated p-4 space-y-1">
            <p className="font-medium text-foreground text-sm">{item.q}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {item.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
