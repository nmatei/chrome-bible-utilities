import { getLiveTextFrameUrl, getSafeFrameUrl } from "../../views/common/utilities";

describe("getSafeFrameUrl", () => {
  it("accepts https urls and returns the normalized href", () => {
    expect(getSafeFrameUrl("https://example.com")).toBe("https://example.com/");
    expect(getSafeFrameUrl("  https://www.youtube.com/embed/abc?autoplay=1 ")).toBe(
      "https://www.youtube.com/embed/abc?autoplay=1"
    );
  });

  it("accepts http only for localhost", () => {
    expect(getSafeFrameUrl("http://localhost:3000/slides")).toBe("http://localhost:3000/slides");
    expect(getSafeFrameUrl("http://127.0.0.1:8080/")).toBe("http://127.0.0.1:8080/");
    expect(getSafeFrameUrl("http://example.com")).toBeNull();
  });

  it("rejects dangerous or non web protocols", () => {
    expect(getSafeFrameUrl("javascript:alert(1)")).toBeNull();
    expect(getSafeFrameUrl("JavaScript:alert(1)")).toBeNull();
    expect(getSafeFrameUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
    expect(getSafeFrameUrl("blob:https://example.com/uuid")).toBeNull();
    expect(getSafeFrameUrl("file:///etc/passwd")).toBeNull();
    expect(getSafeFrameUrl("chrome://settings")).toBeNull();
    expect(
      getSafeFrameUrl("chrome-extension://fklnkmnlobkpoiifnbnemdpamheoanpj/views/settings/options.html")
    ).toBeNull();
  });

  it("rejects urls with credentials", () => {
    expect(getSafeFrameUrl("https://user:pass@example.com")).toBeNull();
    expect(getSafeFrameUrl("https://user@example.com")).toBeNull();
  });

  it("rejects invalid input", () => {
    expect(getSafeFrameUrl("")).toBeNull();
    expect(getSafeFrameUrl("not a url")).toBeNull();
    expect(getSafeFrameUrl("//example.com")).toBeNull();
    expect(getSafeFrameUrl(undefined as any)).toBeNull();
    expect(getSafeFrameUrl({ href: "https://example.com" } as any)).toBeNull();
    expect(getSafeFrameUrl("https://example.com/" + "a".repeat(2048))).toBeNull();
  });
});

describe("getLiveTextFrameUrl", () => {
  it("extracts the url after the iframe: prefix", () => {
    expect(getLiveTextFrameUrl("iframe: https://example.com")).toBe("https://example.com");
    expect(getLiveTextFrameUrl("iframe:https://example.com/a?b=1")).toBe("https://example.com/a?b=1");
    expect(getLiveTextFrameUrl("  IFrame:   https://example.com  \n")).toBe("https://example.com");
  });

  it("returns the url unvalidated (validation is done by getSafeFrameUrl)", () => {
    expect(getLiveTextFrameUrl("iframe: javascript:alert(1)")).toBe("javascript:alert(1)");
  });

  it("extracts the src from a copied embed snippet", () => {
    const youtube =
      '<iframe width="1048" height="590" src="https://www.youtube.com/embed/ORcJ_bMNORo?list=RDORcJ_bMNORo" title="Exista Dumnezeu - Teo Family #RevolutiaContinua Decembrie ‘89" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
    expect(getLiveTextFrameUrl(youtube)).toBe("https://www.youtube.com/embed/ORcJ_bMNORo?list=RDORcJ_bMNORo");
    expect(getLiveTextFrameUrl("  <IFRAME src='https://example.com/a?b=1&amp;c=2'>\n")).toBe("https://example.com/a?b=1&c=2");
    expect(getLiveTextFrameUrl('<iframe data-src="https://a.com" src="https://example.com"></iframe>')).toBe(
      "https://example.com"
    );
  });

  it("ignores snippets without src or with more text", () => {
    expect(getLiveTextFrameUrl('<iframe data-src="https://example.com"></iframe>')).toBeNull();
    expect(getLiveTextFrameUrl('<iframe src=""></iframe>')).toBeNull();
    expect(getLiveTextFrameUrl('text <iframe src="https://example.com"></iframe>')).toBeNull();
    expect(getLiveTextFrameUrl('<iframe src="https://example.com"></iframe> more text')).toBeNull();
    expect(getLiveTextFrameUrl('<iframe src="https://a.com"></iframe><iframe src="https://b.com"></iframe>')).toBeNull();
  });

  it("ignores normal live text", () => {
    expect(getLiveTextFrameUrl("https://example.com")).toBeNull();
    expect(getLiveTextFrameUrl("Details on https://example.com")).toBeNull();
    expect(getLiveTextFrameUrl("iframe: https://example.com\nmore text")).toBeNull();
    expect(getLiveTextFrameUrl("text\niframe: https://example.com")).toBeNull();
    expect(getLiveTextFrameUrl("iframe:")).toBeNull();
    expect(getLiveTextFrameUrl("")).toBeNull();
    expect(getLiveTextFrameUrl(undefined as any)).toBeNull();
  });
});
