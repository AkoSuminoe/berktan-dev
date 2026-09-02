/*
 * Personal side of the Tokyo trip: shopping, dinners, and which day each one
 * lands on.
 *
 * Source: `tokyo-trip-brief.md` in the repo root, which supplies the raw list.
 * Nothing there was assigned to a date; the assignment below is the work, and
 * it is resolved against the WWC programme in `tokyo-itinerary.ts`.
 *
 * Import-free on purpose. Day ids match `tokyoDays`, so the two modules line up
 * by convention rather than by a dependency, and either can be read alone.
 */

/** JPY per GBP. One constant, because the rate moves and the brief asks. */
export const EXCHANGE_RATE = 215;

/**
 * Japan's consumption tax.
 *
 * Tax-free shopping REMOVES this from a tax-inclusive price, so the saving is
 * `price - price / 1.1`, about 9.09% of the sticker. It is not 10% of the
 * sticker: Japanese shelf prices have been legally tax-inclusive since 2021.
 * The brief's figures assumed the larger number. Do not "simplify" this back
 * to `price * 0.1`.
 */
export const TAX_RATE = 0.1;

/** Minimum pre-tax spend per shop per day to qualify, passport required. */
export const TAX_FREE_MINIMUM_JPY = 5000;

export function toGbp(jpy: number): number {
  return jpy / EXCHANGE_RATE;
}

/** What comes off a tax-inclusive price when the relief is applied. */
export function taxFreeSaving(jpy: number): number {
  return jpy - jpy / (1 + TAX_RATE);
}

export type Weekday =
  | 'Mon'
  | 'Tue'
  | 'Wed'
  | 'Thu'
  | 'Fri'
  | 'Sat'
  | 'Sun';

/* ------------------------------------------------------------------ */
/* Shops                                                               */
/* ------------------------------------------------------------------ */

export type Shop = {
  id: string;
  name: string;
  area: string;
  address: string;
  coords: { lat: number; lng: number };
  /** 24h clock. */
  opens: string;
  closes: string;
  closedDays?: Weekday[];
  note?: string;
};

export const shops: Shop[] = [
  {
    id: 'ikebe',
    name: 'Ikebe Music Flagship',
    area: 'Shibuya',
    address: 'Dogenzaka 1-7-4',
    coords: { lat: 35.6575, lng: 139.6995 },
    opens: '11:00',
    closes: '20:00',
    note: 'All four pedal items on one receipt, so the tax-free minimum is cleared once.',
  },
  {
    id: 'ikebe-reuse',
    name: 'Ikebe Reuse',
    area: 'Shibuya',
    address: 'Sakuragaokacho 24-2, 5-6F',
    coords: { lat: 35.6568, lng: 139.7008 },
    opens: '11:00',
    closes: '20:00',
    note: 'Second-hand. Same street as the hotel, so it costs nothing to look in.',
  },
  {
    id: 'ishibashi',
    name: 'Ishibashi Music Ochanomizu',
    area: 'Kanda Surugadai',
    address: 'Kanda Surugadai 2-2',
    coords: { lat: 35.6991, lng: 139.7632 },
    opens: '11:00',
    closes: '19:00',
    note: 'Fallback only. 2F effects floor, tax-free, strong used selection.',
  },
  {
    id: 'amiami',
    name: 'amiami Akihabara Figure Tower',
    area: 'Akihabara',
    address: 'Sotokanda 1-15-3',
    coords: { lat: 35.6979, lng: 139.7715 },
    opens: '10:00',
    closes: '21:00',
    note: 'Tax-free registers on floors 1, 5 and 7.',
  },
  {
    id: 'mandarake',
    name: 'Mandarake Nakano Broadway',
    area: 'Nakano',
    address: 'Nakano 5-52-15',
    coords: { lat: 35.709, lng: 139.6657 },
    opens: '12:00',
    closes: '20:00',
    note: 'Opens at noon, never before. Usually 3,000 to 5,000 yen under AmiAmi.',
  },
  {
    id: 'nakamise',
    name: 'Nakamise Shopping Street',
    area: 'Asakusa',
    address: 'Asakusa 1-36-3',
    coords: { lat: 35.7118, lng: 139.7965 },
    opens: '10:00',
    closes: '17:00',
    note: 'Closes at 17:00. Each stall counts as its own shop for tax-free, so both fans must come from one stall.',
  },
  {
    id: 'daimaru',
    name: 'Daimaru Tokyo, B1 depachika',
    area: 'Marunouchi',
    address: 'Marunouchi 1-9-1',
    coords: { lat: 35.6815, lng: 139.7689 },
    opens: '10:00',
    closes: '20:00',
    note: 'Wider selection than the airport. Ice packs 100 yen, tax-free desk on 12F.',
  },
  {
    id: 'haneda',
    name: 'Haneda Airport, Terminal 3',
    area: 'Ota',
    address: 'Hanedakuko 2-6-5',
    coords: { lat: 35.5494, lng: 139.7798 },
    opens: '05:00',
    closes: '23:59',
    note: 'Royce only, on the way out. Confirm the shop opens before an 08:50 departure.',
  },
];

