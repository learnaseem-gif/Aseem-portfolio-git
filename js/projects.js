/*
 * The Scaling Space — project data (single source of truth).
 *
 * To add or edit work, change this file only; the homepage grid and the
 * project detail pages both read from it. Drop real media into
 * /assets/work/<slug>/ and point `cover` / `heroVideo` / `gallery` at it.
 *
 * services  — any of: "Photography", "Social Reels", "Paid Campaigns", "Websites"
 * featured  — true pins the project to the large lead slot (reserved for Porsche)
 * status    — "live" shows normally; "coming-soon" shows the card with a badge
 */
window.PROJECTS = [
  {
    slug: "porsche-centre-richmond",
    client: "Porsche Centre Richmond",
    title: "Precision, in motion",
    category: "Automotive · Luxury",
    services: ["Photography", "Social Reels"],
    featured: true,
    status: "coming-soon",
    cover: "assets/work/porsche-centre-richmond/cover.jpg",
    heroVideo: "",
    summary:
      "Event coverage, reels, and photography for one of Canada's premier Porsche dealerships — case study in progress.",
    problem:
      "Porsche Centre Richmond needed content that matched the marque: fast, exacting, unmistakably premium. Off-the-shelf dealership media wasn't going to cut it.",
    scope: [
      "Instagram reels for launches and in-store events",
      "Event photography and coverage",
      "Vehicle and lifestyle photography",
    ],
    work:
      "Full case study, reels, and gallery coming soon — assets are being edited and will be published here.",
    gallery: [],
  },
  {
    slug: "bagga-jewels",
    client: "Bagga Jewels",
    title: "Light, cut to sell",
    category: "Jewelry · Retail",
    services: ["Social Reels", "Photography"],
    featured: false,
    status: "live",
    cover: "assets/work/bagga-jewels/cover.jpg",
    heroVideo: "",
    summary:
      "Scroll-stopping reels and product photography that make fine jewelry read as luxury on a phone screen.",
    problem:
      "Jewelry lives or dies on how it catches light — and most phone-shot content flattens it. Bagga Jewels needed social content that kept the sparkle and the status.",
    scope: [
      "Instagram reels for collections and drops",
      "Product and detail photography",
      "Content styled for feed and story formats",
    ],
    work:
      "We built a reel format that leads with motion and light — pieces shot to catch the eye mid-scroll, cut to a rhythm that holds attention long enough to sell.",
    gallery: [
      "assets/work/bagga-jewels/01.jpg",
      "assets/work/bagga-jewels/02.jpg",
    ],
  },
  {
    slug: "saloud",
    client: "Saloud",
    title: "The weight of oud",
    category: "Fragrance · Luxury",
    services: ["Photography", "Social Reels", "Paid Campaigns"],
    featured: false,
    status: "live",
    cover: "assets/work/saloud/cover.jpg",
    heroVideo: "",
    summary:
      "A visual language for a luxury oud house — photography and paid social that sell scent through mood, not description.",
    problem:
      "You can't smell a perfume through a screen. Saloud needed imagery that conveyed the richness and ritual of oud — and paid campaigns that turned that mood into sales.",
    scope: [
      "Product and mood photography",
      "Reels for launches and storytelling",
      "Paid social campaign creative",
    ],
    work:
      "We art-directed a warm, deliberate look — deep shadow, patient pacing — then built paid creative around it so the ads felt like the brand, not like ads.",
    gallery: [],
  },
  {
    slug: "canwide-mortgage",
    client: "Canwide Mortgage Services",
    title: "Trust, made visible",
    category: "Finance · Services",
    services: ["Websites", "Paid Campaigns", "Social Reels"],
    featured: false,
    status: "live",
    cover: "assets/work/canwide-mortgage/cover.jpg",
    heroVideo: "",
    summary:
      "A clear, credible digital presence for a mortgage brokerage — website, paid lead-gen, and social that build trust fast.",
    problem:
      "In mortgages, trust is the whole product. Canwide needed a digital presence that felt established and approachable, and marketing that brought in qualified leads.",
    scope: [
      "Website design and build",
      "Paid campaigns for lead generation",
      "Social content to build authority",
    ],
    work:
      "We built a website that reads as credible at a glance, then wired it to paid campaigns designed to capture and qualify leads — so marketing spend turns into conversations.",
    gallery: [],
  },
  {
    slug: "motor-world-autos",
    client: "The Motor World Auto's",
    title: "Every car, its best angle",
    category: "Automotive · Retail",
    services: ["Photography", "Social Reels", "Websites"],
    featured: false,
    status: "live",
    cover: "assets/work/motor-world-autos/cover.jpg",
    heroVideo: "assets/work/motor-world-autos/reel.mp4",
    summary:
      "Inventory photography, reels, and web presence that help an auto dealer move metal faster.",
    problem:
      "Used-car listings are a sea of sameness. The Motor World needed photography and content that made their inventory stand out and their dealership look the part.",
    scope: [
      "Vehicle inventory photography",
      "Reels for featured stock and the dealership",
      "Web presence",
    ],
    work:
      "We gave every vehicle a consistent, sharp look and built social content that showcases stock and personality — so browsers become buyers.",
    gallery: [],
  },
];
