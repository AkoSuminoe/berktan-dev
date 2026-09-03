/*
 * Nights and food: what to do once the programme lets out, plus the snack and
 * dessert list that belongs to no single day.
 *
 * Source: `tokyo-nights-brief.md` in the repo root. Where that brief corrects
 * facts the Personal tab was planned without, the correction lives in
 * `tokyo-personal.ts`; this module is the new material only.
 *
 * Imports one way, from `tokyo-personal.ts` and `tokyo-itinerary.ts`. Neither
 * imports back, so there is no cycle and each can still be read alone.
 *
 * Note the absence of coordinates. The first brief supplied them for shops and
 * restaurants, so `tokyo-personal.ts` maps by lat/lng; this one supplies street
 * addresses instead. Rather than geocode them into numbers nobody wrote down,
 * places here map by name and address, which is how `tokyo-itinerary.ts`
 * already handles a venue the documents name but do not locate.
 */

import { tokyoMeta } from '@/lib/tokyo-itinerary';
import { EXCHANGE_RATE, type Weekday, type Violation } from '@/lib/tokyo-personal';

export const HOTEL = tokyoMeta.hotel;

/** Tokyo in September: warm and wet. Drives the shelter flag on every venue. */
export const WEATHER = {
  averageHighC: 26,
  monthlyRainMm: 181,
  rainDays: 20,
};

/** A Maps search precise enough to land on the right branch of a chain. */
export function mapsQuery(name: string, address?: string): string {
  return address ? `${name}, ${address}, Tokyo` : `${name}, Tokyo`;
}

/**
 * Where a venue leaves you when it rains. `partly` means there is cover but the
 * good part of the room is not under it, which for a rooftop is the whole point.
 */
export type Shelter = 'indoor' | 'partly' | 'outdoor';

/* ------------------------------------------------------------------ */
/* Clock                                                               */
/* ------------------------------------------------------------------ */

function toMinutes(time: string): number {
  const parts = time.split(':');
  return Number(parts[0]) * 60 + Number(parts[1]);
}

/**
 * Closing time in minutes from the day's midnight, past 1440 when the venue
 * shuts after it.
 *
 * Half of this list closes at 01:00, 02:00 or 04:00, and '04:00' sorts below
 * '18:00' as a string, so every comparison below goes through here. Derived
 * rather than stored, because a `closesNextDay` flag is one more thing that can
 * end up disagreeing with the times sitting beside it.
 */
export function closingMinutes(opens: string, closes: string): number {
  const open = toMinutes(opens);
  const close = toMinutes(closes);
  return close <= open ? close + 1440 : close;
}

/** Human form for a closing time that runs past midnight. */
export function closingLabel(opens: string, closes: string): string {
  return closingMinutes(opens, closes) > 1440 ? `${closes} next day` : closes;
}

/* ------------------------------------------------------------------ */
/* Nightlife                                                           */
/* ------------------------------------------------------------------ */

export type Venue = {
  id: string;
  name: string;
  kind: string;
  address: string;
  opens: string;
  closes: string;
  closedDays?: Weekday[];
  /** Minutes on foot from the hotel, as given by the brief. */
  walkMinutes: number;
  /** Per person, on top of anything ordered. */
  coverJpy?: number;
  /** Only where a price is stated. An unknown price stays unknown. */
  typicalDrinkJpy?: number;
  shelter: Shelter;
  note: string;
};

