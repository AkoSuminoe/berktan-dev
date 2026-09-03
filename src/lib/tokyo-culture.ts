/*
 * Things worth knowing before Tokyo.
 *
 * SOURCING, because Hard Rule 3 lands differently here. Everything else in the
 * /tokyo data files traces back to a WWC document; this does not, and there is
 * nothing in the repo to check it against. So the discipline is a different
 * one: widely documented practice only, no invented statistics, no fine
 * amounts, and no law quoted that is not plainly a law. Anything that is a norm
 * rather than a rule is written as a norm, because "usually" is the true word
 * and "always" would be a small lie that gets somebody stared at.
 *
 * The `careful` list is the one with a cost attached, so it is the one worth
 * checking. The rest is the sort of thing you get told once and are glad of.
 */

export type CultureTag =
  | 'etiquette'
  | 'food'
  | 'money'
  | 'transport'
  | 'language'
  | 'shopping'
  | 'law';

export const CULTURE_TAG_LABELS: Record<CultureTag, string> = {
  etiquette: 'Etiquette',
  food: 'Eating',
  money: 'Money',
  transport: 'Getting about',
  language: 'Language',
  shopping: 'Shops',
  law: 'Rules',
};

export type CultureNote = {
  id: string;
  title: string;
  body: string;
  tag: CultureTag;
};

/* ------------------------------------------------------------------ */
/* Careful: the ones with a cost attached                              */
/* ------------------------------------------------------------------ */

export const careful: CultureNote[] = [
  {
    id: 'care-smoking',
    title: 'You cannot smoke on the street',
    body: 'Most central Tokyo wards, Shibuya included, ban smoking while walking and restrict it to marked areas. There are fines. The designated spots are signposted and konbini and stations usually have one nearby, so it is a matter of walking to the box rather than of giving up for a week.',
    tag: 'law',
  },
  {
    id: 'care-passport',
    title: 'Carry the passport itself',
    body: 'Foreign visitors are required to have it on them and police can ask. A photo on a phone is not the same thing. It is also what the tax-free counter wants to see, and occasionally the konbini cigarette till.',
    tag: 'law',
  },
  {
    id: 'care-medicine',
    title: 'Some ordinary UK medicines are banned',
    body: 'Pseudoephedrine, which is in a lot of cold and flu tablets, and codeine are both prohibited. That includes things sold over the counter at home. Check the box while packing rather than at the border.',
    tag: 'law',
  },
  {
    id: 'care-tattoos',
    title: 'Tattoos can close doors',
    body: 'Onsen, sento, gyms and some pools refuse entry to visible tattoos. Cover patches work in a lot of places and a private bath sidesteps it entirely, but turning up and hoping is how an evening gets cut short.',
    tag: 'etiquette',
  },
  {
    id: 'care-cash',
    title: 'Cash only is still common',
    body: 'Small restaurants, older shops, shrines and plenty of izakaya take nothing else. Card acceptance is good in Shibuya and patchy the moment you leave it. The 7 Bank machine inside the konbini is the one that reliably takes a foreign card.',
    tag: 'money',
  },
  {
    id: 'care-taxfree',
    title: 'Tax-free happens at the till, not afterwards',
    body: 'Passport in hand, in the shop, on the day. It is per shop per day above a minimum spend, usually 5,000 yen, and the goods are sealed in a bag you are not meant to open until you leave the country. Worth confirming at the counter, since the scheme has been under review.',
    tag: 'shopping',
  },
  {
    id: 'care-photos',
    title: 'Ask before photographing inside a shop',
    body: 'Model shops, record shops and a lot of Akihabara floors ban it outright, usually with a sign you will not be able to read. Nobody minds being asked and several people will mind if you do not.',
    tag: 'shopping',
  },
  {
    id: 'care-lasttrain',
    title: 'The last train really is the last one',
    body: 'Trains stop around midnight and nothing runs again until about five. Miss it and the choice is a taxi at a very different price or somewhere to sit until morning. Worth checking the time before the second drink rather than after.',
    tag: 'transport',
  },
];

/* ------------------------------------------------------------------ */
/* Worth knowing: the things you get told once                         */
/* ------------------------------------------------------------------ */

