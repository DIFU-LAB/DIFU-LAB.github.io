import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollReveal } from '@/components/ScrollReveal';
import { services, useConsent } from '@/services/consent';

/** VisitorDots counts accepted map image loads, not Cloudflare sessions.
 * The separate visitor card is display-only. Never mount a second tracking image.
 * Origin-only referrer is necessary for the provider's allowed-host check. */
export function HostedVisitorMap({secondary=false}:{secondary?:boolean}) {
  const { t } = useTranslation();
  const { allowed } = useConsent();
  const [mapError, setMapError] = useState(false);
  const [counterError, setCounterError] = useState(false);
  const { mapUrl, counterUrl, detailsUrl } = services.visitorDots;
  if (!allowed.visitorDots) return null;
  const id = secondary ? "visitor-map-hosted" : "visitor-map";
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="py-20 lg:py-24 bg-white border-t border-[#E2E8F0]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        <ScrollReveal direction="up" duration={600} className="lg:col-span-4">
          <h2 id={`${id}-heading`} className="text-3xl lg:text-5xl text-[#1B2A4A] font-heading leading-tight">{t("Visitors around the world")}</h2>
          <p className="mt-3 text-sm text-[#64748B]">{t("Opt-in map views (not unique visitors)")}</p>
          {!counterError && <img src={counterUrl} alt={t("VisitorDots visit totals and geographic coverage")} referrerPolicy="origin" decoding="async" className="mt-6 block max-w-full h-auto" onError={() => setCounterError(true)} />}
          {counterError && <p className="mt-4 text-sm text-[#64748B]" role="status">{t("Visitor statistics are currently unavailable.")}</p>}
          <a href={detailsUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block text-sm text-[#8B1A1A] underline underline-offset-4">{t("View country and region counts on VisitorDots")}</a>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={120} duration={600} className="lg:col-span-8">
          <figure className="m-0">
            {!mapError ? <img src={mapUrl} alt={t("Visitor map")} referrerPolicy="origin" decoding="async" className="block w-full h-auto" onError={() => setMapError(true)} /> : <p role="status" className="text-sm text-[#64748B]">{t("Visitor map is currently unavailable.")}</p>}
            <figcaption className="mt-4 text-xs text-[#64748B]">{t("Approximate locations provided by VisitorDots.")}</figcaption>
          </figure>
        </ScrollReveal>
      </div>
    </section>
  );
}
