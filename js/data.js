/* ============================================================
   GALI CRICKET — Mohalla League
   data.js — ALL game content lives here.
   Edit commentary, teams and shop items freely:
   the game logic in game.js never hard-codes content.
   ============================================================ */

/* ---------- COMMENTARY ----------
   Roman Urdu mohalla slang, family-friendly.
   One random line is shown after every matching event. */
const COMMENTARY = {
  six: [
    "Kya shot mara he yar! Ball gali se bahar!",
    "CHHAKKA! Rickshaw wale ne bhi taali bajai!",
    "Bhai ne ball ko asman ki sair kara di!",
    "Gali ke bachay chillaye: EK AUR! EK AUR!",
    "Ye shot dekh kar chaye wala bhi ruk gaya!",
    "Ball seedha teesri manzil ki khirki tak!",
    "Bowling karne wala soch raha he: me yahan kyun aya?",
  ],
  four: [
    "CHOWKA! Boundary par khara larka sirf dekhta reh gaya!",
    "Kya timing he! Ball race lagati hui bahar!",
    "Chaar run! Galli me shor mach gaya!",
    "Batsman ne bowler ko ankh maar di lagta he!",
    "Seedha boundary! Koi rok nahi saka!",
    "Ye wala shot coaching class me sikhana chahiye!",
  ],
  runs: [
    "Samajhdari se ek run le liya.",
    "Chota sa shot, lekin run mil gaya!",
    "Bhaag bhaag ke run pura kiya!",
    "Score board ahista ahista barh raha he.",
    "Gali cricket me har run sone jaisa he!",
    "Achi running! Dono taraf se full speed!",
  ],
  out: [
    "OUT yar! Batsman sadmey me wapas ja raha he.",
    "Gali khamosh... sirf ek larka has raha he.",
    "Ye wicket bowler ne kamaal se li!",
    "Batsman: 'Yar ball nazar hi nahi ai!'",
    "OUT! Ab agli baari, tension barh gayi!",
    "Wicket gir gayi! Mohalla do hisso me bant gaya!",
  ],
  dot: [
    "Dot ball... pressure barh gaya!",
    "Ball nikal gayi, bat hawa me ghuma!",
    "Bowler ne is dafa jeet liya ye wala muqabla.",
    "Koi run nahi! Batsman ne sir hila diya.",
    "Dot ball — crowd ne lambi saans li.",
    "Ye ball to pura miss samajh hi nahi aya!",
  ],
  win: [
    "JEET GAYE! Mohalla me jashan shuru!",
    "Kya match tha! Aaj raat chaye pakki!",
    "Champions wali feeling! Gali Cricket zindabad!",
    "Target pura! Bowler team khamosh, gali roshan!",
    "Aakhri lamhe tak tension, phir JEET!",
    "Ye jeet pure mohalle ke naam!",
  ],
  lose: [
    "Haar gaye yar... lekin kya match tha!",
    "Thoda sa reh gaya! Agli dafa pakka!",
    "Mohalla udaas, lekin umeed zinda he.",
    "Aaj bowler jeet gaya, kal hamari baari!",
    "Koi baat nahi — gali cricket me haar bhi seekh he.",
    "Bas chand run kam par gaye. Dobara try karo!",
  ],
};

/* ---------- TEAMS ----------
   Player picks one mohalla team (cosmetic: name + jersey colors). */
const TEAMS = [
  { id: "korangi",  name: "Korangi Kings",     short: "KK", primary: "#ff2e88", secondary: "#ffd400" },
  { id: "malir",    name: "Malir Tigers",      short: "MT", primary: "#ff7b00", secondary: "#00c853" },
  { id: "lyari",    name: "Lyari Lions",       short: "LL", primary: "#00b0ff", secondary: "#ff2e88" },
  { id: "nazimabad",name: "Nazimabad Nawabs",  short: "NN", primary: "#ab47ff", secondary: "#ffd400" },
];