export function findShop(id: string): Shop | undefined {
  return shops.find((shop) => shop.id === id);
}

/* ------------------------------------------------------------------ */
/* Dinners                                                             */
/* ------------------------------------------------------------------ */

export type Dinner = {
  id: string;
  name: string;
  kind: string;
  jpy: number;
  area: string;
  coords?: { lat: number; lng: number };
  opens?: string;
  closes?: string;
  closedDays?: Weekday[];
  note?: string;
  /**
   * Set when the trip has no evening for it. Three of the eight budgeted
   * dinners fall here: two evenings are fed by the school and the last has a
   * 05:00 coach. Kept in the data rather than deleted, so the page can say
   * where 9,000 yen of the budget went.
   */
  droppedReason?: string;
};

export const dinners: Dinner[] = [
  {
    id: 'tonkatsu',
    name: 'Tonkatsu Marugo',
    kind: 'Tonkatsu',
    jpy: 2500,
    area: 'Akihabara',
    coords: { lat: 35.6991, lng: 139.7697 },
    opens: '17:00',
    closes: '20:00',
    closedDays: ['Mon', 'Tue'],
    note: 'Dinner service is 17:00 to 20:00 only.',
  },
  {
    id: 'izakaya',
    name: 'Nakanonokemuri',
    kind: 'Izakaya, yakitori',
    jpy: 4000,
    area: 'Nakano',
    coords: { lat: 35.7071, lng: 139.6666 },
    opens: '16:00',
    closes: '24:00',
    note: 'One drink per person is required.',
  },
  {
    id: 'kaiten',
    name: 'Mawashi Sushi Katsu, Seibu Shibuya 8F',
    kind: 'Kaiten sushi',
    jpy: 2200,
    area: 'Shibuya',
    coords: { lat: 35.6602, lng: 139.7005 },
    opens: '11:00',
    closes: '22:00',
    note: 'Ticket queue system.',
  },
  {
    id: 'ramen',
    name: 'Jikasei MENSHO, Shibuya PARCO B1',
    kind: 'Ramen',
    jpy: 1600,
    area: 'Shibuya',
    coords: { lat: 35.6621, lng: 139.6988 },
    opens: '11:00',
    closes: '23:00',
    note: 'Queues. Arriving around 17:00 beats them.',
  },
  {
    id: 'omakase',
    name: 'Sakura Sushiki',
    kind: 'Omakase, the one special night',
    jpy: 12000,
    area: 'Shibuya',
    coords: { lat: 35.6558, lng: 139.6995 },
    opens: '17:00',
    closes: '23:00',
    note: 'Needs a reservation two to three weeks ahead.',
  },
  {
    id: 'yakiniku',
    name: 'Shibuya Udagawacho',
    kind: 'Yakiniku',
    jpy: 5000,
    area: 'Shibuya',
    coords: { lat: 35.661, lng: 139.6985 },
    note: 'A la carte beats the all-you-can-eat sets.',
    droppedReason:
      'No evening left. Five free nights, eight dinners planned.',
  },
  {
    id: 'tempura',
    name: 'Asakusa Amairo',
    kind: 'Tempura',
    jpy: 2500,
    area: 'Asakusa',
    coords: { lat: 35.7117, lng: 139.7957 },
    opens: '17:30',
    closes: '21:00',
    closedDays: ['Tue'],
    droppedReason:
      'Closed Tuesday, and every other free evening is already spoken for or too far from Asakusa.',
  },
  {
    id: 'light',
    name: 'Curry, gyudon or monjayaki near the hotel',
    kind: 'Light',
    jpy: 1500,
    area: 'Shibuya',
    droppedReason:
      'The nights this was meant to fill are the school dinner and the alumni evening.',
  },
];

export function findDinner(id: string): Dinner | undefined {
  return dinners.find((dinner) => dinner.id === id);
}

