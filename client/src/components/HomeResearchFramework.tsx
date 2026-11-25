import {
  ArrowDown,
  ArrowRight,
  Bot,
  Brain,
  BrainCircuit,
  Cable,
  ClipboardList,
  Database,
  Drama,
  Eye,
  FlipHorizontal2,
  Hand,
  HeartHandshake,
  Network,
  ScanEye,
  Smile,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  homeFramework,
  type FrameworkIcon,
  type FrameworkItem,
} from "@/lib/homeFramework";

const itemIcons: Record<FrameworkIcon, LucideIcon> = {
  hand: Hand,
  eye: Eye,
  smile: Smile,
  mirror: FlipHorizontal2,
  personality: Drama,
  tasks: ClipboardList,
  tracking: ScanEye,
  model: Network,
  data: Database,
  middleware: Cable,
};

const outcomeIcons: Record<
  (typeof homeFramework.outcomes.items)[number]["id"],
  LucideIcon
> = {
  "human-like": Brain,
  "natural-hri": HeartHandshake,
  "grounded-ai": Bot,
  impact: TrendingUp,
};

function ColumnHeading({
  number,
  title,
  inverse = false,
}: {
  number: string;
  title: string;
  inverse?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <div
      className={`flex items-baseline gap-3 border-b pb-3 mb-4 ${
        inverse ? "border-white/20" : "border-[#1B2A4A]/15"
      }`}
    >
      <span
        className={`text-sm font-semibold tracking-[0.15em] ${
          inverse ? "text-[#E8B4AE]" : "text-[#8B1A1A]"
        }`}
      >
        {number}
      </span>
      <h3
        className={`font-heading text-xl leading-tight ${
          inverse ? "text-white" : "text-[#1B2A4A]"
        }`}
      >
        {t(title)}
      </h3>
    </div>
  );
}

function ImageRows({ items }: { items: readonly FrameworkItem[] }) {
  const { t } = useLanguage();
  return (
    <ul className="space-y-3">
      {items.map(item => {
        const Icon = itemIcons[item.icon] ?? Brain;
        return (
          <li key={item.id} className="flex items-center gap-3">
            <div className="flex-1 min-w-0 flex items-center gap-2.5">
              <Icon
                size={20}
                strokeWidth={1.6}
                aria-hidden="true"
                className="shrink-0 text-[#8B1A1A]"
              />
              <span className="text-[15px] font-semibold leading-snug text-[#1B2A4A] [word-break:keep-all]">
                {t(item.label)}
              </span>
            </div>
            <img
              src={item.image.src}
              srcSet={item.image.srcSet}
              sizes="(min-width: 1280px) 104px, (min-width: 1024px) 96px, 132px"
              alt={t(item.alt)}
              width={480}
              height={320}
              loading="lazy"
              decoding="async"
              className="w-[132px] lg:w-[96px] xl:w-[104px] aspect-[3/2] object-cover rounded-sm border border-[#1B2A4A]/10 bg-white shrink-0"
            />
          </li>
        );
      })}
    </ul>
  );
}

function Connector() {
  return (
    <div
      aria-hidden="true"
      className="flex items-center justify-center text-[#1B2A4A]/45"
    >
      <ArrowDown size={22} strokeWidth={1.6} className="lg:hidden" />
      <ArrowRight size={22} strokeWidth={1.6} className="hidden lg:block" />
    </div>
  );
}

export function HomeResearchFramework() {
  const { t } = useLanguage();
  const { inputs, methods, core, outcomes } = homeFramework;

  return (
    <ScrollReveal direction="up" duration={600} className="mt-14 lg:mt-16">
      <figure id="core-research-framework">
        <figcaption className="font-heading text-2xl lg:text-3xl text-[#1B2A4A] leading-tight mb-8 max-w-3xl">
          {t(homeFramework.title)}
        </figcaption>

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_auto_1.15fr_auto_0.75fr_auto_0.95fr] gap-4 lg:gap-3 items-stretch">
          <div className="border-2 border-[#1B2A4A]/70 bg-white p-5 lg:p-4 xl:p-5">
            <ColumnHeading number={inputs.number} title={inputs.title} />
            <ImageRows items={inputs.items} />
          </div>

          <Connector />

          <div className="border-2 border-[#1B2A4A]/70 bg-white p-5 lg:p-4 xl:p-5">
            <ColumnHeading number={methods.number} title={methods.title} />
            <ImageRows items={methods.items} />
          </div>

          <Connector />

          <div className="border-2 border-[#1B2A4A] bg-[#1B2A4A] text-white p-5 lg:p-4 xl:p-5 flex flex-col">
            <ColumnHeading
              number={core.number}
              title="Core mechanism"
              inverse
            />
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 py-6">
              <BrainCircuit
                size={64}
                strokeWidth={1.2}
                aria-hidden="true"
                className="text-[#E8B4AE]"
              />
              <p className="font-heading text-2xl leading-tight">
                {t(core.title)}
              </p>
              <p className="text-sm leading-relaxed text-white/80">
                {t(core.description)}
              </p>
            </div>
          </div>

          <Connector />

          <div className="border-2 border-[#1B2A4A]/70 bg-white p-5 lg:p-4 xl:p-5">
            <ColumnHeading number={outcomes.number} title={outcomes.title} />
            <ul className="divide-y divide-[#1B2A4A]/10">
              {outcomes.items.map(item => {
                const Icon = outcomeIcons[item.id] ?? Brain;
                return (
                  <li
                    key={item.id}
                    className="flex gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <Icon
                      size={22}
                      strokeWidth={1.6}
                      aria-hidden="true"
                      className="shrink-0 mt-0.5 text-[#8B1A1A]"
                    />
                    <div>
                      <p className="text-[15px] font-semibold leading-snug text-[#1B2A4A]">
                        {t(item.title)}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-[#4A5568]">
                        {t(item.description)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </figure>
    </ScrollReveal>
  );
}
