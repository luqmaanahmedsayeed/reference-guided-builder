export type L = { en: string; hi: string; ta: string };
export type PlaceType =
  | "entrance" | "desk" | "emergency" | "service" | "facility" | "lift" | "stairs" | "ramp" | "room" | "waiting" | "ward";

export type Place = {
  id: string; floor: 0 | 1 | 2; x: number; y: number; w?: number; type: PlaceType;
  name: L; lm: L; attach?: string; // attach: connect to another place instead of corridor
};

const p = (id: string, floor: 0 | 1 | 2, x: number, y: number, type: PlaceType, name: L, lm: L, extra: Partial<Place> = {}): Place =>
  ({ id, floor, x, y, type, name, lm, ...extra });

const TOP = 55, BOT = 205;
export const CORRIDOR_Y = 130;

const lmLift: L = { en: "beside the lift", hi: "लिफ्ट के पास", ta: "லிஃப்ட் அருகில்" };
const lmEnd: L = { en: "at the end of the corridor", hi: "गलियारे के आखिर में", ta: "நடைபாதையின் முடிவில்" };
const lmStairs: L = { en: "near the toilets", hi: "शौचालय के पास", ta: "கழிப்பறை அருகில்" };
const lmLeft: L = { en: "at the left end, near the wheelchair sign", hi: "बाईं ओर, व्हीलचेयर चिह्न के पास", ta: "இடது முனையில், சக்கர நாற்காலி குறி அருகில்" };
const liftN: L = { en: "Lift", hi: "लिफ्ट", ta: "லிஃப்ட்" };
const stairsN: L = { en: "Stairs", hi: "सीढ़ियां", ta: "படிக்கட்டு" };
const toiletN: L = { en: "Toilets", hi: "शौचालय", ta: "கழிப்பறை" };
const room = (n: number): L => ({ en: `OPD Room ${n}`, hi: `ओपीडी कमरा ${n}`, ta: `ஓபிடி அறை ${n}` });
const blue: L = { en: "opposite the blue chairs", hi: "नीली कुर्सियों के सामने", ta: "நீல நாற்காலிகளுக்கு எதிரே" };
const green: L = { en: "near the green door", hi: "हरे दरवाजे के पास", ta: "பச்சை கதவு அருகில்" };
const water: L = { en: "next to the drinking water", hi: "पीने के पानी के पास", ta: "குடிநீர் அருகில்" };

