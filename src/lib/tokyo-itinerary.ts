/*
 * WWC Tokyo 2026 itinerary data.
 * Source of truth: "WWC_Tokyo_Itinerary_and_Speakers_bios.pdf" (page 2) and
 * "WWC_Tokyo_Student_Pack.pdf" (travel + accommodation pages). Every label
 * below is transcribed from those documents; nothing is invented. Where the
 * documents give no venue or address, `mapsQuery` is omitted on purpose.
 */

export type TokyoItem = {
  id: string;
  label: string;
  detail?: string;
  /** Google Maps search text. Only set when the document names the venue. */
  mapsQuery?: string;
};

export type TokyoDay = {
  id: string;
  day: number;
  date: string;
  weekday: string;
  title: string;
  items: TokyoItem[];
};

const HOTEL_QUERY =
  'Hyatt House Tokyo Shibuya, 3-3 Sakuragaoka-cho, Shibuya-ku, Tokyo';

export const tokyoMeta = {
  programme: 'Westminster Working Cultures',
  dateRange: '5 - 12 September 2026',
  hotel: {
    name: 'Hyatt House Tokyo Shibuya',
    address: '3-3 Sakuragaoka-cho, Shibuya-ku, Tokyo 150-0031',
    mapsQuery: HOTEL_QUERY,
  },
  outbound: {
    flight: 'BA007',
    route: 'LHR to HND',
    note: 'Departs Friday 4 Sept 09:20, lands Saturday 5 Sept 07:00 (13h 40m)',
  },
  inbound: {
    flight: 'BA008',
    route: 'HND to LHR',
    note: 'Departs Saturday 12 Sept 08:50, lands 15:40 at Terminal 5 (14h 50m)',
  },
};

export const tokyoDays: TokyoDay[] = [
  {
    id: 'day-1',
    day: 1,
    date: '5 Sept',
    weekday: 'Saturday',
    title: 'Arrival',
    items: [
      {
        id: 'd1-flight',
        label: 'Flight BA007, London Heathrow to Tokyo Haneda',
        detail:
          'Meet at Terminal 5 at 5:20 am. Departs Friday 4 Sept 09:20, lands Saturday 07:00',
      },
      {
        id: 'd1-sensoji',
        label: 'Sensoji Temple visit',
        detail: 'Morning visit',
        mapsQuery: 'Sensoji Temple, Asakusa, Tokyo',
      },
      {
        id: 'd1-checkin',
        label: 'Check in at Hyatt House Tokyo Shibuya',
        detail: '3-3 Sakuragaoka-cho, Shibuya-ku',
        mapsQuery: HOTEL_QUERY,
      },
      { id: 'd1-free', label: 'Free time' },
    ],
  },
  {
    id: 'day-2',
    day: 2,
    date: '6 Sept',
    weekday: 'Sunday',
    title: 'Settling in',
    items: [
      { id: 'd2-free', label: 'Free time' },
      {
        id: 'd2-briefing',
        label: 'Group briefing at Hyatt House Tokyo Shibuya',
        detail: '5:00 pm',
        mapsQuery: HOTEL_QUERY,
      },
      {
        id: 'd2-dinner',
        label: 'Group dinner at Halal Wagyu Yakiniku & Ramen Naruto',
        mapsQuery: 'Halal Wagyu Yakiniku & Ramen Naruto, Tokyo',
      },
    ],
  },
  {
    id: 'day-3',
    day: 3,
    date: '7 Sept',
    weekday: 'Monday',
    title: 'SEKAIA Inc.',
    items: [
      {
        id: 'd3-sekaia',
        label: 'Company visit: SEKAIA Inc.',
        mapsQuery: 'SEKAIA Inc, Tokyo',
      },
      {
        id: 'd3-joshua',
        label: 'Talk: Joshua Abonghe',
        detail: 'Customer Success Manager',
      },
      {
        id: 'd3-mariia',
        label: 'Talk: Mariia Shamina',
        detail: 'Manager, Internships in Japan at ICC',
      },
      {
        id: 'd3-lunch',
        label: 'Networking lunch with SEKAIA colleagues',
      },
      {
        id: 'd3-yuya',
        label: 'Talk: Yuya Yoshida',
        detail: 'CEO and Founder of HARTi',
      },
    ],
  },
  {
    id: 'day-4',
    day: 4,
    date: '8 Sept',
    weekday: 'Tuesday',
    title: 'To be confirmed',
    items: [
      { id: 'd4-tbc', label: 'Morning session', detail: 'TBC' },
      { id: 'd4-lunch', label: 'Lunch' },
      {
        id: 'd4-tomo',
        label: 'Talk: Tomo Honda',
        detail:
          'Government Engagement Lead, Centre for Regions, Trade and Geopolitics at World Economic Forum',
      },
    ],
  },
  {
    id: 'day-5',
    day: 5,
    date: '9 Sept',
    weekday: 'Wednesday',
    title: 'Empire Entertainment',
    items: [
      {
        id: 'd5-yurie',
        label: 'Talk: Yurie Yoshida',
        detail: 'Event Producer at Empire Entertainment',
        mapsQuery: 'Empire Entertainment Japan, Tokyo',
      },
      {
        id: 'd5-theodore',
        label: 'Talk: Theodore Miller',
        detail: 'President and CEO, Empire Entertainment Japan',
      },
      { id: 'd5-lunch', label: 'Lunch' },
      {
        id: 'd5-garden',
        label: 'Kiyosumi Teien Garden visit',
        mapsQuery: 'Kiyosumi Teien Garden, Tokyo',
      },
      { id: 'd5-reflection', label: 'Mid-week reflection session' },
    ],
  },
  {
    id: 'day-6',
    day: 6,
    date: '10 Sept',
    weekday: 'Thursday',
    title: 'Uber APAC and TAUNS',
    items: [
      {
        id: 'd6-chloe',
        label: 'Talk: Chloe Tara',
        detail:
          'Talent Acquisition Branding and Marketing Communications Specialist at Uber APAC',
        mapsQuery: 'Uber Japan, Tokyo',
      },
      { id: 'd6-lunch', label: 'Lunch' },
      {
        id: 'd6-araga',
        label: 'Talk: Shunsuke Araga',
        detail:
          'Director, Office of Organisation and People Development, TAUNS Laboratories',
      },
    ],
  },
  {
    id: 'day-7',
    day: 7,
    date: '11 Sept',
    weekday: 'Friday',
    title: 'Culture and alumni night',
    items: [
      {
        id: 'd7-walk',
        label: 'Walking tour: old traditional Yanaka and Nezu',
        mapsQuery: 'Yanaka, Taito City, Tokyo',
      },
      { id: 'd7-lunch', label: 'Lunch' },
      {
        id: 'd7-alumni',
        label: 'Alumni networking event at Ce La Vi',
        mapsQuery: 'Ce La Vi Tokyo',
      },
    ],
  },
  {
    id: 'day-8',
    day: 8,
    date: '12 Sept',
    weekday: 'Saturday',
    title: 'Return to London',
    items: [
      {
        id: 'd8-coach',
        label: 'Coach pickup at Hyatt House Tokyo Shibuya',
        detail: '5:00 am',
        mapsQuery: HOTEL_QUERY,
      },
      {
        id: 'd8-flight',
        label: 'Flight BA008, Tokyo Haneda to London Heathrow',
        detail: 'Departs 08:50, lands 15:40 at Terminal 5',
      },
    ],
  },
];

export const totalItemCount = tokyoDays.reduce(
  (sum, day) => sum + day.items.length,
  0
);