/* ------------------------------------------------------------------ */
/* Shopping list                                                       */
/* ------------------------------------------------------------------ */

export type ShoppingCategory = 'pedals' | 'collection' | 'gifts';

export type ShoppingItem = {
  id: string;
  label: string;
  jpy: number;
  category: ShoppingCategory;
  shopId?: string;
  note?: string;
  /** Whether the consumption tax can be taken off at the register. */
  taxFree: boolean;
};

export const CATEGORY_LABELS: Record<ShoppingCategory, string> = {
  pedals: 'Pedals and accessories',
  collection: 'Collection and hobby',
  gifts: 'Gifts and omiyage',
};

export const shoppingItems: ShoppingItem[] = [
  // Pedals, all on one Ikebe receipt.
  {
    id: 'buy-ce2w',
    label: 'BOSS CE-2W Waza Craft, chorus',
    jpy: 26400,
    category: 'pedals',
    shopId: 'ikebe',
    note: 'Made in Japan',
    taxFree: true,
  },
  {
    id: 'buy-mt2w',
    label: 'BOSS MT-2W Waza Craft, distortion',
    jpy: 20800,
    category: 'pedals',
    shopId: 'ikebe',
    note: 'Made in Japan',
    taxFree: true,
  },
  {
    id: 'buy-crybaby',
    label: 'Dunlop Cry Baby GCB95, wah',
    jpy: 16500,
    category: 'pedals',
    shopId: 'ikebe',
    note: 'List 19,800. Seen at 14,801. Weighs 1.7 kg on its own.',
    taxFree: true,
  },
  {
    id: 'buy-picks',
    label: 'Master 8 Japan picks, 10',
    jpy: 5000,
    category: 'pedals',
    shopId: 'ikebe',
    note: 'Made in Japan',
    taxFree: true,
  },

  // Collection.
  {
    id: 'buy-figure-new',
    label: 'Premium scale figure, Alter or Good Smile',
    jpy: 25000,
    category: 'collection',
    shopId: 'mandarake',
    note: '1/7 market range 16,800 to 30,000. Compare AmiAmi against Mandarake first.',
    taxFree: true,
  },
  {
    id: 'buy-figure-used',
    label: 'Second-hand boxed figure',
    jpy: 15000,
    category: 'collection',
    shopId: 'mandarake',
    note: '60 to 70% of new price.',
    taxFree: true,
  },
  {
    id: 'buy-yunomi',
    label: 'Yunomi, tea cup',
    jpy: 3000,
    category: 'collection',
    shopId: 'daimaru',
    taxFree: true,
  },
  {
    id: 'buy-matcha',
    label: 'Uji matcha, 40g',
    jpy: 3000,
    category: 'collection',
    shopId: 'daimaru',
    taxFree: true,
  },

  // Gifts.
  {
    id: 'buy-sensu',
    label: 'Sensu, folding fan, 2 boxed',
    jpy: 8000,
    category: 'gifts',
    shopId: 'nakamise',
    note: 'For mum and aunt. Both from ONE stall or the tax-free minimum is missed.',
    taxFree: true,
  },
  {
    id: 'buy-cigarettes',
    label: 'Japanese cigarettes, 1 carton',
    jpy: 6500,
    category: 'gifts',
    note: 'Any konbini with passport. UK allowance is exactly 200, so one carton and no more.',
    taxFree: false,
  },
  {
    id: 'buy-royce',
    label: "Royce' Nama Chocolate",
    jpy: 2700,
    category: 'gifts',
    shopId: 'haneda',
    note: 'Cold chain. Bought on the way out so it spends hours, not a day, out of a fridge.',
    taxFree: false,
  },
  {
    id: 'buy-tokyo-banana',
    label: 'Tokyo Banana, 8-pack',
    jpy: 2600,
    category: 'gifts',
    shopId: 'daimaru',
    taxFree: true,
  },
  {
    id: 'buy-yokumoku',
    label: 'Yoku Moku Cigare, 30-pack',
    jpy: 2200,
    category: 'gifts',
    shopId: 'daimaru',
    taxFree: true,
  },
  {
    id: 'buy-spare',
    label: 'Spare, unallocated',
    jpy: 2500,
    category: 'gifts',
    note: 'Deliberately unassigned. Something will turn up.',
    taxFree: false,
  },
];

/** Not tickable: an allowance rather than a purchase. */
export const dailyAllowance = [
  { id: 'suica', label: 'Suica and local transport', jpy: 9000, note: 'About 1,000 a day' },
  { id: 'konbini', label: 'Konbini, coffee, water', jpy: 7000 },
];