export const nightlifeVenues: Venue[] = [
  {
    id: 'bellovisto',
    name: 'Bellovisto',
    kind: 'Hotel sky bar, 40F',
    address: 'Cerulean Tower, Sakuragaokacho 26-1',
    opens: '16:00',
    closes: '24:00',
    walkMinutes: 2,
    coverJpy: 2000,
    typicalDrinkJpy: 1700,
    shelter: 'indoor',
    note: 'Next door. Panoramic view, live piano some nights. The cover applies after 19:00 to non-guests, so one beer is really about 3,700 yen. Saturdays open at 13:30, Sundays close at 23:00.',
  },
  {
    id: 'celavi',
    name: 'CE LA VI Tokyo',
    kind: 'Rooftop bar and club',
    address: 'Tokyu Plaza Shibuya 17-18F, Dogenzaka 1-2-3',
    opens: '11:00',
    closes: '04:00',
    walkMinutes: 5,
    shelter: 'partly',
    note: "Friday's alumni venue, so the programme already puts you here. Views over the Scramble.",
  },
  {
    id: 'nonbei',
    name: 'Nonbei Yokocho',
    kind: 'Tiny-bar alley',
    address: 'Shibuya 1-25-25',
    opens: '17:00',
    closes: '04:00',
    closedDays: ['Sun'],
    walkMinutes: 10,
    shelter: 'indoor',
    note: "Drunkards' Alley. Dozens of bars with five or six seats each, Showa-era. The most memorable and the cheapest way to end a night, and the alley is covered, so rain does not matter.",
  },
  {
    id: 'tap-crowler',
    name: 'TAP & CROWLER',
    kind: 'Craft beer',
    address: 'Parasio Shibuya 1F, Udagawacho 6-20',
    opens: '15:00',
    closes: '23:30',
    walkMinutes: 12,
    shelter: 'indoor',
    note: 'Around 18 Japanese taps on rotation. Outside food is allowed, so a konbini run pairs with it. Quiet corner of Shibuya.',
  },
  {
    id: 'ol-oslo',
    name: 'OL by Oslo Brewing',
    kind: 'Craft beer',
    address: 'Mainin Bldg, Udagawacho 37-10',
    opens: '12:00',
    closes: '24:00',
    walkMinutes: 15,
    shelter: 'partly',
    note: 'Around 20 taps, a Scandinavian room, and a terrace with a taco truck parked outside. Saturdays run to 01:00. The terrace is the smoking side.',
  },
  {
    id: 'litts',
    name: 'LITTS BAR',
    kind: 'DJ bar',
    address: 'Kubo Bldg 2F, Udagawacho 33-14',
    opens: '18:00',
    closes: '02:00',
    walkMinutes: 13,
    shelter: 'indoor',
    note: 'Hip-hop, live DJ, international crowd, fairly priced drinks.',
  },
  {
    id: 'bar-legacy',
    name: 'BAR Legacy',
    kind: 'Cocktail and whisky',
    address: 'Sunx Prime Bldg B1, Shibuya 3-22-11',
    opens: '18:00',
    closes: '01:00',
    closedDays: ['Mon'],
    walkMinutes: 10,
    shelter: 'indoor',
    note: 'A proper cocktail bar with a large whisky selection, and quiet. A nightcap rather than a night out.',
  },
  {
    id: 'rooftop-soak',
    name: 'ROOFTOP SOAK',
    kind: 'Rooftop bar',
    address: 'Miyashita Park North 18F, Jingumae 6-20-10',
    opens: '17:00',
    closes: '01:00',
    walkMinutes: 15,
    coverJpy: 1000,
    shelter: 'outdoor',
    note: 'Music charge per person. Good cocktails and a view, but no indoor half to retreat into.',
  },
];

export function findVenue(id: string): Venue | undefined {
  return nightlifeVenues.find((venue) => venue.id === id);
}

/** Open on a given weekday. Hours are a separate question, checked per evening. */
export function isOpenOn(venue: Venue, weekday: Weekday): boolean {
  return !venue.closedDays?.includes(weekday);
}

/** Both 24 hours, so neither needs opening-hour handling. */
export const lateNightFood = [
  {
    id: 'makotoya',
    name: 'Ramen MAKOTOYA',
    address: 'J+R Side J Bldg 1F, Udagawacho 33-10',
    note: 'Table-side garlic and condiments, and no queue.',
  },
  {
    id: 'ichiran',
    name: 'ICHIRAN Shibuya',
    address: 'Iwamoto Bldg B1, Jinnan 1-22-7',
    note: 'Solo booths. Famous, so often a queue.',
  },
];

