/*
 * Things worth knowing before Tokyo.
 *
 * PROVENANCE IS THE POINT OF THIS FILE.
 *
 * Every other /tokyo data file traces to a WWC document. This one mixes three
 * kinds of claim, and flattening them would lend my own opinions the authority
 * of a university document. So each item says which it is:
 *
 *   'wwc'      Read out of an official WWC document. `sourceNote` gives which
 *              one and where, so the claim can be checked rather than trusted.
 *   'verified' Widely documented Japanese law or practice. Not in the WWC
 *              documents, but not mine either.
 *   'advice'   My judgement. No authority behind it at all. Useful, possibly
 *              wrong, and it must never sit unmarked beside a legal rule.
 *
 * The 'wwc' items were checked against `WWC_Tokyo_Student_Pack.pdf` directly
 * (image-only scan, read as page images) rather than taken on trust, and that
 * caught two things:
 *
 *   - The Student Pack lists on-the-spot fines for "littering, jay walking or
 *     spitting". It does NOT attach a fine to street smoking, which it covers
 *     separately as illegal. Those were two claims run together; they are now
 *     two items.
 *   - Earthquake guidance is not in the Student Pack. It links out to a
 *     government page and says nothing itself. That item is 'advice'.
 *
 * Deliberately absent: the three WWC staff mobile numbers on page 8 and the
 * AIG policy number on page 9. berktan.dev is a public host and those are
 * other people's personal data and a live policy reference. They stay in the
 * PDF, which is where they belong.
 */

export type CultureSource = 'wwc' | 'verified' | 'advice';

export const SOURCE_LABELS: Record<CultureSource, string> = {
  wwc: 'WWC document',
  verified: 'Documented',
  advice: 'My read',
};

export const SOURCE_MEANINGS: Record<CultureSource, string> = {
  wwc: 'Read out of an official WWC document. Checkable.',
  verified: 'Widely documented law or practice, not from the WWC documents.',
  advice: 'A judgement, with nothing official behind it.',
};

export type CultureNote = {
  id: string;
  title: string;
  body: string;
  source: CultureSource;
  /** Which document and where, for 'wwc'. Rendered under the chip. */
  sourceNote?: string;
  /** Surfaces the note on the day it matters. Ids from tokyo-itinerary.ts. */
  relatedDay?: string;
};

export type CultureSection = {
  id: string;
  title: string;
  blurb: string;
  items: CultureNote[];
};

/* ------------------------------------------------------------------ */
/* 1. Work and meetings                                                */
/* ------------------------------------------------------------------ */

const work: CultureNote[] = [
  {
    id: 'w-meishi',
    title: 'A business card is treated as the person',
    body: 'Offer yours with both hands, turned so they can read it. Take theirs with both hands, actually read it, and say something about it. Never write on a card, never bend one, and never push one straight into a back pocket.',
    source: 'verified',
    relatedDay: 'day-3',
  },
  {
    id: 'w-cards-table',
    title: 'The cards stay on the table',
    body: 'Lay out the cards you have been given in front of you, arranged to match where people are sitting. It doubles as a seating plan when you cannot hold six new names at once. Putting them away early reads as dismissive.',
    source: 'verified',
    relatedDay: 'day-3',
  },
  {
    id: 'w-card-case',
    title: 'Get a card case',
    body: 'A wallet is for money, and a card pulled out of one has usually been sat on. Cheap cases are sold in any station or stationery shop.',
    source: 'advice',
  },
  {
    id: 'w-bows',
    title: 'Bows have depth',
    body: 'A small nod is casual, around fifteen degrees is a greeting, thirty shows respect or thanks. As a visitor a nod with a handshake is fine. Follow whoever you are meeting rather than trying to get it exactly right.',
    source: 'verified',
  },
  {
    id: 'w-seating',
    title: 'Seating has an order',
    body: 'The seat furthest from the door is for the most senior guest, the one nearest the door for the most junior. Wait to be shown where to sit rather than picking.',
    source: 'verified',
  },
  {
    id: 'w-lift',
    title: 'Whoever stands by the lift buttons works them',
    body: 'And leaves last. It is a small job that the most junior person in the lift is expected to take.',
    source: 'verified',
  },
  {
    id: 'w-silence',
    title: 'Silence is thinking, not awkwardness',
    body: 'A pause in a meeting is somebody considering an answer. Rushing to fill it reads as impatience, and it talks over the reply you asked for.',
    source: 'advice',
  },
  {
    id: 'w-soft-no',
    title: '"We will consider it" is often a no',
    body: 'Direct refusal is avoided. A soft answer with no follow-up date and no next step usually means the matter is closed, and pressing for a firmer answer does not reopen it.',
    source: 'verified',
  },
  {
    id: 'w-early',
    title: 'Five minutes early is on time',
    body: 'The trains make that achievable, which is exactly why lateness has no excuse built into it.',
    source: 'advice',
  },
  {
    id: 'w-coolbiz',
    title: 'Cool Biz runs through September',
    body: 'A government campaign that has offices drop ties and jackets through the hot months, roughly May to September, so air conditioning can be set higher. Tokyo in September is hot and humid. Check what the group is doing rather than assuming a suit.',
    source: 'verified',
  },
  {
    id: 'w-nomikai',
    title: 'At drinks, you pour for other people',
    body: 'Fill the glass next to you and somebody will fill yours. Wait for the kanpai before the first sip. A glass left slightly full signals you have finished; an empty one invites a refill.',
    source: 'verified',
    relatedDay: 'day-7',
  },
  {
    id: 'w-questions',
    title: 'Turn up with questions ready',
    body: 'Prepared questions read as respect for somebody giving you their afternoon, and they are far easier to think of the night before than in the room.',
    source: 'advice',
    relatedDay: 'day-3',
  },
  {
    id: 'w-journal',
    title: 'There is a reflection journal',
    body: 'The programme expects you to work on one, sent by email, thinking before, during and after the visit about the working culture here against the UK. The meetings with alumni and contacts are named as the material for it.',
    source: 'wwc',
    sourceNote: 'Student Pack, p10',
  },
];