/* ------------------------------------------------------------------ */
/* The assignment                                                      */
/* ------------------------------------------------------------------ */

export type Stop = {
  id: string;
  label: string;
  shopId?: string;
  /** Shopping items expected to be bought here. */
  itemIds?: string[];
  detail?: string;
  /** A research stop that buys nothing, per sequencing rule 2. */
  lookOnly?: boolean;
};

export type PersonalDay = {
  /** Matches TokyoDay.id in tokyo-itinerary.ts. */
  dayId: string;
  date: string;
  weekday: Weekday;
  /** One line on why the day is shaped the way it is. */
  rationale: string;
  stops: Stop[];
  dinnerId?: string;
  /** Set when the evening is already committed by the programme. */
  eveningNote?: string;
};

export const personalDays: PersonalDay[] = [
  {
    dayId: 'day-1',
    date: '5 Sept',
    weekday: 'Sat',
    rationale:
      'Sensoji is already on the programme and Nakamise is at its gate, so the fans cost no extra travel. Akihabara is ten minutes on from Asakusa, and Saturday is one of the few days Marugo is open.',
    stops: [
      {
        id: 'stop-nakamise',
        label: 'Nakamise: sensu x2',
        shopId: 'nakamise',
        itemIds: ['buy-sensu'],
        detail: 'Walk the full street before buying. Closes 17:00.',
      },
      {
        id: 'stop-amiami',
        label: 'amiami Akihabara: note the figure options',
        shopId: 'amiami',
        lookOnly: true,
        detail:
          'Prices and stock only. Rule 2: do not buy on the first sighting.',
      },
    ],
    dinnerId: 'tonkatsu',
  },
  {
    dayId: 'day-2',
    date: '6 Sept',
    weekday: 'Sun',
    rationale:
      'The only full free day, which is exactly what the pedals need: if the flagship is out of stock there is still time to reach Ochanomizu the same day.',
    stops: [
      {
        id: 'stop-ikebe',
        label: 'Ikebe Shibuya: all four pedal items, one receipt',
        shopId: 'ikebe',
        itemIds: ['buy-ce2w', 'buy-mt2w', 'buy-crybaby', 'buy-picks'],
        detail: 'One receipt keeps it to a single tax-free claim.',
      },
      {
        id: 'stop-ishibashi',
        label: 'Fallback: Ishibashi Ochanomizu',
        shopId: 'ishibashi',
        lookOnly: true,
        detail: 'Only if Ikebe is out of stock. Closes 19:00, so go early.',
      },
    ],
    eveningNote: 'Group briefing 17:00, then the group dinner. School provided.',
  },
  {
    dayId: 'day-3',
    date: '7 Sept',
    weekday: 'Mon',
    rationale:
      'Mandarake and the izakaya are the same district, and Marugo is shut on Mondays anyway, so Nakano is the natural evening.',
    stops: [
      {
        id: 'stop-mandarake',
        label: 'Mandarake Nakano: compare, then buy',
        shopId: 'mandarake',
        itemIds: ['buy-figure-new', 'buy-figure-used'],
        detail:
          'Opens at noon. Compare against Saturday at AmiAmi and buy whichever wins.',
      },
    ],
    dinnerId: 'izakaya',
  },
  {
    dayId: 'day-4',
    date: '8 Sept',
    weekday: 'Tue',
    rationale:
      'Kept clear on purpose. Rule 2 needs a day to act on the comparison, and both Marugo and Amairo are shut on Tuesdays.',
    stops: [
      {
        id: 'stop-figure-buffer',
        label: 'Buffer: buy at whichever shop won',
        lookOnly: true,
        detail:
          'Only needed if AmiAmi beat Mandarake on Monday. Otherwise a free evening.',
      },
    ],
    dinnerId: 'kaiten',
  },
  {
    dayId: 'day-5',
    date: '9 Sept',
    weekday: 'Wed',
    rationale:
      'The programme runs east to Kiyosumi, so the evening stays cheap and close to the hotel rather than crossing the city again.',
    stops: [],
    dinnerId: 'ramen',
  },
  {
    dayId: 'day-6',
    date: '10 Sept',
    weekday: 'Thu',
    rationale:
      'The last free evening, in Shibuya, with the shopping finished so there is nothing to carry into a counter meal.',
    stops: [],
    dinnerId: 'omakase',
  },
  {
    dayId: 'day-7',
    date: '11 Sept',
    weekday: 'Fri',
    rationale:
      'Omiyage last, per rule 3. One Daimaru receipt clears the tax-free minimum comfortably.',
    stops: [
      {
        id: 'stop-daimaru',
        label: 'Daimaru B1: yunomi, matcha, Tokyo Banana, Yoku Moku',
        shopId: 'daimaru',
        itemIds: [
          'buy-yunomi',
          'buy-matcha',
          'buy-tokyo-banana',
          'buy-yokumoku',
        ],
        detail: 'One receipt, 10,800 yen. Tax-free desk is on 12F.',
      },
    ],
    eveningNote: 'Alumni networking event at Ce La Vi.',
  },
  {
    dayId: 'day-8',
    date: '12 Sept',
    weekday: 'Sat',
    rationale:
      'Coach at 05:00. The only thing that fits is the chocolate, and buying it here cuts its time out of a fridge from over a day to the length of the flight.',
    stops: [
      {
        id: 'stop-haneda',
        label: 'Haneda: Royce Nama Chocolate',
        shopId: 'haneda',
        itemIds: ['buy-royce'],
        detail: 'Ask for an ice pack. Confirm the shop opens before 08:50.',
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Totals                                                              */
/* ------------------------------------------------------------------ */

const assignedDinnerIds = new Set(
  personalDays
    .map((day) => day.dinnerId)
    .filter((id): id is string => Boolean(id))
);

export const assignedDinners = dinners.filter((dinner) =>
  assignedDinnerIds.has(dinner.id)
);

export const droppedDinners = dinners.filter((dinner) =>
  Boolean(dinner.droppedReason)
);

const sum = (values: number[]) => values.reduce((total, n) => total + n, 0);

export const budget = {
  shopping: sum(shoppingItems.map((item) => item.jpy)),
  dinners: sum(assignedDinners.map((dinner) => dinner.jpy)),
  daily: sum(dailyAllowance.map((line) => line.jpy)),
  get sticker(): number {
    return this.shopping + this.dinners + this.daily;
  },
  /** What tax-free takes off, on the eligible items only. */
  get taxFreeSaving(): number {
    return Math.round(
      taxFreeSaving(
        sum(shoppingItems.filter((item) => item.taxFree).map((i) => i.jpy))
      )
    );
  },
  get afterTaxFree(): number {
    return this.sticker - this.taxFreeSaving;
  },
};

/* ------------------------------------------------------------------ */
/* Constraint checking                                                 */
/* ------------------------------------------------------------------ */

export type Violation = {
  id: string;
  severity: 'error' | 'warning' | 'note';
  title: string;
  detail: string;
};

/*
 * Recomputed from the data rather than written out by hand, so editing the
 * assignment cannot quietly break a rule. The table in the plan file is the
 * reasoning; this is the check.
 */
export function findViolations(): Violation[] {
  const found: Violation[] = [];

  for (const day of personalDays) {
    // A dinner on a day its restaurant is shut.
    if (day.dinnerId) {
      const dinner = findDinner(day.dinnerId);
      if (dinner?.closedDays?.includes(day.weekday)) {
        found.push({
          id: `closed-${day.dayId}`,
          severity: 'error',
          title: `${dinner.name} is closed on ${day.weekday}`,
          detail: `Assigned to ${day.date}. Move it or pick another dinner.`,
        });
      }
    }

    // A stop at a shop that is shut that weekday.
    for (const stop of day.stops) {
      if (!stop.shopId) continue;
      const shop = findShop(stop.shopId);
      if (shop?.closedDays?.includes(day.weekday)) {
        found.push({
          id: `shop-closed-${stop.id}`,
          severity: 'error',
          title: `${shop.name} is closed on ${day.weekday}`,
          detail: `Assigned to ${day.date}.`,
        });
      }
    }
  }

  // Rule 1: pedals inside the first three days.
  const pedalDayIndex = personalDays.findIndex((day) =>
    day.stops.some((stop) =>
      stop.itemIds?.some((id) =>
        shoppingItems.find((item) => item.id === id && item.category === 'pedals')
      )
    )
  );
  if (pedalDayIndex > 2) {
    found.push({
      id: 'rule-1',
      severity: 'error',
      title: 'Pedals fall outside the first three days',
      detail:
        'Rule 1. They are the biggest single spend and need time for the Ochanomizu fallback.',
    });
  }

  // Rule 2: look at AmiAmi before committing at Mandarake.
  const amiamiIndex = personalDays.findIndex((day) =>
    day.stops.some((stop) => stop.shopId === 'amiami')
  );
  const mandarakeIndex = personalDays.findIndex((day) =>
    day.stops.some((stop) => stop.shopId === 'mandarake')
  );
  if (amiamiIndex === -1 || mandarakeIndex === -1 || amiamiIndex > mandarakeIndex) {
    found.push({
      id: 'rule-2',
      severity: 'error',
      title: 'Figure comparison runs the wrong way round',
      detail:
        'Rule 2. AmiAmi is the look, Mandarake is the decision. The same item can differ by 3,000 to 5,000 yen.',
    });
  }

  // Rule 6: omakase should not land on a heavy programme day.
  const omakaseDay = personalDays.find((day) => day.dinnerId === 'omakase');
  if (omakaseDay) {
    found.push({
      id: 'rule-6',
      severity: 'warning',
      title: 'Omakase falls on a programme day',
      detail: `Rule 6 cannot be satisfied: every free evening is a programme day. ${omakaseDay.date} is the least bad, being the last one and closest to the hotel.`,
    });
  }

  // Dinners with nowhere to go.
  for (const dinner of droppedDinners) {
    found.push({
      id: `dropped-${dinner.id}`,
      severity: 'note',
      title: `Dropped: ${dinner.kind}, ${dinner.name}`,
      detail: dinner.droppedReason ?? '',
    });
  }

  // Things the documents cannot settle.
  found.push(
    {
      id: 'unknown-end-times',
      severity: 'warning',
      title: 'Programme end times are unknown',
      detail:
        'The WWC PDFs are image-only scans, so no evening here claims a start time. Mandarake on Monday is the one stop that could get tight: it closes at 20:00.',
    },
    {
      id: 'nakamise-taxfree',
      severity: 'warning',
      title: 'Both fans must come from one Nakamise stall',
      detail:
        'Each stall counts as its own shop, so a 5,000 yen minimum applies to each. Split across two and the relief is lost.',
    },
    {
      id: 'baggage',
      severity: 'warning',
      title: 'The Cry Baby alone is 1.7 kg',
      detail:
        'Four pedals travel home as one lump. Check the return allowance before the airport, not at the desk.',
    },
    {
      id: 'royce-hours',
      severity: 'warning',
      title: 'Confirm the Haneda Royce shop opens before 08:50',
      detail:
        'Fallback is Daimaru the evening before, which puts the chocolate out of a fridge for over a day.',
    },
    {
      id: 'lunch-free-days',
      severity: 'note',
      title: 'Lunch on 5 and 6 September may not be covered',
      detail:
        'The school covers lunch, but those are the two non-programme days. Roughly 3,000 yen the brief has not budgeted.',
    }
  );

  return found;
}

/* ------------------------------------------------------------------ */
/* Pre-trip                                                            */
/* ------------------------------------------------------------------ */

export const preTripChecklist = [
  {
    id: 'pre-stock',
    label: 'Email Ikebe and Ishibashi to confirm CE-2W and MT-2W stock',
  },
  {
    id: 'pre-omakase',
    label: 'Book the omakase two to three weeks ahead',
    detail: 'TableCheck, or ask the hotel. Thursday 10 September.',
  },
  { id: 'pre-bank', label: 'Notify the bank of overseas card use' },
  {
    id: 'pre-baggage',
    label: 'Check the return baggage allowance',
    detail: 'The Cry Baby is 1.7 kg before the other three pedals.',
  },
  {
    id: 'pre-cash',
    label: 'Bring 50,000 yen cash, rest on card',
    detail: '7-Eleven ATMs take foreign cards.',
  },
  {
    id: 'pre-passport',
    label: 'Passport on you at all times for tax-free',
  },
];

/**
 * Every id the personal plan can produce.
 *
 * This feeds the localStorage validation in TokyoPlanner, which discards any
 * saved id it does not recognise. Miss an id here and its checkbox writes
 * fine, then vanishes on the next page load, which looks exactly like data
 * loss. Every tickable thing on the personal tab has to be in this list:
 * shopping items, dinners, the stops on each day, and the pre-trip tasks.
 */
export const personalItemIds: string[] = [
  ...shoppingItems.map((item) => item.id),
  ...assignedDinners.map((dinner) => `dinner-${dinner.id}`),
  ...personalDays.flatMap((day) => day.stops.map((stop) => stop.id)),
  ...preTripChecklist.map((task) => task.id),
];

/** Denominator for the personal tab's progress. */
export const personalItemCount = personalItemIds.length;