/* ---------- SHOP ITEMS ----------
   type: "bat" | "ball" | "jersey" | "stadium"
   price: coins (0 = free/default). premium: true = "Coming Soon"
   (real-money placeholder for the future app version — cannot be bought now).
   visual keys are read by game.js / style.css:
     bat:     color = bat blade color
     ball:    color = tape-ball base color, tape = tape strip color
     jersey:  color = player jersey color (home screen + match strip)
     stadium: bg1/bg2 = pitch background gradient, name shown on match screen */
const SHOP_ITEMS = [
  /* --- Bats --- */
  { id: "bat-lakri",   type: "bat", name: "Lakri ka Bat",     price: 0,    premium: false, color: "#c98d4b" },
  { id: "bat-kashmir", type: "bat", name: "Kashmir Willow",   price: 300,  premium: false, color: "#e8b06e" },
  { id: "bat-golden",  type: "bat", name: "Golden Bat",       price: 800,  premium: false, color: "#ffd400" },
  { id: "bat-diamond", type: "bat", name: "Diamond Edition",  price: 0,    premium: true,  color: "#9be7ff" },

  /* --- Tape-ball skins --- */
  { id: "ball-classic", type: "ball", name: "Classic Peela Tape Ball", price: 0,   premium: false, color: "#ffd400", tape: "#ffffff" },
  { id: "ball-neon",    type: "ball", name: "Neon Green Ball",         price: 250, premium: false, color: "#69f06e", tape: "#0b3d2e" },
  { id: "ball-truck",   type: "ball", name: "Truck-Art Print Ball",    price: 500, premium: false, color: "#ff2e88", tape: "#ffd400" },
  { id: "ball-gold",    type: "ball", name: "Golden Trophy Ball",      price: 0,   premium: true,  color: "#ffcf3f", tape: "#b8860b" },

  /* --- Jerseys --- */
  { id: "jersey-team",  type: "jersey", name: "Team Jersey (Default)", price: 0,   premium: false, color: "" },
  { id: "jersey-gulabi",type: "jersey", name: "Gulabi Jersey",         price: 200, premium: false, color: "#ff2e88" },
  { id: "jersey-neela", type: "jersey", name: "Neela Jersey",          price: 200, premium: false, color: "#00b0ff" },
  { id: "jersey-vip",   type: "jersey", name: "VIP Truck-Art Jersey",  price: 0,   premium: true,  color: "#ff7b00" },

  /* --- Stadiums (backgrounds) --- */
  { id: "stadium-gali5",   type: "stadium", name: "Gali No. 5",    price: 0,   premium: false, bg1: "#0e5a3c", bg2: "#083322" },
  { id: "stadium-malir",   type: "stadium", name: "Malir Ground",  price: 350, premium: false, bg1: "#7a4a12", bg2: "#3d2509" },
  { id: "stadium-lyari",   type: "stadium", name: "Lyari Stadium", price: 600, premium: false, bg1: "#123a6e", bg2: "#081f3d" },
  { id: "stadium-beach",   type: "stadium", name: "Beach Side",    price: 900, premium: false, bg1: "#0e6e6e", bg2: "#073d4d" },
];

/* ---------- COIN RULES ---------- */
const COIN_RULES = {
  startBalance: 100,
  perRun: 2,        // +2 coins for every run scored
  perFourBonus: 10, // extra on a four
  perSixBonus: 20,  // extra on a six
  winBonus: 100,
  dailyBonus: 50,   // once per day, on first match start
  highScoreBonus: 150,
};

/* ---------- BALL TYPES ----------
   duration = ms for the ball to travel bowler -> batsman.
   Base durations; the game speeds them up slightly ball by ball. */
const BALL_TYPES = [
  { id: "fast",   label: "Tez ball!",   duration: 950,  arc: 0.10 },
  { id: "slow",   label: "Slow ball...", duration: 1400, arc: 0.35 },
  { id: "bouncer",label: "BOUNCER!",    duration: 1050, arc: 0.55 },
  { id: "yorker", label: "YORKER!",     duration: 800,  arc: 0.04 },
];