/* ------------------------------------------------------------------ */
/* Konbini                                                             */
/* ------------------------------------------------------------------ */

export const konbini = [
  {
    id: 'seven-sakuragaoka',
    name: '7-Eleven Shibuya Sakuragaoka',
    address: 'Sakuragaokacho 18-6',
    walkMinutes: 2,
    hasForeignAtm: true,
    note: 'The default. Large branch with a good hot-snack counter. Busy at lunch with students.',
  },
  {
    id: 'seven-cerulean',
    name: '7-Eleven Cerulean Tower',
    address: 'Sakuragaokacho 26-1',
    walkMinutes: 3,
    hasForeignAtm: false,
    note: 'Invisible from the street: up the second set of escalators, 2F. Bigger and calmer than the other one.',
  },
];

/* ------------------------------------------------------------------ */
/* Food to try                                                         */
/* ------------------------------------------------------------------ */

export type FoodPick = {
  id: string;
  name: string;
  vendor: string;
  address?: string;
  opens?: string;
  closes?: string;
  closedDays?: Weekday[];
  approxJpy: number;
  /** Matches TokyoDay.id when the brief ties it to a day. */
  tiedToDayId?: string;
  note: string;
};

/*
 * Ticked for interest, not for money. These ids are deliberately absent from
 * `nightSpendItemIds`: the yen for them already sits inside the konbini daily
 * allowance, and logging a 150 yen tea as a tracked expense would bury the
 * purchases that actually matter.
 */
export const konbiniPicks: FoodPick[] = [
  {
    id: 'food-tamago',
    name: 'Tamago sando',
    vendor: '7-Eleven',
    approxJpy: 250,
    note: 'The famous egg salad sandwich. Genuinely as good as claimed.',
  },
  {
    id: 'food-karaage',
    name: 'Karaage-kun',
    vendor: 'Lawson',
    approxJpy: 250,
    note: 'Fried chicken at the hot counter. Red, the spicy one, is the one.',
  },
  {
    id: 'food-onigiri',
    name: 'Onigiri, tuna mayo or salmon',
    vendor: 'Any',
    approxJpy: 180,
    note: 'Learn the three-step wrapper. Breakfast, lunch, 2am.',
  },
  {
    id: 'food-purin',
    name: 'Purin, custard pudding',
    vendor: 'Any',
    approxJpy: 200,
    note: 'Firmer and less sweet than the European kind.',
  },
  {
    id: 'food-yukimi',
    name: 'Yukimi Daifuku',
    vendor: 'Any freezer',
    approxJpy: 180,
    note: 'Mochi-wrapped ice cream.',
  },
  {
    id: 'food-melonpan-konbini',
    name: 'Melonpan',
    vendor: 'Any',
    approxJpy: 150,
    note: 'The konbini version, worth having for comparison with the Asakusa one.',
  },
  {
    id: 'food-strong-zero',
    name: 'Suntory Highball or Strong Zero',
    vendor: 'Any',
    approxJpy: 200,
    note: 'Strong Zero is 9% and does not taste like it. A warning, not a recommendation.',
  },
  {
    id: 'food-oi-ocha',
    name: 'Bottled matcha, Ito En Oi Ocha',
    vendor: 'Any',
    approxJpy: 150,
    note: 'Unsweetened green tea, sold cold everywhere.',
  },
  {
    id: 'food-calpis',
    name: 'Calpis',
    vendor: 'Any',
    approxJpy: 150,
    note: 'Yoghurt-ish soft drink. Divisive, worth one can.',
  },
];