/* ------------------------------------------------------------------ */
/* 2. Everyday                                                         */
/* ------------------------------------------------------------------ */

const everyday: CultureNote[] = [
  {
    id: 'e-tipping',
    title: 'There is no tipping, anywhere',
    body: 'Not restaurants, not taxis, not hotels. Money left on a table causes confusion rather than pleasure, and there is a fair chance somebody follows you out to return it.',
    source: 'verified',
  },
  {
    id: 'e-tray',
    title: 'Money goes on the little tray',
    body: 'There is a small dish beside every till. Notes and coins go in it rather than into a hand, and the change comes back the same way.',
    source: 'verified',
  },
  {
    id: 'e-bins',
    title: 'Public bins barely exist',
    body: 'The streets are spotless because people carry their rubbish home. A konbini has bins inside, and there are usually some beside a vending machine. Expect to walk around with a coffee cup for a while.',
    source: 'verified',
  },
  {
    id: 'e-trains-quiet',
    title: 'Trains are quiet',
    body: 'No phone calls, phones on silent near the priority seats, conversation low. Queue at the marked spots on the platform and let people off first.',
    source: 'verified',
  },
  {
    id: 'e-escalator',
    title: 'Stand on the left in Tokyo',
    body: 'Osaka is the opposite way round, which catches out people who have been to both. Some Tokyo stations now ask everyone to stand on both sides rather than walk, so follow whoever is in front of you.',
    source: 'verified',
  },
  {
    id: 'e-shoes',
    title: 'Shoes come off where the floor steps up',
    body: 'A raised floor or a shoe rack is the signal: some restaurants, temple halls, changing rooms, anyone home. Slippers are provided, and the separate toilet slippers stay in the toilet.',
    source: 'verified',
  },
  {
    id: 'e-suica',
    title: 'One IC card does almost everything',
    body: 'Suica or Pasmo taps through the gates and also pays at konbini, vending machines and coin lockers. Top it up with cash at any station machine.',
    source: 'verified',
  },
  {
    id: 'e-maps',
    title: 'Download the map before you land',
    body: 'The Student Pack asks for this directly. It matters more here than most places because Tokyo addresses are blocks and numbers rather than street names, so nobody navigates by address, including locals.',
    source: 'wwc',
    sourceNote: 'Student Pack, p4',
  },
  {
    id: 'e-roaming',
    title: 'Sort roaming, and save the numbers offline',
    body: 'The pack asks you to enable roaming if you can, use WhatsApp otherwise, and save useful numbers and maps to the phone. It also asks you to know the address and phone number of where you are staying and how to get back to it.',
    source: 'wwc',
    sourceNote: 'Student Pack, p6',
  },
  {
    id: 'e-left',
    title: 'Traffic drives on the left',
    body: 'Same as home, so crossing the road is one less thing to relearn.',
    source: 'verified',
  },
  {
    id: 'e-tattoos',
    title: 'Tattoos can close doors',
    body: 'Onsen, sento, some gyms and some pools refuse entry to visible tattoos. Cover patches are sold in konbini, and a private bath sidesteps it entirely.',
    source: 'verified',
  },
  {
    id: 'e-vending',
    title: 'Vending machines are everywhere',
    body: 'Roughly 150 yen, on almost every street, and they take an IC card. A red label means the drink is hot, blue means cold.',
    source: 'verified',
  },
  {
    id: 'e-konbini',
    title: 'Konbini do far more than food',
    body: 'Cash machines that take foreign cards, printing, parcel drop-off, ticket collection, clean toilets. And the food is genuinely good rather than a compromise.',
    source: 'verified',
  },
  {
    id: 'e-social',
    title: 'Social media posts are monitored',
    body: 'The Student Pack states that posts which can be perceived as critical of the government are monitored and can lead to police interference. It also reminds you that you are representing the University while abroad.',
    source: 'wwc',
    sourceNote: 'Student Pack, p7',
  },
  {
    id: 'e-dress',
    title: 'Dress codes at religious sites',
    body: 'The pack asks you to respect local customs and dress codes, particularly at religious sites and markets, and to think about what you wear and how you fit in.',
    source: 'wwc',
    sourceNote: 'Student Pack, p7',
    relatedDay: 'day-1',
  },
];