export const PLACES: Place[] = [
  // Ground floor
  p("emergency", 0, 35, TOP, "emergency", { en: "Emergency (Casualty)", hi: "इमरजेंसी (कैजुअल्टी)", ta: "அவசர சிகிச்சை (கேஷுவால்டி)" }, green),
  p("pharmacy", 0, 115, TOP, "service", { en: "Pharmacy", hi: "दवा की दुकान (फार्मेसी)", ta: "மருந்தகம்" }, { en: "under the big green cross sign", hi: "बड़े हरे क्रॉस चिह्न के नीचे", ta: "பெரிய பச்சை சிலுவை குறியின் கீழ்" }),
  p("lab", 0, 200, TOP, "service", { en: "Laboratory / Blood tests", hi: "लैब / खून की जांच", ta: "ஆய்வகம் / ரத்த பரிசோதனை" }, { en: "facing the main entrance", hi: "मुख्य द्वार के सामने", ta: "முதன்மை நுழைவாயிலுக்கு நேராக" }),
  p("xray", 0, 285, TOP, "service", { en: "X-ray", hi: "एक्स-रे", ta: "எக்ஸ்-ரே" }, { en: "behind the yellow line on the floor", hi: "फर्श पर पीली लाइन के पीछे", ta: "தரையில் உள்ள மஞ்சள் கோட்டுக்கு பின்னால்" }),
  p("toilets_g", 0, 360, TOP, "facility", toiletN, lmEnd),
  p("lift_g", 0, 35, BOT, "lift", liftN, lmLeft),
  p("wheel", 0, 95, BOT, "facility", { en: "Wheelchair point", hi: "व्हीलचेयर स्थान", ta: "சக்கர நாற்காலி இடம்" }, lmLift),
  p("reg", 0, 150, BOT, "desk", { en: "Registration counters", hi: "पंजीकरण काउंटर", ta: "பதிவு கவுண்டர்கள்" }, blue),
  p("ramp", 0, 200, BOT, "ramp", { en: "Ramp", hi: "रैंप", ta: "சரிவுப் பாதை" }, { en: "just inside the main entrance", hi: "मुख्य द्वार के ठीक अंदर", ta: "முதன்மை நுழைவாயிலின் உள்ளே" }),
  p("help", 0, 255, BOT, "desk", { en: "Help desk", hi: "सहायता केंद्र", ta: "உதவி மையம்" }, water),
  p("water_g", 0, 305, BOT, "facility", { en: "Drinking water", hi: "पीने का पानी", ta: "குடிநீர்" }, { en: "next to the help desk", hi: "सहायता केंद्र के पास", ta: "உதவி மையம் அருகில்" }),
  p("stairs_g", 0, 360, BOT, "stairs", stairsN, lmStairs),
  p("entrance", 0, 200, 252, "entrance", { en: "Main entrance", hi: "मुख्य द्वार", ta: "முதன்மை நுழைவாயில்" }, { en: "the big glass doors", hi: "बड़े कांच के दरवाजे", ta: "பெரிய கண்ணாடி கதவுகள்" }, { attach: "ramp" }),
  // First floor
  p("room1", 1, 35, TOP, "room", room(1), lmLift),
  p("room2", 1, 100, TOP, "room", room(2), { en: "next to Room 1", hi: "कमरा 1 के बगल में", ta: "அறை 1 அருகில்" }),
  p("room3", 1, 165, TOP, "room", room(3), { en: "the door with the cartoon poster", hi: "कार्टून पोस्टर वाला दरवाजा", ta: "கார்ட்டூன் சுவரொட்டி உள்ள கதவு" }),
  p("room4", 1, 230, TOP, "room", room(4), { en: "the pink door", hi: "गुलाबी दरवाजा", ta: "இளஞ்சிவப்பு கதவு" }),
  p("room5", 1, 295, TOP, "room", room(5), green),
  p("toilets_1", 1, 360, TOP, "facility", toiletN, lmEnd),
  p("lift_1", 1, 35, BOT, "lift", liftN, lmLeft),
  p("room6", 1, 100, BOT, "room", room(6), lmLift),
  p("waitA", 1, 165, BOT, "waiting", { en: "Waiting Hall A", hi: "प्रतीक्षा हॉल A", ta: "காத்திருப்பு அரங்கம் A" }, { en: "the hall with the blue chairs", hi: "नीली कुर्सियों वाला हॉल", ta: "நீல நாற்காலிகள் உள்ள அரங்கம்" }),
  p("room7", 1, 230, BOT, "room", room(7), blue),
  p("room8", 1, 295, BOT, "room", room(8), water),
  p("stairs_1", 1, 360, BOT, "stairs", stairsN, lmStairs),
  // Second floor
  p("ward4", 2, 70, TOP, "ward", { en: "Ward 4 (Medicine)", hi: "वार्ड 4 (मेडिसिन)", ta: "வார்டு 4 (மருத்துவம்)" }, lmLift),
  p("ward5", 2, 200, TOP, "ward", { en: "Ward 5 (Surgery)", hi: "वार्ड 5 (सर्जरी)", ta: "வார்டு 5 (அறுவை சிகிச்சை)" }, { en: "opposite the nurses' station", hi: "नर्स स्टेशन के सामने", ta: "செவிலியர் நிலையத்துக்கு எதிரே" }),
  p("ward6", 2, 330, TOP, "ward", { en: "Ward 6 (Children)", hi: "वार्ड 6 (बच्चे)", ta: "வார்டு 6 (குழந்தைகள்)" }, green),
  p("lift_2", 2, 35, BOT, "lift", liftN, lmLeft),
  p("nurses", 2, 200, BOT, "desk", { en: "Nurses' station", hi: "नर्स स्टेशन", ta: "செவிலியர் நிலையம்" }, blue),
  p("stairs_2", 2, 360, BOT, "stairs", stairsN, lmEnd),
];

export const placeById = (id: string) => PLACES.find((x) => x.id === id);

export type Edge = { to: string; d: number; stairs: boolean };
export type Node = { id: string; floor: number; x: number; y: number };

// Single source of truth: graph built from the same place data the map draws.
export function buildGraph() {
  const nodes = new Map<string, Node>();
  const adj = new Map<string, Edge[]>();
  const add = (a: string, b: string, d: number, stairs = false) => {
    adj.get(a)!.push({ to: b, d, stairs });
    adj.get(b)!.push({ to: a, d, stairs });
  };
  const node = (n: Node) => { nodes.set(n.id, n); adj.set(n.id, []); };
  PLACES.forEach((pl) => node({ id: pl.id, floor: pl.floor, x: pl.x, y: pl.y }));
  for (const f of [0, 1, 2]) {
    const xs = [...new Set(PLACES.filter((pl) => pl.floor === f && !pl.attach).map((pl) => pl.x))].sort((a, b) => a - b);
    xs.forEach((x) => node({ id: `c${f}_${x}`, floor: f, x, y: CORRIDOR_Y }));
    xs.slice(1).forEach((x, i) => add(`c${f}_${xs[i]}`, `c${f}_${x}`, (x - xs[i]) / 4));
  }
  PLACES.forEach((pl) => {
    if (pl.attach) { const t = placeById(pl.attach)!; add(pl.id, t.id, Math.abs(pl.y - t.y) / 4); }
    else add(pl.id, `c${pl.floor}_${pl.x}`, Math.abs(pl.y - CORRIDOR_Y) / 4);
  });
  add("lift_g", "lift_1", 15); add("lift_1", "lift_2", 15);
  add("stairs_g", "stairs_1", 8, true); add("stairs_1", "stairs_2", 8, true);
  return { nodes, adj };
}

export const SHORTCUTS = ["emergency", "help", "pharmacy", "lab", "xray", "toilets_g", "water_g"];