export const desserts: FoodPick[] = [
  {
    id: 'food-melonpan-kagetsudo',
    name: 'Jumbo melonpan',
    vendor: 'Asakusa Kagetsudo',
    address: 'Asakusa 2-7-13',
    opens: '09:00',
    closes: '16:30',
    approxJpy: 300,
    tiedToDayId: 'day-1',
    note: 'Five minutes from Sensoji, which is already on the programme. Crisp shell, warm inside, eat it standing. 700 with ice cream.',
  },
  {
    id: 'food-melonpan-kaminarimon',
    name: 'Melonpan, second branch',
    vendor: 'Kagetsudo Kaminarimon',
    address: 'Asakusa 1-18-11',
    opens: '09:00',
    closes: '16:30',
    approxJpy: 300,
    tiedToDayId: 'day-1',
    note: 'Fallback, right by the Thunder Gate. The same bun, so only one of these counts.',
  },
  {
    id: 'food-taiyaki',
    name: 'Taiyaki',
    vendor: 'Asakusa Taiyaki Guraku',
    address: 'Nishiasakusa 2-3-2',
    opens: '11:00',
    closes: '18:00',
    approxJpy: 250,
    tiedToDayId: 'day-1',
    note: 'Thin crisp batter rather than the fluffy style. Red bean or custard.',
  },
  {
    id: 'food-ningyoyaki',
    name: 'Ningyo-yaki',
    vendor: 'Nakamise stalls',
    address: 'Asakusa 1-36-3',
    opens: '10:00',
    closes: '17:00',
    approxJpy: 500,
    tiedToDayId: 'day-1',
    note: 'Small filled sponge cakes made in front of you, while you are on the street anyway for the sensu. A box.',
  },
  {
    id: 'food-parfait',
    name: 'Fruit parfait',
    vendor: 'Kajitsuen Riberu',
    address: 'Shibuya Hikarie 6F, Shibuya 2-21-1',
    opens: '11:00',
    closes: '22:00',
    approxJpy: 1600,
    note: 'A proper fruit parlour, where the seasonal fruit is the point. 1,600 to 2,200. Queues at weekends.',
  },
  {
    id: 'food-crepe',
    name: 'Crepe',
    vendor: 'Marion Crepes, Takeshita St',
    address: 'Jingumae 1-6-15',
    opens: '10:00',
    closes: '21:00',
    approxJpy: 600,
    note: 'The original Takeshita Street stand. Evening is the shorter queue.',
  },
  {
    id: 'food-galette',
    name: 'Crepe or galette, sit-down',
    vendor: 'Mr. Crepy and Mrs. Galetti',
    address: 'Sarugakucho 2-14, 4F',
    opens: '10:00',
    closes: '18:00',
    closedDays: ['Mon', 'Tue'],
    approxJpy: 1000,
    note: 'Daikanyama side, ten minutes from the hotel. Calm, made to order, good coffee.',
  },
  {
    id: 'food-matcha-soft',
    name: 'Matcha soft serve',
    vendor: 'Anywhere in Asakusa or Nakano',
    approxJpy: 500,
    note: 'Ubiquitous. Ask for the darkest grade they have.',
  },
];

/** No fixed venue, so no hours to check and nothing to map. */
export const alsoWorthEating =
  'Takoyaki, dorayaki, menchi-katsu in Asakusa, dango at Nakamise, and konbini oden once the evenings cool.';

/* ------------------------------------------------------------------ */
/* The evening assignment                                              */
/* ------------------------------------------------------------------ */

export type EveningPlan = {
  /** Matches TokyoDay.id and PersonalDay.dayId. */
  dayId: string;
  date: string;
  weekday: Weekday;
  /** What the day already ends with, before any of this. */
  programmeEnding: string;
  venueId?: string;
  alternativeVenueId?: string;
  reason: string;
  /** Latest time back at the hotel, when something forces one. */
  hardStop?: string;
};