/* ------------------------------------------------------------------ */
/* 3. Food and drink                                                   */
/* ------------------------------------------------------------------ */

const food: CultureNote[] = [
  {
    id: 'f-slurp',
    title: 'Slurping is normal, blowing your nose is not',
    body: 'Slurping cools the noodles and is not rude. Blowing your nose at the table is, so step away to do it.',
    source: 'verified',
  },
  {
    id: 'f-chopsticks',
    title: 'Chopsticks have two hard rules',
    body: 'Never stand them upright in a bowl of rice, and never pass food directly from chopsticks to chopsticks. Both mirror funeral rites. Use the rest, or lay them across the bowl.',
    source: 'verified',
  },
  {
    id: 'f-walking',
    title: 'Do not eat while walking',
    body: 'Buy from the stall, eat standing beside it, then move on. This applies on Nakamise, where the stalls are lined up and the street is packed.',
    source: 'verified',
    relatedDay: 'day-1',
  },
  {
    id: 'f-oshibori',
    title: 'The wet towel is for your hands',
    body: 'Not your face, not the back of your neck, not the table. Fold it and leave it beside you when you are done.',
    source: 'verified',
  },
  {
    id: 'f-itadakimasu',
    title: 'Itadakimasu before, gochisousama after',
    body: 'Said quietly to the table before eating and to the staff on the way out. Two words, both land well, and the second is the closest thing to leaving a tip.',
    source: 'verified',
  },
  {
    id: 'f-water',
    title: 'Water and tea are free',
    body: 'Brought to the table without asking, and you are never obliged to order a drink to justify the seat.',
    source: 'verified',
  },
  {
    id: 'f-cash',
    title: 'Many small places are cash only',
    body: 'Some have a ticket machine by the door: buy the ticket first, hand the stub to the counter. Card acceptance is good in Shibuya and patchy the moment you leave it.',
    source: 'verified',
  },
  {
    id: 'f-sushi',
    title: 'Counter sushi has its own etiquette',
    body: 'Eat each piece as it is put in front of you, do not drown it in soy, and skip strong aftershave. At a counter that close it interferes with the food for everyone else.',
    source: 'verified',
  },
  {
    id: 'f-meals-covered',
    title: 'Some meals are already paid for',
    body: 'WWC covers transport and meals during activities that are part of the programme. Worth knowing before budgeting for a lunch that is already bought, and hotel breakfast is served from 07:00.',
    source: 'wwc',
    sourceNote: 'Student Pack, p4 and p5',
  },
];

/* ------------------------------------------------------------------ */
/* 4. Careful                                                          */
/* ------------------------------------------------------------------ */

