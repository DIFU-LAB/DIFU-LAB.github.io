import { Fragment } from "react";

// Chinese has no spaces, so browsers may break a line inside a word
// (e.g. 智|能). For short display text, split the string into words with
// Intl.Segmenter, keep punctuation attached to the preceding word and allow
// line breaks only between words. Other languages render unchanged.
const closingPunctuation = /^[，。、；：！？）」』》〉”’,.;:!?)\]]+$/;
// Terms the browser segmenter splits but that must stay on one line.
const keepTogether = ["具身", "之处", "人工智能"];

// True when a keep-together term would be split between `last` and `next`.
function splitsTerm(last: string, next: string) {
  return keepTogether.some(term =>
    Array.from({ length: term.length - 1 }, (_, i) => i + 1).some(
      k => last.endsWith(term.slice(0, k)) && next.startsWith(term.slice(k))
    )
  );
}

function chineseWords(text: string): string[] | null {
  if (typeof Intl === "undefined" || !("Segmenter" in Intl)) return null;
  const segmenter = new Intl.Segmenter("zh", { granularity: "word" });
  const words: string[] = [];
  Array.from(segmenter.segment(text), item => item.segment).forEach(segment => {
    const last = words[words.length - 1] ?? "";
    if (
      words.length &&
      (closingPunctuation.test(segment) || splitsTerm(last, segment))
    )
      words[words.length - 1] += segment;
    else words.push(segment);
  });
  return words;
}

export function WordWrapText({
  text,
  language,
}: {
  text: string;
  language: string;
}) {
  if (language !== "zh") return <>{text}</>;
  const words = chineseWords(text);
  if (!words) return <>{text}</>;
  return (
    <span className="[word-break:keep-all]">
      {words.map((word, index) => (
        <Fragment key={index}>
          {index > 0 && <wbr />}
          {word}
        </Fragment>
      ))}
    </span>
  );
}