export const eveningPlans: EveningPlan[] = [
  {
    dayId: 'day-1',
    date: '5 Sept',
    weekday: 'Sat',
    programmeEnding: 'Sensoji, check-in, then tonkatsu in Akihabara',
    reason:
      'Nothing. You land at 07:00 after thirteen hours and forty minutes in the air. Day one is a konbini run and an early night, and the melonpan is already eaten in Asakusa.',
  },
  {
    dayId: 'day-2',
    date: '6 Sept',
    weekday: 'Sun',
    programmeEnding: 'Briefing at 17:00, then the group yakiniku',
    venueId: 'tap-crowler',
    alternativeVenueId: 'ol-oslo',
    reason:
      'A free day and a dinner you are not paying for, so a mild night costs nothing. Nonbei would be the obvious choice and it is shut on Sundays.',
  },
  {
    dayId: 'day-3',
    date: '7 Sept',
    weekday: 'Mon',
    programmeEnding: 'SEKAIA, then Nakano for Mandarake and the izakaya',
    reason:
      'The izakaya is the night. Nakano is twenty minutes back to Shibuya, and BAR Legacy, the one nightcap worth the walk, is shut on Mondays.',
  },
  {
    dayId: 'day-4',
    date: '8 Sept',
    weekday: 'Tue',
    programmeEnding: 'The unconfirmed session, then kaiten sushi',
    venueId: 'nonbei',
    reason:
      'The least-known programme day and the cheapest dinner, which makes it the right night for the best one. The alley runs to 04:00 on a Tuesday.',
  },
  {
    dayId: 'day-5',
    date: '9 Sept',
    weekday: 'Wed',
    programmeEnding: 'Empire Entertainment, Kiyosumi garden, reflection, ramen',
    venueId: 'litts',
    reason:
      'Midweek, and the programme runs east all day. Dinner is deliberately cheap and close to the hotel, so this one is only if there is anything left in you.',
  },
  {
    dayId: 'day-6',
    date: '10 Sept',
    weekday: 'Thu',
    programmeEnding: 'Uber APAC, TAUNS, then the omakase on the hotel street',
    reason:
      'The meal is the night. Twelve thousand yen at a counter three minutes from your bed does not need a bar after it, and Bellovisto would add most of another four.',
  },
  {
    dayId: 'day-7',
    date: '11 Sept',
    weekday: 'Fri',
    programmeEnding: 'Yanaka walk, then the alumni event at CE LA VI',
    venueId: 'celavi',
    hardStop: '23:00',
    reason:
      'The event is the night, and the programme has already chosen the venue. Pack before you leave for it, not after.',
  },
  {
    dayId: 'day-8',
    date: '12 Sept',
    weekday: 'Sat',
    programmeEnding: 'Coach at 05:00, Royce at Haneda',
    reason: 'There is no evening. You are over Siberia.',
  },
];

export function findEvening(dayId: string): EveningPlan | undefined {
  return eveningPlans.find((evening) => evening.dayId === dayId);
}

/** Kept in reserve, deliberately not tied to a night. */
export const unassignedVenues = nightlifeVenues.filter(
  (venue) => !eveningPlans.some((evening) => evening.venueId === venue.id)
);

/* ------------------------------------------------------------------ */
/* Totals                                                              */
/* ------------------------------------------------------------------ */

const sum = (values: number[]) => values.reduce((total, n) => total + n, 0);

/**
 * What the food lists come to if everything is tried once, minus the melonpan
 * fallback, which is the same bun from a second branch.
 */
export const foodListJpy =
  sum(konbiniPicks.map((pick) => pick.approxJpy)) +
  sum(
    desserts
      .filter((pick) => pick.id !== 'food-melonpan-kaminarimon')
      .map((pick) => pick.approxJpy)
  );

/** One tickable id per assigned night. */
export const nightIdFor = (dayId: string) => `night-${dayId}`;

/**
 * Every id the nights tab can produce, for the localStorage validation in
 * TokyoPlanner. Same contract as `personalItemIds`: an id missing here writes
 * fine and then vanishes on the next load, which reads as data loss.
 */