const careful: CultureNote[] = [
  {
    id: 'c-smoking',
    title: 'Smoking on the street is illegal',
    body: 'The Student Pack puts it plainly: smoking is illegal on the streets of Tokyo and some other cities, and you smoke only in designated areas. Those are signposted, and konbini and stations usually have one nearby.',
    source: 'wwc',
    sourceNote: 'Student Pack, p7',
  },
  {
    id: 'c-fines',
    title: 'On-the-spot fines for littering, jaywalking and spitting',
    body: 'Those three specifically, and they are separate from the smoking rule above. The pack does not attach a fine to street smoking, so do not assume the two lists are the same one.',
    source: 'wwc',
    sourceNote: 'Student Pack, p7',
  },
  {
    id: 'c-passport',
    title: 'Carry your passport at all times',
    body: 'You must always have your passport or Japanese residence card on you, and the police can arrest you if you cannot show proof of your visa or residence status. A photo of it is not the same thing.',
    source: 'wwc',
    sourceNote: 'Student Pack, p6',
  },
  {
    id: 'c-drugs',
    title: 'Zero tolerance on drugs, and the definition is wider than you think',
    body: 'Penalties are severe, and British nationals have been arrested for receiving small quantities by post or for testing positive in a club raid. It is illegal to possess some common prescription and over-the-counter medicines under the law on anti-stimulant drugs. Ignorance is not a defence.',
    source: 'wwc',
    sourceNote: 'Student Pack, p7',
  },
  {
    id: 'c-medication',
    title: 'Medication in its original packaging',
    body: 'The pack requires it, and advises carrying a letter from your GP because customs may want to see one. Worth doing before you pack rather than at the border.',
    source: 'wwc',
    sourceNote: 'Student Pack, p7',
  },
  {
    id: 'c-photos',
    title: 'Check before photographing',
    body: 'At sites of cultural importance, check whether photographing is permitted. Taking photos of military sites is illegal. Shops are their own case: model shops and record shops often ban it outright, with a sign you will not be able to read.',
    source: 'wwc',
    sourceNote: 'Student Pack, p7',
  },
  {
    id: 'c-climate',
    title: 'September is the wettest month',
    body: 'An average of 181mm of rain across the month with around 20 rain days, an average high of 26C, and not unusual to reach 30C in the first weeks. The pack suggests layers, comfortable walking shoes and a light raincoat or umbrella.',
    source: 'wwc',
    sourceNote: 'Student Pack, p6',
  },
  {
    id: 'c-earthquake',
    title: 'If an earthquake starts',
    body: 'Stay inside, get away from windows, cover your head, and do not run for the stairs. Hotel staff will direct you. Worth knowing in advance because there is no time to look it up.',
    source: 'advice',
    sourceNote:
      'Not in the Student Pack, which links out to a government page and gives no guidance of its own.',
  },
  {
    id: 'c-baggage',
    title: 'One 23kg checked bag and one hand bag',
    body: 'That is the whole allowance. The shopping list comes to roughly 5.5kg on top of clothes, so weigh the bag before the Saturday coach rather than at the airport desk.',
    source: 'wwc',
    sourceNote: 'Student Pack, p4',
    relatedDay: 'day-8',
  },
  {
    id: 'c-coach',
    title: 'The coach leaves at 05:00 on Saturday',
    body: 'From the hotel, for the 08:50 flight. Pack on Friday, before the alumni evening rather than after it.',
    source: 'wwc',
    sourceNote: 'WWC itinerary, day 8',
    relatedDay: 'day-8',
  },
  {
    id: 'c-cigarettes',
    title: 'The UK allowance is 200 cigarettes',
    body: 'One carton, and no relief on tobacco duty anywhere, konbini included. Tax-free shopping does not cover it.',
    source: 'verified',
  },
  {
    id: 'c-taxfree',
    title: 'Tax-free happens at the till',
    body: 'Passport at the register, same shop, same day, above a minimum spend that is usually 5,000 yen before tax. The goods are sealed and the paperwork stays with you until you have left Japan. Worth confirming at the counter, since the scheme has been under review.',
    source: 'verified',
  },
  {
    id: 'c-lasttrain',
    title: 'The last train really is the last one',
    body: 'Trains stop around midnight and nothing runs again until roughly five. Missing it means a taxi at a very different price. Check the time before the second drink rather than after.',
    source: 'verified',
  },
  {
    id: 'c-emergency',
    title: 'Emergency numbers',
    body: 'Police is 110. Fire, ambulance and rescue is 119. The British Consulate-General in Tokyo runs a 24/7 line on +81 (0)3 5211 1100 for urgent help. The WWC staff mobiles are in the Student Pack, and are worth putting in your phone before you fly.',
    source: 'wwc',
    sourceNote: 'Student Pack, p8. Staff numbers deliberately not reproduced here.',
  },
];

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

