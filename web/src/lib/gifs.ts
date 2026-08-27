/**
 * Meme GIFs, hotlinked from Tenor's CDN.
 *
 * Every URL here was checked to return 200 with an image/gif content-type and
 * to sit between 30–200 KB, so a card can load one without stalling the page.
 *
 * Swapping in self-hosted files later means changing `src` to a /public path —
 * nothing else in the app reads these URLs directly.
 */

export type MemeGif = {
  id: string;
  src: string;
  /** Describes the clip for anyone who can't see it. */
  alt: string;
  /** Caption burned under the GIF in the meme-subtitle treatment. */
  caption: string;
  /** Rendered aspect ratio, so the box reserves space before the GIF loads. */
  ratio: string;
};

export const GIFS = {
  paisa: {
    id: "paisa",
    src: "https://media.tenor.com/0_-i8PEg7b4AAAAM/phir-hera-pheri-paisa-hi-paisa-hoga.gif",
    alt: "Three men on a rooftop celebrating a money-making scheme",
    caption: "Paisa hi paisa hoga",
    ratio: "498 / 210",
  },
  doglapan: {
    id: "doglapan",
    src: "https://media.tenor.com/5lbaJ5Nb1YAAAAAM/yeh-sab-doglapan-hai-ashneer-grover.gif",
    alt: "A man in glasses dismissing something as two-faced",
    caption: "Ye sab doglapan hai",
    ratio: "498 / 280",
  },
  bhaiKyaKar: {
    id: "bhaiKyaKar",
    src: "https://media.tenor.com/q2eL6vNVKf4AAAAM/bhai-kya-kar-raha-hai-tu-ashneer-grover.gif",
    alt: "A man in glasses reacting with disbelief",
    caption: "Bhai kya kar raha hai tu",
    ratio: "498 / 280",
  },
  dukh: {
    id: "dukh",
    src: "https://media.tenor.com/nGAu3s4-_woAAAAM/jagyasini-singh-ye-dukh-kahe-khatam-nahi-hota-meme.gif",
    alt: "A woman looking exhausted and defeated",
    caption: "Ye dukh kaahe khatam nahi hota",
    ratio: "498 / 280",
  },
  tumseNaHoPayega: {
    id: "tumseNaHoPayega",
    src: "https://media.tenor.com/BomrEy3LytgAAAAM/beta-tumse-na-ho-payega-gangs-of-wasseypur.gif",
    alt: "Two men delivering a dismissive verdict",
    caption: "Beta, tumse na ho payega",
    ratio: "498 / 280",
  },
  bakwas: {
    id: "bakwas",
    src: "https://media.tenor.com/xY0p6VjB7z4AAAAM/shark-tank.gif",
    alt: "A judge in a chair thumping his fist",
    caption: "Bilkul bakwas hai ye",
    ratio: "498 / 280",
  },
  mastPlan: {
    id: "mastPlan",
    src: "https://media.tenor.com/9lWMTChmst4AAAAM/mastplanhai-mast-plan-hai.gif",
    alt: "A man nodding in approval at a plan",
    caption: "Mast plan hai",
    ratio: "498 / 280",
  },
  hoHoHo: {
    id: "hoHoHo",
    src: "https://media.tenor.com/6GQy44Yo9bkAAAAM/phir-hera-pheri-ho-ho-ho.gif",
    alt: "A man laughing with delight",
    caption: "Bete, mauj kardi",
    ratio: "498 / 280",
  },
  // ── Ravi Kishan ────────────────────────────────────────────────────────
  // "Money follows my brotha" is the line from the original brief, and it is
  // the one that maps cleanest onto the remote-salary claim.
  moneyFollows: {
    id: "moneyFollows",
    src: "https://media.tenor.com/ioMcMm49UAAAAAAS/money-follows-my-brotha-ravi-kishan.gif",
    alt: "Ravi Kishan declaring that money follows him",
    caption: "Money follows my brotha",
    ratio: "498 / 280",
  },
  reacted: {
    id: "reacted",
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
  raviConfused: {
    id: "raviConfused",
    src: "https://media.tenor.com/n1yDCLksxlEAAAAM/ravi-kishan-funny.gif",
    alt: "Ravi Kishan looking puzzled with a question mark",
    caption: "CV mein likha kya hai?",
    ratio: "498 / 280",
  },
  raviSad: {
    id: "raviSad",
    src: "https://media.tenor.com/qhtxd6sEUQ4AAAAS/sad-ravi-kishan-ravi-kishan.gif",
    alt: "Ravi Kishan looking dejected",
    caption: "Ek bhi reply nahi aaya",
    ratio: "498 / 280",
  },
} as const satisfies Record<string, MemeGif>;

export type GifKey = keyof typeof GIFS;
