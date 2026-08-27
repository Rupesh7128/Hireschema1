/**
 * Meme GIFs, hotlinked from Tenor's CDN.
 *
 * Roster is deliberately narrow: Ravi Kishan (who is in the middle of a
 * genuine 2026 meme run) plus two neutral Modi clips. The older Bollywood
 * templates — Hera Pheri, Gangs of Wasseypur, Deewaar, the Shark Tank
 * "doglapan" era — were pulled; they read as dated to the people we are
 * actually selling to.
 *
 * Every URL below was checked to return 200 with an image/gif content-type at
 * under ~330 KB. Swapping to self-hosted files later means changing `src` to a
 * /public path; nothing else in the app reads these URLs directly.
 */

export type MemeGif = {
  id: string;
  src: string;
  /** Describes the clip for anyone who can't see it. */
  alt: string;
  /** Caption burned under the GIF in the subtitle treatment. */
  caption: string;
  /** Rendered aspect ratio, so the box reserves space before the GIF loads. */
  ratio: string;
};

export const GIFS = {
  // ── Ravi Kishan ────────────────────────────────────────────────────────
  moneyFollows: {
    id: "moneyFollows",
    src: "https://media.tenor.com/ioMcMm49UAAAAAAS/money-follows-my-brotha-ravi-kishan.gif",
    alt: "Ravi Kishan declaring that money follows him",
    caption: "Money follows my brotha",
    ratio: "498 / 280",
  },
  /** The line is literally the product: work from home, not office. */
  homeFromWork: {
    id: "homeFromWork",
    src: "https://media.tenor.com/VfZnIoZhaGYAAAAS/haa-home-from-work.gif",
    alt: "Ravi Kishan seated, delivering the line home from work",
    caption: "Home from work",
    ratio: "498 / 280",
  },
  jaldiTheLate: {
    id: "jaldiTheLate",
    src: "https://media.tenor.com/pe-eu6BsMh0AAAAS/ravi-kishan-jaldi-the-late.gif",
    alt: "Ravi Kishan saying jaldi the late",
    caption: "Jaldi the late",
    ratio: "498 / 280",
  },
  raviReacted: {
    id: "raviReacted",
    src: "https://media.tenor.com/P0EUl2iZUHgAAAAM/ravi-kishan-reacted-to-your-message.gif",
    alt: "Ravi Kishan reacting to a message",
    caption: "HM reacted to your message",
    ratio: "498 / 280",
  },
  raviCelebrate: {
    id: "raviCelebrate",
    src: "https://media.tenor.com/2hivY5pP9YoAAAAS/ravi-kishan-laughing-laughing.gif",
    alt: "Ravi Kishan dancing in celebration",
    caption: "Bete, mauj kardi",
    ratio: "498 / 280",
  },
  raviSad: {
    id: "raviSad",
    src: "https://media.tenor.com/qhtxd6sEUQ4AAAAS/sad-ravi-kishan-ravi-kishan.gif",
    alt: "Ravi Kishan looking dejected",
    caption: "Ek bhi reply nahi aaya",
    ratio: "498 / 280",
  },
  raviConfused: {
    id: "raviConfused",
    src: "https://media.tenor.com/n1yDCLksxlEAAAAM/ravi-kishan-funny.gif",
    alt: "Ravi Kishan looking puzzled with a question mark",
    caption: "CV mein likha kya hai?",
    ratio: "498 / 280",
  },

  // ── Modi ───────────────────────────────────────────────────────────────
  // Kept to the affectionate end of the spectrum on purpose. The templates
  // trending hardest right now are either crude or built on calling young
  // people stupid — which lands badly when young people are the customer.
  mumkinHai: {
    id: "mumkinHai",
    src: "https://media.tenor.com/PPyHSYBi2GoAAAAM/modiji-modi-hai-to-mumkin-hai.gif",
    alt: "Narendra Modi waving from a car",
    caption: "India se? Mumkin hai.",
    ratio: "498 / 280",
  },
  thankYouFrands: {
    id: "thankYouFrands",
    src: "https://media.tenor.com/OcApFFt4Fc8AAAAS/modi-ji-thank-you.gif",
    alt: "Narendra Modi saying thank you",
    caption: "Thank you, frands",
    ratio: "498 / 280",
  },
} as const satisfies Record<string, MemeGif>;

export type GifKey = keyof typeof GIFS;
