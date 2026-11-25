import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useVisitorCounter } from "@/services/visitorCounter";
import { useVisitorSummary } from "@/services/visitor";
import { useConsent, services } from "@/services/consent";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  WORLD_DOTS_HEIGHT,
  WORLD_DOTS_LAT_MAX,
  WORLD_DOTS_LAT_MIN,
  WORLD_DOTS_PATH,
  WORLD_DOTS_WIDTH,
} from "@/lib/worldDots";

/** SEIL Lab, University of Surrey, Guildford. */
export const LAB_LOCATION = { latitude: 51.24, longitude: -0.59 };

/** Equirectangular projection matching the generated dot map. */
export function projectToMap(latitude: number, longitude: number) {
  const lat = Math.min(
    WORLD_DOTS_LAT_MAX,
    Math.max(WORLD_DOTS_LAT_MIN, latitude)
  );
  const x = ((longitude + 180) / 360) * WORLD_DOTS_WIDTH;
  const y =
    ((WORLD_DOTS_LAT_MAX - lat) / (WORLD_DOTS_LAT_MAX - WORLD_DOTS_LAT_MIN)) *
    WORLD_DOTS_HEIGHT;
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

/** Marker radius grows with the square root of visitors, within a calm range. */
export function markerRadius(visitors: number, maxVisitors: number) {
  if (maxVisitors <= 1) return 4.5;
  const ratio = Math.sqrt(Math.max(visitors, 1) / maxVisitors);
  return Math.round((3.5 + ratio * 6.5) * 10) / 10;
}

export function VisitorMap() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const consent=useConsent();
  const sessionCount = useVisitorCounter();
  const { data, isLoading, isError } = useVisitorSummary();

  const locale = language === "zh" ? "zh-CN" : "en-GB";
  const numberFormat = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const regionNames = useMemo(() => {
    try {
      return new Intl.DisplayNames([locale], { type: "region" });
    } catch {
      return null;
    }
  }, [locale]);

  const points = data?.points ?? [];
  const maxVisitors = points.reduce((max, p) => Math.max(max, p.visits), 1);
  const lab = projectToMap(LAB_LOCATION.latitude, LAB_LOCATION.longitude);
  const ready = data;
  const formatCount = (value: number | undefined) =>
    ready && typeof value === "number" ? numberFormat.format(value) : "-";
  const countryName = (code: string) => regionNames?.of(code) ?? code;

  const mapLabel = ready
    ? `${t("Visitor map")}: ${numberFormat.format(data.visits)} ${t("Visits")}, ${numberFormat.format(data.countries)} ${t("Countries and regions")}`
    : t("Visitor map");

  const showMap = services.visitorMap.showWhenDisabled || consent.allowed.visitorMap;
  if (!showMap) {
    if (sessionCount === undefined) return null;
    return <section id="visitor-map" aria-label={t("Website visits")} className="py-12 lg:py-16 bg-white border-t border-[#E2E8F0]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <ScrollReveal direction="up" duration={600}>
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div><h2 className="text-3xl lg:text-4xl text-[#1B2A4A] font-heading">{t("Website visits")}</h2>
              <p className="mt-2 text-sm text-[#64748B]">{t("Opt-in browser sessions")}</p></div>
            <div className="text-4xl text-[#1B2A4A] font-heading tabular-nums" data-visitor-stat="sessions">{numberFormat.format(sessionCount)}</div>
          </div>
        </ScrollReveal>
      </div>
    </section>;
  }
  return (
    <section
      id="visitor-map"
      aria-labelledby="visitor-map-heading"
      className="py-20 lg:py-24 bg-white border-t border-[#E2E8F0]"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <ScrollReveal direction="up" duration={600} className="lg:col-span-4">
            <h2
              id="visitor-map-heading"
              className="text-3xl lg:text-5xl text-[#1B2A4A] font-heading leading-tight"
            >
              {t("Visitors around the world")}
            </h2>

            <p className="mt-3 text-sm text-[#64748B]">{t("Opt-in visits (30-minute sessions)")}</p>
            <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-[#E2E8F0] pt-6">
              <div>
                <dt className="text-sm text-[#64748B]">{t("Visits")}</dt>
                <dd
                  data-visitor-stat="visits"
                  className="mt-1 text-4xl text-[#1B2A4A] font-heading tabular-nums"
                >
                  {formatCount(data?.visits)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-[#64748B]">
                  {t("Countries and regions")}
                </dt>
                <dd
                  data-visitor-stat="countries"
                  className="mt-1 text-4xl text-[#1B2A4A] font-heading tabular-nums"
                >
                  {formatCount(data?.countries)}
                </dd>
              </div>
            </dl>

            {isError && ready && <p className="mt-4 text-sm text-[#64748B]">{t("Showing last available statistics.")}</p>}
            {!ready && <p className="mt-4 text-sm text-[#64748B]">{isLoading ? t("Loading visitor statistics…") : t("Visitor statistics are currently unavailable.")}</p>}
            {ready && data.topCountries.length > 0 && (
              <div className="mt-8">
                <h3 className="font-sans text-[11px] uppercase tracking-[0.15em] font-semibold text-[#64748B]">
                  {t("Top locations")}
                </h3>
                <ol className="mt-3 space-y-2" data-visitor-top-countries>
                  {data.topCountries.map(item => {
                    const share = data.visits
                      ? (item.visits / data.visits) * 100
                      : 0;
                    return (
                      <li
                        key={item.countryCode}
                        className="text-sm text-[#4A5568]"
                      >
                        <div className="flex items-baseline justify-between gap-4">
                          <span>{countryName(item.countryCode)}</span>
                          <span className="tabular-nums text-[#1B2A4A]">
                            {numberFormat.format(item.visits)}
                          </span>
                        </div>
                        <div
                          className="mt-1 h-[3px] bg-[#EEF1F5] rounded-full"
                          aria-hidden="true"
                        >
                          <div
                            className="h-full rounded-full bg-[#8B1A1A]/70"
                            style={{ width: `${share}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
          </ScrollReveal>

          <ScrollReveal
            direction="up"
            delay={120}
            duration={600}
            className="lg:col-span-8"
          >
            <figure className="m-0">
              <svg
                viewBox={`0 0 ${WORLD_DOTS_WIDTH} ${WORLD_DOTS_HEIGHT}`}
                role="img"
                aria-label={mapLabel}
                className="block w-full h-auto"
                data-visitor-map
              >
                <path
                  d={WORLD_DOTS_PATH}
                  fill="none"
                  stroke="#D6DDE7"
                  strokeWidth={4.4}
                  strokeLinecap="round"
                />
                {points.map(point => {
                  const { x, y } = projectToMap(
                    point.latitude,
                    point.longitude
                  );
                  const r = markerRadius(point.visits, maxVisitors);
                  return (
                    <g
                      key={`${point.latitude},${point.longitude}`}
                      data-visitor-point
                    >
                      <title>{numberFormat.format(point.visits)} {t("Visits")}</title>
                      <circle
                        cx={x}
                        cy={y}
                        r={r}
                        className="visitor-halo"
                        fill="#8B1A1A"
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r={r}
                        fill="#8B1A1A"
                        fillOpacity={0.82}
                      />
                    </g>
                  );
                })}
                <g data-lab-marker aria-hidden="true">
                  <circle
                    cx={lab.x}
                    cy={lab.y}
                    r={7.5}
                    fill="none"
                    stroke="#1B2A4A"
                    strokeWidth={1.6}
                  />
                  <circle cx={lab.x} cy={lab.y} r={2.6} fill="#1B2A4A" />
                </g>
              </svg>
              <figcaption className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#64748B]">
                <span className="inline-flex items-center gap-2">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full bg-[#8B1A1A]/80"
                    aria-hidden="true"
                  />
                  {t("Visits")}
                </span>
                <span className="inline-flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full border-[1.5px] border-[#1B2A4A]"
                    aria-hidden="true"
                  />
                  {t("SEIL Lab, Guildford")}
                </span>
                <span>
                  {t("Locations are approximate. IP addresses are not stored.")}
                </span>
              </figcaption>
            </figure>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