export const cultureSections: CultureSection[] = [
  {
    id: 'culture-work',
    title: 'Work and meetings',
    blurb:
      'The reason this tab exists. Four company visits in a week, and business etiquette here is more formal than the UK equivalent in ways that are easy to get wrong and easy to get right.',
    items: work,
  },
  {
    id: 'culture-everyday',
    title: 'Everyday',
    blurb: 'The things you get told once and are glad of.',
    items: everyday,
  },
  {
    id: 'culture-food',
    title: 'Food and drink',
    blurb: 'Ordering, paying, and what not to do at a counter.',
    items: food,
  },
  {
    id: 'culture-careful',
    title: 'Careful',
    blurb:
      'Rules with a real cost attached. Most of these come straight out of the Student Pack, and the one that does not is marked.',
    items: careful,
  },
];

/* ------------------------------------------------------------------ */
/* Phrasebook                                                          */
/* ------------------------------------------------------------------ */

export type Phrase = {
  id: string;
  romaji: string;
  kana: string;
  meaning: string;
  when: string;
};

export const phrasebook: Phrase[] = [
  {
    id: 'p-sumimasen',
    romaji: 'Sumimasen',
    kana: 'すみません',
    meaning: 'Excuse me, sorry, thank you',
    when: 'Getting past, getting attention, apologising. If you learn one word, this one.',
  },
  {
    id: 'p-arigatou',
    romaji: 'Arigatou gozaimasu',
    kana: 'ありがとうございます',
    meaning: 'Thank you',
    when: 'The full version, worth saying properly rather than shortening.',
  },
  {
    id: 'p-onegai',
    romaji: 'Onegaishimasu',
    kana: 'お願いします',
    meaning: 'Please',
    when: 'Tacked onto any request, or alone to mean yes please.',
  },
  {
    id: 'p-yoroshiku',
    romaji: 'Yoroshiku onegaishimasu',
    kana: 'よろしくお願いします',
    meaning: 'I look forward to working with you',
    when: 'The line at the end of an introduction, as the cards are exchanged.',
  },
  {
    id: 'p-kore',
    romaji: 'Kore o kudasai',
    kana: 'これをください',
    meaning: 'This one, please',
    when: 'Pointing at a menu, a display case or a shelf. Solves most ordering.',
  },
  {
    id: 'p-ikura',
    romaji: 'Ikura desu ka',
    kana: 'いくらですか',
    meaning: 'How much is it?',
    when: 'Where nothing is priced, which in a second-hand shop is often.',
  },
  {
    id: 'p-eigo',
    romaji: 'Eigo no menu wa arimasu ka',
    kana: '英語のメニューはありますか',
    meaning: 'Is there an English menu?',
    when: 'Often there is, and often nobody thinks to offer it.',
  },
  {
    id: 'p-daijoubu',
    romaji: 'Daijoubu desu',
    kana: '大丈夫です',
    meaning: 'I am fine, no thank you',
    when: 'The polite no. Declining a bag, a receipt, or more of anything.',
  },
  {
    id: 'p-oishii',
    romaji: 'Oishii',
    kana: 'おいしい',
    meaning: 'Delicious',
    when: 'Said to whoever cooked it. Always lands well.',
  },
  {
    id: 'p-gochisou',
    romaji: 'Gochisousama deshita',
    kana: 'ごちそうさまでした',
    meaning: 'Thank you for the meal',
    when: 'On the way out. The closest thing to a tip that exists.',
  },
  {
    id: 'p-kaikei',
    romaji: 'Okaikei onegaishimasu',
    kana: 'お会計お願いします',
    meaning: 'The bill, please',
    when: 'Though in a lot of places you take the slip to the till yourself.',
  },
  {
    id: 'p-toire',
    romaji: 'Toire wa doko desu ka',
    kana: 'トイレはどこですか',
    meaning: 'Where is the toilet?',
    when: 'Self explanatory, and worth having ready.',
  },
];

/* ------------------------------------------------------------------ */
/* Derived                                                             */
/* ------------------------------------------------------------------ */

export const allCultureNotes: CultureNote[] = cultureSections.reduce(
  (all: CultureNote[], section) => all.concat(section.items),
  []
);

export const cultureNoteCount = allCultureNotes.length;

export function countBySource(): Record<CultureSource, number> {
  const counts: Record<CultureSource, number> = {
    wwc: 0,
    verified: 0,
    advice: 0,
  };
  for (const note of allCultureNotes) counts[note.source] += 1;
  return counts;
}

/** Culture notes worth surfacing on a given itinerary day. */
export function notesForDay(dayId: string): CultureNote[] {
  return allCultureNotes.filter((note) => note.relatedDay === dayId);
}