export const nightsItemIds: string[] = [
  ...eveningPlans
    .filter((evening) => Boolean(evening.venueId))
    .map((evening) => nightIdFor(evening.dayId)),
  ...konbiniPicks.map((pick) => pick.id),
  ...desserts.map((pick) => pick.id),
];

export const nightsItemCount = nightsItemIds.length;

/* ------------------------------------------------------------------ */
/* Constraint checking                                                 */
/* ------------------------------------------------------------------ */

/*
 * The night rules live here rather than in `findViolations`, because
 * `tokyo-personal.ts` cannot import this module without a cycle. Same
 * `Violation` shape and the same panel renders them, and the same principle
 * holds: recomputed from the data, so moving a venue to the wrong night says
 * so instead of going quietly wrong.
 */
export function findNightViolations(): Violation[] {
  const found: Violation[] = [];

  for (const evening of eveningPlans) {
    if (!evening.venueId) continue;
    const venue = findVenue(evening.venueId);
    if (!venue) continue;

    if (!isOpenOn(venue, evening.weekday)) {
      found.push({
        id: `night-closed-${evening.dayId}`,
        severity: 'error',
        title: `${venue.name} is closed on ${evening.weekday}`,
        detail: `Assigned to ${evening.date}. Move it or pick another venue.`,
      });
    }

    // Programme end times are undocumented, so anything shutting early is a risk.
    if (closingMinutes(venue.opens, venue.closes) < toMinutes('21:00')) {
      found.push({
        id: `night-early-${evening.dayId}`,
        severity: 'warning',
        title: `${venue.name} closes at ${venue.closes}`,
        detail: `That may already have happened by the time ${evening.date} lets out, and no programme end time is documented.`,
      });
    }

    if (evening.hardStop) {
      const stop = toMinutes(evening.hardStop);
      if (closingMinutes(venue.opens, venue.closes) > stop) {
        found.push({
          id: `night-hardstop-${evening.dayId}`,
          severity: 'warning',
          title: `${evening.date} has a ${evening.hardStop} hard stop, and ${venue.name} runs to ${venue.closes}`,
          detail:
            'A rooftop bar open until four, an alumni crowd and a 05:00 coach is a bad combination on paper. This is the single most likely thing to go wrong on the trip.',
        });
      }
    }

    if (venue.coverJpy) {
      const drink = venue.typicalDrinkJpy;
      found.push({
        id: `night-cover-${evening.dayId}`,
        severity: 'note',
        title: `${venue.name} charges a ${venue.coverJpy.toLocaleString('en-GB')} yen cover`,
        detail: drink
          ? `Per person, on top of a drink at about ${drink.toLocaleString('en-GB')} yen, so one round is really ${(venue.coverJpy + drink).toLocaleString('en-GB')} yen, roughly ${Math.round((venue.coverJpy + drink) / EXCHANGE_RATE)} pounds.`
          : 'Per person, before anything is ordered.',
      });
    }

    if (venue.shelter !== 'indoor') {
      found.push({
        id: `night-weather-${evening.dayId}`,
        severity: 'note',
        title: `${venue.name} is ${venue.shelter === 'outdoor' ? 'open-air' : 'only partly covered'}`,
        detail: `September brings about ${WEATHER.monthlyRainMm} mm across roughly ${WEATHER.rainDays} rain days, so have an indoor answer ready for ${evening.date}.`,
      });
    }
  }

  found.push(
    {
      id: 'nonbei-seats',
      severity: 'note',
      title: 'Nonbei Yokocho bars seat five or six people',
      detail:
        'Alone or in a pair, that is the appeal. A group of six does not fit into one bar, so split up at the mouth of the alley or pick somewhere else.',
    },
    {
      id: 'food-allowance',
      severity: 'note',
      title: `Trying every snack once comes to about ${foodListJpy.toLocaleString('en-GB')} yen`,
      detail:
        'Against a 7,000 yen konbini allowance, so it is covered, but not by much. These ticks are for interest and deliberately do not move the spend total.',
    }
  );

  return found;
}