export const worthKnowing: CultureNote[] = [
  {
    id: 'know-meishi',
    title: 'A business card is treated as the person',
    body: 'Take it with both hands, read it properly rather than glancing, and say the name back. In a meeting it goes on the table in front of you, laid out in the order people are sitting, and stays there until the end. Never write on one, never bend one, and never put it straight into a back pocket.',
    tag: 'etiquette',
  },
  {
    id: 'know-bowing',
    title: 'A small nod does most of the work',
    body: 'Nobody expects a visitor to get the depth right. A short bow of the head at the same moment as the other person covers hello, thank you and sorry. Trying too hard is more conspicuous than not trying.',
    tag: 'etiquette',
  },
  {
    id: 'know-sumimasen',
    title: 'Sumimasen does an enormous amount',
    body: 'It is excuse me, sorry, thank you, and how you call a waiter over. If you learn one word it is this one. Said while squeezing past somebody on a train it is the entire conversation.',
    tag: 'language',
  },
  {
    id: 'know-san',
    title: 'San goes after other people, never yourself',
    body: 'Family name plus san is the safe default for anyone you have just met. Using it about yourself is the one that gets a laugh. Given names are for people you already know well.',
    tag: 'language',
  },
  {
    id: 'know-itadakimasu',
    title: 'Itadakimasu before, gochisousama after',
    body: 'Said quietly to the table before eating and to the staff on the way out. Not religious and not formal, just what you say, and the second one is the closest thing there is to leaving a tip.',
    tag: 'food',
  },
  {
    id: 'know-slurping',
    title: 'Slurping noodles is fine',
    body: 'It cools the noodles, it is not rude, and in a ramen shop it is what everyone around you is doing. Eating quickly and leaving is also normal: the counter is for eating, not for sitting.',
    tag: 'food',
  },
  {
    id: 'know-chopsticks',
    title: 'Two things never to do with chopsticks',
    body: 'Do not stand them upright in a bowl of rice, and do not pass food directly from chopsticks to chopsticks. Both are funeral rites, so both read the way a coffin would at a dinner party. Use the rest, or lay them across the bowl.',
    tag: 'food',
  },
  {
    id: 'know-tray',
    title: 'Money goes on the little tray',
    body: 'There is a small dish beside every till. Notes and coins go in it rather than into a hand, and the change comes back the same way. Handing cash over directly is the reflex to unlearn on day one.',
    tag: 'money',
  },
  {
    id: 'know-tipping',
    title: 'There is no tipping, anywhere',
    body: 'Not in restaurants, not in taxis, not for a porter. Money left on a table causes real confusion, and there is a decent chance somebody follows you down the street to give it back. The price is the price.',
    tag: 'money',
  },
  {
    id: 'know-oshibori',
    title: 'The oshibori is for your hands',
    body: 'The hot or cold rolled towel that arrives before the food is for your hands. Not your face, and not the table. Fold it and leave it beside you when you are done.',
    tag: 'food',
  },
  {
    id: 'know-pouring',
    title: 'Do not pour your own drink',
    body: 'Fill the glass next to you and somebody will fill yours, and hold the bottle with two hands if they are older or senior. When somebody starts pouring for you, lift your glass slightly to meet it.',
    tag: 'etiquette',
  },
  {
    id: 'know-shoes',
    title: 'Shoes come off wherever the floor steps up',
    body: 'Homes, some restaurants, temple halls, fitting rooms, occasionally a shop. The step or the change in flooring is the signal. Slippers are usually provided, and the separate toilet slippers stay in the toilet, which is the mistake everybody makes once.',
    tag: 'etiquette',
  },
  {
    id: 'know-quiet',
    title: 'Trains are quiet',
    body: 'Phone calls are not made on board and conversation stays low. Phones go on silent near the priority seats. It is the most noticeable thing about a Tokyo commute and the easiest one to get wrong.',
    tag: 'transport',
  },
  {
    id: 'know-escalator',
    title: 'Stand on the left, walk on the right',
    body: 'In Tokyo. Osaka is the other way round, which catches out people who have been to both. Stations increasingly ask everyone to stand on both sides, so follow whoever is in front of you.',
    tag: 'transport',
  },
  {
    id: 'know-queue',
    title: 'Queue on the painted marks',
    body: 'The platform has lines showing where each door will be, and the train stops exactly there. People form two files either side and let passengers off first. It looks fussy and it is the reason a rush hour platform works at all.',
    tag: 'transport',
  },
  {
    id: 'know-ic',
    title: 'One card does trains, buses and the konbini',
    body: 'Suica or Pasmo taps through almost every gate in the city and pays at convenience stores, vending machines and a lot of small shops. Topped up with cash at any station machine.',
    tag: 'transport',
  },
  {
    id: 'know-bins',
    title: 'There are almost no bins',
    body: 'The streets are spotless and there is nowhere to throw anything away, because people carry their rubbish home. A konbini has bins inside and a station usually has some by the kiosk. Expect to walk around with a coffee cup for a while.',
    tag: 'etiquette',
  },
  {
    id: 'know-konbini',
    title: 'Konbini food is genuinely good',
    body: 'Not a compromise. Onigiri, egg sandwiches, fried chicken at the counter, and a full meal for a few hundred yen at any hour. They also handle cash machines, printing, parcels and paying bills.',
    tag: 'food',
  },
  {
    id: 'know-toilets',
    title: 'The toilet has a control panel',
    body: 'Buttons for the bidet, the dryer and the seat warmer, usually labelled only in Japanese. The flush is often a large button on the wall or a lever rather than anything on the panel. Public toilets are everywhere, free, and clean.',
    tag: 'etiquette',
  },
  {
    id: 'know-addresses',
    title: 'Addresses are blocks, not streets',
    body: 'They run ward, district, block, building, and most streets have no name at all. Nobody navigates by address. Locals use landmarks, station exits and a phone map, which is why every place on this plan carries a maps link rather than directions.',
    tag: 'transport',
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
    when: 'Getting past, getting attention, apologising.',
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

export const cultureNoteCount = careful.length + worthKnowing.length;
