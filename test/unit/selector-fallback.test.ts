/**
 * @jest-environment jsdom
 */
import { detectVerseSelectors, getVersionViews } from "../../views/bibles/bible.com/selector-fallback";

// a bible.com chapter after a deploy with a class format no selector in selectors.js knows
function chapterHtml(verses: number, withUsfm = true, lang = "en") {
  const usfm = (ref: string) => (withUsfm ? ` data-usfm="${ref}"` : "");
  const html = Array.from({ length: verses }, (_, i) => {
    const nr = i + 1;
    // a note with a cross reference inside verse 2 (it has a data-usfm too), as bible.com renders it
    const note =
      nr === 2
        ? `<span class="n3w_note"><span class="n3w_lbl">#</span><span class="n3w_body"><span class="ref"${usfm("PRO.4.14")}>Prov 4:14</span></span></span>`
        : "";
    // words of Jesus - also a child of the verse, but text to project
    const wj = nr === 3 ? `<span class="n3w_wj">Words of Jesus</span>` : "";
    return `<span class="n3w_vrs"${usfm(`GEN.1.${nr}`)}><span class="n3w_lbl">${nr}</span><span class="n3w_txt">Text of verse ${nr}</span>${note}${wj}</span>`;
  }).join("");
  return `<div data-testid="chapter-content" lang="${lang}">
    <div class="n3w_chapter"${usfm("GEN.1")}>
      <div class="n3w_cn">1</div>
      <h2 class="n3w_heading">2</h2>
      <div class="n3w_p">${html}</div>
    </div>
  </div>`;
}

function render(body: string) {
  return new DOMParser().parseFromString(`<main id="main">${body}</main>`, "text/html");
}

function labelsFound(doc: Document) {
  const detected = detectVerseSelectors(doc);
  return [...doc.querySelectorAll(`${detected.verse} > ${detected.label}`)].map(l => l.textContent);
}

describe("detectVerseSelectors", () => {
  it("finds the verses by data-usfm, not the cross references of the notes", () => {
    const doc = render(chapterHtml(5));
    const detected = detectVerseSelectors(doc);
    expect(detected.source).toBe("data-usfm");
    expect(detected.verse).toBe('[class~="n3w_vrs"]');
    expect(detected.label).toBe('[class~="n3w_lbl"]');
    expect(detected.content).toBe('[class~="n3w_txt"]');
    // the notes, not the words of Jesus
    expect(detected.notes).toBe('[class~="n3w_note"]');
  });

  it("finds the verses by their numbers when data-usfm is gone too", () => {
    const doc = render(chapterHtml(5, false));
    const detected = detectVerseSelectors(doc);
    expect(detected.source).toBe("verse numbers");
    expect(detected.verse).toBe('[class~="n3w_vrs"]');
    expect(detected.label).toBe('[class~="n3w_lbl"]');
    // not the chapter number or the heading
    expect(labelsFound(doc)).toEqual(["1", "2", "3", "4", "5"]);
  });

  it("finds the verses of both versions in parallel view (numbers start again from 1)", () => {
    const doc = render(chapterHtml(4, false) + chapterHtml(4, false, "ro"));
    expect(labelsFound(doc)).toEqual(["1", "2", "3", "4", "1", "2", "3", "4"]);
  });

  it("finds the primary and the parallel version containers", () => {
    const doc = render(chapterHtml(4, false) + chapterHtml(4, false, "ro"));
    const [primary, parallel] = getVersionViews(detectVerseSelectors(doc), doc);
    expect(primary.closest("[data-testid]").getAttribute("lang")).toBe("en");
    expect(parallel.closest("[data-testid]").getAttribute("lang")).toBe("ro");
    expect(primary.contains(parallel) || parallel.contains(primary)).toBe(false);
  });

  it("returns null when the page has no verses", () => {
    expect(detectVerseSelectors(render('<div data-testid="chapter-content"><p>Intro</p></div>'))).toBeNull();
    expect(detectVerseSelectors(render(""))).toBeNull();
  });
});
