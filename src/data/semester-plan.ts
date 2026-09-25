/**
 * Final year Semester 1 plan (2026/27), University of Westminster.
 * Single source of truth for the /semester page on berktan.dev.
 * Framework-agnostic: pure data + pure helpers, no DOM, no React.
 *
 * Times are UK local "HH:MM". Dates are ISO "YYYY-MM-DD" (local, not UTC).
 * Day indices: 0 = Monday ... 6 = Sunday.
 *
 * Copy is Turkish because the plan is Berktan's own; code and comments stay
 * English, per AI_MEMORY. Range dashes are plain hyphens, per Hard Rule 5.
 *
 * To change the plan, edit this file. The page reads everything from here and
 * holds no schedule data of its own.
 */

export type CategoryId =
  | 'ders'
  | 'tekrar'
  | 'fyp'
  | 'aws'
  | 'lc'
  | 'is'
  | 'proje'
  | 'gitar'
  | 'rev'
  | 'bos'
  | 'yol';

export interface Block {
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  cat: CategoryId;
  title: string;
  detail?: string;
  location?: string; // room, only on fixed university sessions
}

export type TemplateId =
  | 'mon'
  | 'tue'
  | 'wed'
  | 'thu'
  | 'sat'
  | 'sun'
  | 'monthSun'
  | 'mockSat'
  | 'awsExam'
  | 'rev'
  | 'revSat'
  | 'light'
  | 'lightDay'
  | 'exam'
  | 'examSun'
  | 'friMeeting'
  | 'friNoMeeting';

/** teach = normal teaching week, gap = no classes listed (26-30 Oct),
 *  revision = holiday revision, light = light holiday week, exam = exam period */
export type WeekMode = 'teach' | 'gap' | 'revision' | 'light' | 'exam';

export interface WeekFocus {
  ders?: string;
  fyp?: string;
  aws?: string;
  lc?: string;
  is?: string;
  proje?: string;
  gitar?: string;
}

export interface Week {
  start: string; // Monday, ISO
  label: string;
  mode: WeekMode;
  fypSession: boolean; // live 6SENG010W session on Friday
  monthlyReview?: boolean; // Sunday becomes the monthly-review template
  awsDone?: boolean; // AWS blocks become free study blocks all week
  awsDoneFromDay?: number; // ...or from this day index on (exam week)
  overrides?: Partial<Record<number, TemplateId>>;
  focus: WeekFocus;
  note?: string;
}

export interface Course {
  code: string;
  name: string;
  type: string;
  day: string;
  time: string;
  loc: string;
  staff: string;
  group: string;
  weeks: string;
}

export interface Deadline {
  title: string;
  date: string | null;
  cat: CategoryId;
}

export const SEMESTER = {
  start: '2026-09-21',
  end: '2027-01-17',
  teachingEnds: '2026-12-11',
  examPeriod: { start: '2027-01-04', end: '2027-01-15' },
  wake: '07:00',
  sleep: '22:45',
  commuteMinutes: 35,
  awsExamTarget: '2026-11-25',
  awsExamFallback: '2026-12-02',
} as const;

export const CATEGORIES: Record<CategoryId, string> = {
  ders: 'Ders',
  tekrar: 'Ders tekrarı / coursework',
  fyp: 'Final year project',
  aws: 'AWS SAA-C03',
  lc: 'LeetCode / NeetCode',
  is: 'İş başvurusu',
  proje: 'JVM profiler',
  gitar: 'Gitar',
  rev: 'Planlama',
  bos: 'Mola / serbest',
  yol: 'Yol',
};

/** Categories rendered as soft/dashed and without a checkbox. */
export const SOFT_CATEGORIES: CategoryId[] = ['bos', 'yol'];

export const COURSES: Course[] = [
  {
    code: '6SENG005W',
    name: 'Formal Methods',
    type: 'Seminer',
    day: 'Pazartesi',
    time: '11:00-13:00',
    loc: 'Copland LG.105',
    staff: 'Klaus Draeger',
    group: '6SE02',
    weeks: '21 Eyl-19 Eki, 2 Kas-7 Ara',
  },
  {
    code: '6SENG006W',
    name: 'Concurrent Programming',
    type: 'Seminer',
    day: 'Pazartesi',
    time: '14:00-16:00',
    loc: 'Copland G.105',
    staff: 'Tendai Mhlanga',
    group: '6SE02',
    weeks: '21 Eyl-19 Eki, 2 Kas-7 Ara',
  },
  {
    code: '6SENG005W',
    name: 'Formal Methods',
    type: 'Lecture',
    day: 'Perşembe',
    time: '09:00-11:00',
    loc: 'Cavendish C1.03',
    staff: 'Klaus Draeger',
    group: '',
    weeks: '24 Eyl-22 Eki, 5 Kas-10 Ara',
  },
  {
    code: '6SENG006W',
    name: 'Concurrent Programming',
    type: 'Lecture',
    day: 'Perşembe',
    time: '11:00-13:00',
    loc: 'Cavendish C1.15-16',
    staff: 'Tendai Mhlanga',
    group: '',
    weeks: '24 Eyl-22 Eki, 5 Kas-10 Ara',
  },
  {
    code: '6SENG010W',
    name: 'Software Engineering Final Project',
    type: 'Proje oturumu',
    day: 'Cuma',
    time: '09:00-11:00',
    loc: 'Online (canlı)',
    staff: 'Rolf Banziger',
    group: '',
    weeks: 'Haftalık 25 Eyl-23 Eki; 6 Kas ve 4 Ara',
  },
];

/*
 * Details that recur verbatim across templates. Named once so a wording change
 * is one edit rather than fourteen, and so two copies can never drift apart.
 */
const CLOSE_DETAIL =
  "5 dk: blokları işaretle, FYP log'a 3 satır (ne yaptım, ne öğrendim, ilk sonraki adım). Sonra ekran kapalı.";
const GUITAR_DETAIL =
  '5 dk ısınma + 10 dk teknik (alternate picking, palm muting, geçişler) + 10 dk haftanın parçası + 5 dk serbest.';
const LC_NEW_DETAIL =
  '5 dk yaklaşım + 25 dk deneme + 10 dk çözüm karşılaştırma + 5 dk hata notu. Takılırsan ipucu al, çözümü kapat, sonra bağımsız yeniden çöz.';
const SYNTHESIS_DETAIL =
  'Haftanın iki modülünü tek sayfada birleştir: zihin haritası ya da kısa özet, açık sorular.';

const CLOSE: Block = {
  start: '22:15',
  end: '22:45',
  cat: 'rev',
  title: 'Günü kapat + uykuya hazırlık',
  detail: CLOSE_DETAIL,
};
const GUITAR: Block = {
  start: '19:00',
  end: '19:30',
  cat: 'gitar',
  title: 'Gitar',
  detail: GUITAR_DETAIL,
};

export const TEMPLATES: Record<TemplateId, Block[]> = {
  mon: [
    { start: '07:00', end: '07:45', cat: 'bos', title: 'Kahvaltı + sabah planı', detail: 'Ekran başında çalışma yok; günün 3 önceliğini yaz.' },
    { start: '07:45', end: '08:45', cat: 'fyp', title: 'FYP: haftanın hedefi', detail: 'Haftanın tek gösterilebilir çıktısını yaz ve ilk görevine başla. Son 5 dk ilerleme notu.' },
    { start: '08:55', end: '09:40', cat: 'aws', title: 'AWS: kurs', detail: '30 dk video + 15 dk notsuz hatırlama ve 3-5 soru.' },
    { start: '09:40', end: '10:10', cat: 'tekrar', title: 'Aralıklı ders tekrarı', detail: 'Vadesi gelen FM/CP soruları (3/7/30 gün kuyruğu), notlara bakmadan.' },
    { start: '10:15', end: '10:50', cat: 'yol', title: 'Yol: Manor House, Warren Street', detail: '20 dk metro + 7 dk yürüyüş + 8 dk pay. İlk hafta kapıdan kapıya süreyi ölç.' },
    { start: '11:00', end: '13:00', cat: 'ders', title: 'Formal Methods seminer', detail: '6SENG005W, Copland LG.105, Klaus Draeger. Çözemediğin soruları işaretle.', location: 'Copland LG.105' },
    { start: '13:00', end: '14:00', cat: 'bos', title: 'Öğle + mola' },
    { start: '14:00', end: '16:00', cat: 'ders', title: 'Concurrent Programming seminer', detail: '6SENG006W, Copland G.105, Tendai Mhlanga. Kod örneklerini ve hataları kaydet.', location: 'Copland G.105' },
    { start: '16:00', end: '16:30', cat: 'tekrar', title: 'Aynı gün tekrar', detail: '15 dk FM + 15 dk CP: notsuz 3 ana fikir ve birer çözülmemiş soru.' },
    { start: '16:30', end: '17:05', cat: 'yol', title: 'Yol: ev' },
    { start: '17:05', end: '18:15', cat: 'bos', title: 'Yemek ve dinlenme', detail: 'Çalışma ekleme.' },
    { start: '18:15', end: '19:00', cat: 'lc', title: 'LeetCode: tekrar', detail: 'Daha önce çözdüğün 1-2 soruyu çözüm açmadan yeniden yaz.' },
    GUITAR,
    { start: '19:30', end: '22:15', cat: 'bos', title: 'Serbest zaman' },
    CLOSE,
  ],
  tue: [
    { start: '07:00', end: '08:00', cat: 'bos', title: 'Kahvaltı + sabah planı', detail: 'Kısa yürüyüş ya da esneme; günün 3 önceliğini yaz.' },
    { start: '08:00', end: '10:00', cat: 'fyp', title: 'FYP: derin çalışma', detail: "2 x 50 dk + 10 dk ara. Telefon başka odada. Başta tek cümlelik hedef: ör. 'simülatörde pod scheduling adımı'." },
    { start: '10:15', end: '11:00', cat: 'lc', title: 'LeetCode: yeni soru', detail: LC_NEW_DETAIL },
    { start: '11:15', end: '12:30', cat: 'tekrar', title: 'Formal Methods: coursework', detail: "Brief'teki bir alt görevi tamamla; ödev yoksa seminer ya da sınav sorusu çöz." },
    { start: '12:30', end: '13:30', cat: 'bos', title: 'Öğle + yürüyüş', detail: 'Ekrandan uzaklaş.' },
    { start: '13:30', end: '15:00', cat: 'aws', title: 'AWS: konu + lab', detail: 'Haftanın konusu + konsolda mini lab. Çıktı: mimari çizimi, hangi durumda hangi servis, yanlışların nedeni. Lab sonunda kaynakları sil.' },
    { start: '15:15', end: '16:00', cat: 'is', title: 'İş başvurusu', detail: "1 nitelikli başvuru: ilanı değerlendir, CV'yi uyarla, gönder, tracker'a yaz." },
    { start: '16:15', end: '17:15', cat: 'proje', title: 'JVM profiler', detail: 'Haftanın profiler hedefinden bir parça. Oturumu bir sonraki adımı yazarak kapat.' },
    { start: '17:15', end: '17:35', cat: 'tekrar', title: 'Ertesi gün tekrarı', detail: 'Pazartesi seminerleri: notsuz hatırla, hataları düzelt.' },
    { start: '17:35', end: '19:00', cat: 'bos', title: 'Yemek, hareket, dinlenme' },
    GUITAR,
    { start: '19:30', end: '22:15', cat: 'bos', title: 'Serbest zaman' },
    CLOSE,
  ],
  wed: [
    { start: '07:00', end: '08:00', cat: 'bos', title: 'Kahvaltı + sabah planı', detail: 'Kısa yürüyüş ya da esneme; günün 3 önceliğini yaz.' },
    { start: '08:00', end: '10:00', cat: 'fyp', title: 'FYP: derin çalışma (kod)', detail: 'Simülatör ve ajan kodu. Oturum sonunda commit + log.' },
    { start: '10:15', end: '11:00', cat: 'lc', title: 'LeetCode: yeni soru', detail: LC_NEW_DETAIL },
    { start: '11:15', end: '12:30', cat: 'tekrar', title: 'Concurrent Programming: coursework', detail: 'Bir alt görev, test ya da hata analizi; ödev yoksa CP uygulaması.' },
    { start: '12:30', end: '13:30', cat: 'bos', title: 'Öğle + yürüyüş', detail: 'Ekrandan uzaklaş.' },
    { start: '13:30', end: '15:00', cat: 'aws', title: 'AWS: uygulama', detail: 'Salı öğrendiğin mimariyi kur ya da çiz; neden bu servisleri seçtiğini açıkla.' },
    { start: '15:15', end: '16:00', cat: 'is', title: 'İş başvurusu', detail: '1 başvuru. Görüşme ya da online assessment varsa bu blok ona gider.' },
    { start: '16:15', end: '17:15', cat: 'proje', title: 'JVM profiler', detail: 'Haftanın profiler hedefinden bir parça. Oturumu bir sonraki adımı yazarak kapat.' },
    { start: '17:15', end: '17:35', cat: 'tekrar', title: 'Perşembe hazırlığı', detail: 'FM/CP başlıklarını gözden geçir, derste soracağın 1 soruyu yaz.' },
    { start: '17:35', end: '19:00', cat: 'bos', title: 'Yemek, hareket, dinlenme' },
    GUITAR,
    { start: '19:30', end: '22:15', cat: 'bos', title: 'Serbest zaman' },
    CLOSE,
  ],
  thu: [
    { start: '07:00', end: '07:30', cat: 'bos', title: 'Kahvaltı' },
    { start: '07:30', end: '08:05', cat: 'aws', title: 'AWS: kısa tekrar', detail: '20 dk eski konular + 15 dk senaryo sorusu. Yeni video yok.' },
    { start: '08:10', end: '08:45', cat: 'yol', title: 'Yol: Warren Street' },
    { start: '08:45', end: '09:00', cat: 'tekrar', title: 'Kısa tekrar', detail: 'Vadesi gelen 3-5 soru ve bugünkü ders başlıkları.' },
    { start: '09:00', end: '11:00', cat: 'ders', title: 'Formal Methods lecture', detail: '6SENG005W, Cavendish C1.03.', location: 'Cavendish C1.03' },
    { start: '11:00', end: '13:00', cat: 'ders', title: 'Concurrent Programming lecture', detail: '6SENG006W, Cavendish C1.15-16.', location: 'Cavendish C1.15-16' },
    { start: '13:00', end: '14:00', cat: 'bos', title: 'Öğle + mola' },
    { start: '14:00', end: '14:40', cat: 'tekrar', title: 'Aynı gün tekrar', detail: '20 dk FM + 20 dk CP: notsuz hatırlama, birer örnek.' },
    { start: '14:40', end: '15:15', cat: 'yol', title: 'Yol: ev' },
    { start: '15:15', end: '16:15', cat: 'tekrar', title: 'Coursework / lab', detail: 'CP: dersteki eşzamanlılık örneğini kendin yaz. FM: spec ya da ispat alıştırması.' },
    { start: '16:30', end: '17:30', cat: 'aws', title: 'AWS: soru seti', detail: 'Haftanın konularından senaryo soruları + yanlış defteri.' },
    { start: '17:30', end: '17:50', cat: 'fyp', title: 'FYP: oturum notu', detail: 'Cuma için: yaptım / takıldım / soracağım.' },
    { start: '17:50', end: '19:00', cat: 'bos', title: 'Yemek ve dinlenme' },
    GUITAR,
    { start: '19:30', end: '19:50', cat: 'lc', title: 'LeetCode: tekrar', detail: 'Eski bir sorunun yaklaşımını ve kritik kodunu yeniden kur.' },
    { start: '19:50', end: '22:15', cat: 'bos', title: 'Serbest zaman' },
    CLOSE,
  ],
  sat: [
    { start: '08:00', end: '09:00', cat: 'bos', title: 'Kahvaltı', detail: 'Hafta sonu yavaş başlangıç.' },
    { start: '09:00', end: '10:30', cat: 'aws', title: 'AWS: lab', detail: 'Haftanın senaryosunu kur. Son 15 dk: mimari kararlar ve yanlışlar.' },
    { start: '10:45', end: '11:30', cat: 'lc', title: 'LeetCode: süreli prova', detail: '1 yeni soru; sesli yaklaşım ve test örnekleriyle mülakat gibi.' },
    { start: '11:30', end: '12:30', cat: 'bos', title: 'Öğle + yürüyüş' },
    { start: '12:30', end: '14:30', cat: 'fyp', title: 'FYP: kod ve mimari', detail: 'Haftanın çıktısını toparla: bir test, bir deney ya da kısa rapor parçası.' },
    { start: '14:45', end: '15:45', cat: 'proje', title: "JVM profiler: haftanın çıktısı", detail: "Haftalık hedefi bitir, test et, README'ye ekle." },
    { start: '16:00', end: '17:00', cat: 'gitar', title: 'Gitar: uzun seans', detail: '60 dk: parçayı baştan sona çal, zor ölçüleri ayır. Haftada bir 30-60 sn kayıt al, tek gelişim noktası seç.' },
    { start: '17:00', end: '22:45', cat: 'bos', title: 'Serbest akşam', detail: 'Sosyal zaman ve dinlenme.' },
  ],
  sun: [
    { start: '08:00', end: '10:00', cat: 'bos', title: 'Serbest sabah' },
    { start: '10:00', end: '10:45', cat: 'lc', title: 'LeetCode: haftalık tekrar', detail: 'Haftanın en zor sorusunu yeniden çöz, yaklaşımı sesli açıkla.' },
    { start: '10:45', end: '11:15', cat: 'tekrar', title: 'Tekrar kuyruğu', detail: 'Sadece vadesi gelen kartlar ve yanlışlar.' },
    { start: '11:15', end: '11:45', cat: 'fyp', title: 'FYP log', detail: 'Haftanın çıktısı, sorunlar, Pazartesi ilk görev. Büyük geliştirme yok.' },
    { start: '11:45', end: '12:45', cat: 'bos', title: 'Öğle' },
    { start: '12:45', end: '13:30', cat: 'is', title: 'Başvuru takibi', detail: 'Yanıtlar, son tarihler, gelecek haftanın 3 hedef ilanı.' },
    { start: '13:30', end: '14:00', cat: 'rev', title: 'Haftalık plan', detail: "3 ana çıktı seç: bir akademik, bir FYP, bir AWS. Teslimler'de önümüzdeki 21 güne bak." },
    { start: '14:00', end: '14:30', cat: 'gitar', title: 'Gitar (rahat)', detail: 'Sevdiğin parçaları çal.' },
    { start: '14:30', end: '22:15', cat: 'bos', title: 'Serbest yarım gün', detail: 'Telafi maratonu yok.' },
    CLOSE,
  ],
  monthSun: [
    { start: '08:00', end: '09:00', cat: 'bos', title: 'Kahvaltı' },
    { start: '09:00', end: '09:30', cat: 'fyp', title: 'FYP log', detail: 'Haftanın çıktısı ve Pazartesi ilk görev.' },
    { start: '09:30', end: '10:15', cat: 'tekrar', title: 'Formal Methods: aylık tekrar', detail: 'Önceki 4 haftadan karışık sorular; en zayıf 3 konuyu kaydet.' },
    { start: '10:15', end: '11:00', cat: 'tekrar', title: 'Concurrent Programming: aylık tekrar', detail: 'Kavram, kod ve hata analizi.' },
    { start: '11:00', end: '11:30', cat: 'rev', title: 'Aylık kontrol', detail: 'Tekrar ve kurallar sekmesindeki aylık listeyi uygula.' },
    { start: '11:30', end: '12:00', cat: 'lc', title: 'LeetCode: tekrar', detail: 'Önceki aylardan bir soru.' },
    { start: '12:00', end: '13:00', cat: 'bos', title: 'Öğle' },
    { start: '13:00', end: '13:45', cat: 'is', title: 'Başvuru takibi', detail: 'Huni oranları ve gelecek haftanın ilanları.' },
    { start: '13:45', end: '14:15', cat: 'gitar', title: 'Gitar + aylık kayıt', detail: 'Parçayı kaydet, önceki ayla karşılaştır.' },
    { start: '14:15', end: '22:15', cat: 'bos', title: 'Serbest' },
    CLOSE,
  ],
  mockSat: [
    { start: '08:00', end: '09:00', cat: 'bos', title: 'Kahvaltı' },
    { start: '09:00', end: '11:10', cat: 'aws', title: 'AWS: tam deneme (130 dk)', detail: '65 soru, görülmemiş sorular, sınav temposu. Mola yok.' },
    { start: '11:10', end: '11:30', cat: 'bos', title: 'Ara' },
    { start: '11:30', end: '12:15', cat: 'aws', title: 'Deneme analizi', detail: 'Bilgi eksiği mi, okuma hatası mı? Her yanlışı yanlış defterine yaz, skoru kaydet.' },
    { start: '12:15', end: '13:15', cat: 'bos', title: 'Öğle + yürüyüş' },
    { start: '13:15', end: '15:00', cat: 'fyp', title: 'FYP: kod ve mimari', detail: 'Haftanın çıktısını toparla.' },
    { start: '15:15', end: '16:00', cat: 'proje', title: 'JVM profiler', detail: 'Haftalık hedefi bitir.' },
    { start: '16:15', end: '17:15', cat: 'gitar', title: 'Gitar: uzun seans' },
    { start: '17:15', end: '22:45', cat: 'bos', title: 'Serbest akşam' },
  ],
  awsExam: [
    { start: '07:00', end: '08:00', cat: 'bos', title: 'Kahvaltı' },
    { start: '08:00', end: '08:45', cat: 'aws', title: 'Son göz gezdirme', detail: 'Yalnızca yanlış defteri ve servis karşılaştırmaları. Yeni konu yok.' },
    { start: '09:00', end: '13:30', cat: 'aws', title: 'SAA-C03 sınav penceresi', detail: 'Randevu saatine göre düzelt: 130 dk sınav + giriş + yol.' },
    { start: '13:30', end: '19:00', cat: 'bos', title: 'Serbest', detail: 'Bugün başka blok yok.' },
    GUITAR,
    { start: '19:30', end: '22:15', cat: 'bos', title: 'Serbest zaman' },
    CLOSE,
  ],
  rev: [
    { start: '08:00', end: '09:00', cat: 'bos', title: 'Kahvaltı' },
    { start: '09:00', end: '09:45', cat: 'fyp', title: 'FYP: yazım', detail: 'Literatür bölümü ya da deney notları.' },
    { start: '10:00', end: '11:30', cat: 'tekrar', title: 'Değerlendirme hazırlığı', detail: 'FM ve CP gün gün dönüşümlü. Resmî teslimin varsa bu blok onun için.' },
    { start: '11:30', end: '12:00', cat: 'tekrar', title: 'Tekrar kuyruğu', detail: 'Yanlışlar ve vadesi gelenler.' },
    { start: '12:00', end: '13:00', cat: 'bos', title: 'Öğle' },
    { start: '13:00', end: '13:30', cat: 'lc', title: 'LeetCode: tekrar', detail: '1 eski soru; yeni soru şartı yok.' },
    { start: '13:30', end: '14:15', cat: 'proje', title: 'Profiler ya da başvuru', detail: 'Gün aşırı değiştir.' },
    { start: '14:30', end: '15:30', cat: 'fyp', title: 'FYP: kod / deney', detail: 'Deneyleri tekrar çalıştır, sonuç tablosunu güncelle.' },
    { start: '15:45', end: '16:15', cat: 'gitar', title: 'Gitar' },
    { start: '16:15', end: '22:15', cat: 'bos', title: 'Tatil ve dinlenme' },
    CLOSE,
  ],
  revSat: [
    { start: '09:00', end: '10:00', cat: 'bos', title: 'Kahvaltı' },
    { start: '10:00', end: '11:00', cat: 'proje', title: 'JVM profiler' },
    { start: '11:00', end: '11:30', cat: 'lc', title: 'LeetCode: tekrar' },
    { start: '11:30', end: '16:00', cat: 'bos', title: 'Serbest' },
    { start: '16:00', end: '17:00', cat: 'gitar', title: 'Gitar: uzun seans' },
    { start: '17:00', end: '22:45', cat: 'bos', title: 'Serbest akşam' },
  ],
  light: [
    { start: '08:30', end: '09:00', cat: 'bos', title: 'Kahvaltı' },
    { start: '09:00', end: '09:45', cat: 'fyp', title: 'FYP: kısa', detail: 'Günlük kayıt ya da küçük düzeltme.' },
    { start: '10:00', end: '11:00', cat: 'tekrar', title: 'FM / CP tekrarı', detail: 'Dönüşümlü, hafif.' },
    { start: '11:15', end: '11:35', cat: 'lc', title: 'LeetCode: tekrar' },
    { start: '11:35', end: '11:55', cat: 'proje', title: 'Profiler: bakım' },
    { start: '12:00', end: '15:00', cat: 'bos', title: 'Tatil' },
    { start: '15:00', end: '15:30', cat: 'gitar', title: 'Gitar' },
    { start: '15:30', end: '22:45', cat: 'bos', title: 'Tatil' },
  ],
  lightDay: [
    { start: '09:00', end: '09:10', cat: 'fyp', title: 'FYP: kısa not' },
    { start: '09:10', end: '09:20', cat: 'proje', title: 'Profiler: sonraki görevi yaz' },
    { start: '09:20', end: '09:30', cat: 'lc', title: 'LeetCode: bir yaklaşımı hatırla' },
    { start: '09:30', end: '09:40', cat: 'tekrar', title: 'Birkaç tekrar kartı' },
    { start: '09:40', end: '10:10', cat: 'gitar', title: 'Gitar (keyif için)' },
    { start: '10:10', end: '22:45', cat: 'bos', title: 'Serbest gün', detail: 'Bu hafif günü istersen başka bir güne taşıyabilirsin.' },
  ],
  exam: [
    { start: '07:30', end: '09:00', cat: 'bos', title: 'Kahvaltı', detail: 'Gerçek sınav günüysen bu plan geçersiz: sınav saati ve yol esas.' },
    { start: '09:00', end: '10:30', cat: 'tekrar', title: 'En yakın değerlendirme: odak', detail: 'Süreli soru ya da coursework eksik bölümü; notsuz.' },
    { start: '10:45', end: '12:00', cat: 'tekrar', title: 'Hata analizi + eksik kapatma', detail: 'Sabahki çalışmayı kontrol et, ikinci modüle geç.' },
    { start: '12:00', end: '13:00', cat: 'bos', title: 'Öğle + yürüyüş' },
    { start: '13:00', end: '14:00', cat: 'tekrar', title: 'İkinci modül / teslim kontrolü', detail: 'Kısa soru seti; ertesi günün değerlendirmesi öncelikli.' },
    { start: '14:00', end: '14:20', cat: 'tekrar', title: 'Tekrar kuyruğu', detail: 'Yeni konu açmadan hata listesi.' },
    { start: '14:30', end: '14:50', cat: 'fyp', title: 'FYP: bakım', detail: '20 dk günlük kayıt ya da küçük görev.' },
    { start: '14:50', end: '15:05', cat: 'proje', title: 'Profiler: bakım' },
    { start: '15:05', end: '15:20', cat: 'lc', title: 'LeetCode: eski kolay soru', detail: 'Sınav günü isteğe bağlı.' },
    { start: '15:20', end: '15:50', cat: 'gitar', title: 'Gitar (rahatlatıcı)' },
    { start: '15:50', end: '22:15', cat: 'bos', title: 'Dinlenme', detail: 'Acil başvuru en fazla 20 dk. Uykudan ödün verme.' },
    CLOSE,
  ],
  examSun: [
    { start: '07:30', end: '09:00', cat: 'bos', title: 'Kahvaltı' },
    { start: '09:00', end: '10:30', cat: 'tekrar', title: 'En yakın değerlendirme: odak' },
    { start: '10:45', end: '12:00', cat: 'tekrar', title: 'Hata analizi' },
    { start: '12:00', end: '12:20', cat: 'fyp', title: 'FYP: kısa not' },
    { start: '12:20', end: '12:35', cat: 'proje', title: 'Profiler: bakım' },
    { start: '12:35', end: '12:50', cat: 'lc', title: 'LeetCode: tekrar' },
    { start: '12:50', end: '13:20', cat: 'gitar', title: 'Gitar' },
    { start: '13:20', end: '22:15', cat: 'bos', title: 'Serbest', detail: 'Yakın sınav varsa yalnızca kısa tekrar.' },
    CLOSE,
  ],
  friMeeting: [
    { start: '07:00', end: '08:00', cat: 'bos', title: 'Kahvaltı', detail: 'Evden çalışma günü.' },
    { start: '08:00', end: '08:30', cat: 'tekrar', title: 'Ertesi gün tekrarı', detail: "Perşembe lecture'ları: 15'er dk FM ve CP, notsuz." },
    { start: '08:30', end: '08:55', cat: 'fyp', title: 'Oturum hazırlığı', detail: 'Gündem, haftanın çıktısı, sorular.' },
    { start: '09:00', end: '11:00', cat: 'fyp', title: '6SENG010W oturumu (online)', detail: "Rolf Banziger. Aksiyonları anında yaz; supervisor'a gidecek soruları ayır. Güncel CMISGo/Blackboard duyurusu önceliklidir.", location: 'Online (canlı)' },
    { start: '11:15', end: '12:00', cat: 'tekrar', title: 'Haftalık FM + CP sentezi', detail: SYNTHESIS_DETAIL },
    { start: '12:00', end: '13:00', cat: 'bos', title: 'Öğle + yürüyüş' },
    { start: '13:00', end: '14:00', cat: 'fyp', title: 'FYP: geri bildirimi uygula', detail: 'Oturumdan çıkan ilk aksiyona hemen başla.' },
    { start: '14:15', end: '15:00', cat: 'lc', title: 'LeetCode: yeni soru', detail: '1 yeni soru; hata günlüğünü güncelle.' },
    { start: '15:15', end: '16:00', cat: 'aws', title: 'AWS: yanlış analizi', detail: '10-15 soru. Her yanlışta diğer seçeneklerin neden elendiğini yaz.' },
    { start: '16:00', end: '16:45', cat: 'is', title: 'Başvuru + networking', detail: '1 başvuru ya da 2 LinkedIn mesajı.' },
    { start: '16:45', end: '19:00', cat: 'bos', title: 'Dinlenme ve yemek' },
    GUITAR,
    { start: '19:30', end: '22:45', cat: 'bos', title: 'Cuma akşamı serbest' },
  ],
  friNoMeeting: [
    { start: '07:00', end: '08:00', cat: 'bos', title: 'Kahvaltı', detail: 'Evden çalışma günü.' },
    { start: '08:00', end: '08:30', cat: 'tekrar', title: 'Ertesi gün tekrarı', detail: "Perşembe lecture'ları: 15'er dk FM ve CP, notsuz." },
    { start: '08:30', end: '08:55', cat: 'fyp', title: 'FYP: hedef seç', detail: 'Bugünkü iki saatin tek hedefini yaz.' },
    { start: '09:00', end: '11:00', cat: 'fyp', title: 'FYP: derin çalışma', detail: 'Oturum yok: bu iki saat bağımsız proje çalışması.' },
    { start: '11:15', end: '12:00', cat: 'tekrar', title: 'Haftalık FM + CP sentezi', detail: SYNTHESIS_DETAIL },
    { start: '12:00', end: '13:00', cat: 'bos', title: 'Öğle + yürüyüş' },
    { start: '13:00', end: '14:00', cat: 'tekrar', title: 'En yakın değerlendirme', detail: 'FM, CP ya da FYP tesliminden en yakın olana çalış.' },
    { start: '14:15', end: '15:00', cat: 'lc', title: 'LeetCode: yeni soru', detail: '1 yeni soru; hata günlüğünü güncelle.' },
    { start: '15:15', end: '16:00', cat: 'aws', title: 'AWS: yanlış analizi', detail: '10-15 soru. Her yanlışta diğer seçeneklerin neden elendiğini yaz.' },
    { start: '16:00', end: '16:45', cat: 'is', title: 'Başvuru + networking', detail: '1 başvuru ya da 2 LinkedIn mesajı.' },
    { start: '16:45', end: '19:00', cat: 'bos', title: 'Dinlenme ve yemek' },
    GUITAR,
    { start: '19:30', end: '22:45', cat: 'bos', title: 'Cuma akşamı serbest' },
  ],
};

export const WEEKS: Week[] = [
  {
    start: '2026-09-21',
    label: 'Öğretim haftası 1',
    mode: 'teach',
    fypSession: true,
    focus: {
      fyp: 'Literatür: MARL (MAPPO, QMIX, MADDPG) ve RL tabanlı K8s autoscaling. Okuma tablosu kur.',
      aws: 'Kursu bölümlere ayır. IAM, Regions/AZ, shared responsibility.',
      lc: 'Arrays & Hashing',
      is: 'CV, GitHub, tracker (şirket, rol, link, son tarih, gönderim, CV sürümü, sonraki adım).',
      ders: 'Değerlendirme türleri, ağırlıklar, teslim saatleri, Teslimler sekmesine gir.',
      proje: 'Kapsam + repo. premain ile yüklenen en basit Java agent.',
      gitar: 'For Whom the Bell Tolls: intro, metronomla yavaş.',
    },
    note: "25 Eylül'den itibaren uygula; geçmiş günler için telafi yok. Pazar 27 Eyl: başlangıç kontrolü, AWS randevusunu 25 Kasım'a al.",
  },
  {
    start: '2026-09-28',
    label: 'Öğretim haftası 2',
    mode: 'teach',
    fypSession: true,
    focus: {
      fyp: '2-3 araştırma sorusu; mevcut K8s simülatörlerini karşılaştır.',
      aws: 'EC2, EBS / EFS / instance store.',
      lc: 'Arrays & Hashing + Two Pointers',
      is: '3 başvuru; 1 STAR hikâyesi.',
      proje: "Attach API: çalışan bir JVM'e agentmain ile bağlan.",
      gitar: 'Intro + ana riff, palm muting.',
    },
  },
  {
    start: '2026-10-05',
    label: 'Öğretim haftası 3',
    mode: 'teach',
    fypSession: true,
    focus: {
      fyp: 'Simülatör kararı (Gymnasium / PettingZoo). HPA baseline tasarımı.',
      aws: 'ELB, Auto Scaling, RDS / Aurora, ElastiCache.',
      lc: 'Sliding Window + Stack',
      is: "3 başvuru; CV'de proje çıktısını ölçülebilir yaz.",
      proje: 'Sampling döngüsü: sabit aralıkla thread stack trace topla.',
    },
  },
  {
    start: '2026-10-12',
    label: 'Öğretim haftası 4',
    mode: 'teach',
    fypSession: true,
    focus: {
      fyp: 'Proje önerisi taslağı. Simülatör iskeleti: node, pod, workload modeli.',
      aws: 'Route 53, S3 (temel, ileri, güvenlik).',
      lc: 'Binary Search',
      is: '3 başvuru; 2 davranışsal yanıt prova et.',
      proje: "Stack'leri birleştir (collapsed stack formatı), en sıcak metodları listele.",
      gitar: 'Kıta geçişleri.',
    },
  },
  {
    start: '2026-10-19',
    label: 'Öğretim haftası 5',
    mode: 'teach',
    fypSession: true,
    monthlyReview: true,
    focus: {
      fyp: 'Öneriyi 23 Eki oturumuna götür (son haftalık oturum), geri bildirimi işle.',
      aws: 'CloudFront, Global Accelerator, Snow / FSx / Storage Gateway.',
      lc: 'Linked List',
      is: '3 başvuru + online assessment pratiği.',
      proje: 'Flame graph çıktısı (HTML/SVG). İlk demo + README.',
      gitar: 'Tüm şarkı yavaş; ilk kayıt.',
    },
    note: 'Pazar 25 Eki: aylık kontrol.',
  },
  {
    start: '2026-10-26',
    label: 'Ders listelenmeyen hafta',
    mode: 'gap',
    fypSession: false,
    overrides: { 5: 'mockSat' },
    focus: {
      fyp: 'Simülatör MVP + tek ajanlı PPO baseline çalışır halde.',
      aws: 'SQS / SNS / Kinesis, ECS / EKS / Fargate, Lambda, API Gateway, DynamoDB. Cmt 31 Eki: 1. tam deneme.',
      lc: 'Trees',
      is: "3-4 başvuru; tracker'ı temizle.",
      ders: "Eksik kapatma; coursework'te öne geç.",
      proje: 'Yeni kapsam yok: hata düzelt, mevcut özelliği bitir.',
    },
    note: 'Görselde bu hafta ders yok ama tatil olarak doğrulanmadı; üniversite takvimine bak. Etkinlik yoksa Pazartesi ve Perşembe derin çalışma günü.',
  },
  {
    start: '2026-11-02',
    label: 'Öğretim haftası 6',
    mode: 'teach',
    fypSession: true,
    overrides: { 5: 'mockSat' },
    focus: {
      fyp: 'Multi-agent kurulum (PettingZoo), ödül tasarımı. 6 Kas oturumuna demo.',
      aws: 'KMS, Secrets Manager, WAF, CloudWatch / CloudTrail / Config, VPC. Cmt 7 Kas: 2. deneme.',
      lc: 'Trees + Tries',
      is: '3 başvuru; 1 mülakat provası.',
      proje: "CPU ve wall-clock modu; sadece çalışan thread'ler.",
    },
  },
  {
    start: '2026-11-09',
    label: 'Öğretim haftası 7',
    mode: 'teach',
    fypSession: false,
    overrides: { 5: 'mockSat' },
    focus: {
      fyp: 'İlk deneyler: MARL vs HPA, küçük ölçek.',
      aws: 'DR ve migration, maliyet, analytics / ML servisleri; kurs turu biter. Cmt 14 Kas: 3. deneme (hazır oluş kontrolü).',
      lc: 'Heap / Priority Queue',
      is: '3 başvuru.',
      proje: 'Overhead ölçümü: profiler açık / kapalı benchmark.',
      gitar: 'Daha hızlı tempo.',
    },
  },
  {
    start: '2026-11-16',
    label: 'Öğretim haftası 8',
    mode: 'teach',
    fypSession: false,
    overrides: { 5: 'mockSat' },
    focus: {
      fyp: 'Deney loglama + sonuç tablosu şablonu.',
      aws: 'Yanlış defteri, zayıf alanlar. Cmt 21 Kas: 4. deneme (son).',
      lc: 'Backtracking (3 yeni)',
      is: '3 başvuru.',
      ders: 'Geçici Ocak sınav takvimini kontrol et.',
      proje: 'Küçük iş: CLI argümanları.',
    },
    note: "14 ve 21 Kasım denemelerinde ~%80-85 ve süre içinde bitirdiysen 25 Kasım'da gir; değilse 2 Aralık.",
  },
  {
    start: '2026-11-23',
    label: 'Öğretim haftası 9',
    mode: 'teach',
    fypSession: false,
    monthlyReview: true,
    awsDoneFromDay: 3,
    overrides: { 2: 'awsExam' },
    focus: {
      fyp: 'Değerlendirme planı: SLO ihlali, kaynak kullanımı, maliyet.',
      aws: 'Pzt-Sal hafif tekrar. Çarşamba 25 Kas: SINAV (hedef).',
      lc: 'Graphs (hafif)',
      is: '2 başvuru.',
      proje: 'Hafif hafta.',
    },
    note: 'AWS sınav haftası. Pazar 29 Kas: aylık kontrol.',
  },
  {
    start: '2026-11-30',
    label: 'Öğretim haftası 10',
    mode: 'teach',
    fypSession: true,
    awsDone: true,
    focus: {
      fyp: '4 Ara oturumu: ilerleme raporu + ön sonuçlar. Sim-to-real için kind / minikube.',
      aws: "Gerekirse 2 Ara yedek sınav. Sonra sertifikayı CV ve LinkedIn'e ekle.",
      lc: 'Graphs',
      is: '3 başvuru.',
      ders: 'Teslim yoğunluğu: geri sayım kuralını uygula.',
      proje: "Safepoint bias: README'ye sınırlamalar bölümü.",
    },
  },
  {
    start: '2026-12-07',
    label: 'Öğretim haftası 11 (son)',
    mode: 'teach',
    fypSession: false,
    awsDone: true,
    focus: {
      fyp: "Ara rapor / literatür bölümü taslağı; 2. dönemin ilk adımları.",
      lc: '1-D Dynamic Programming',
      is: 'Takip e-postaları.',
      ders: '11 Ara son ders günü. Kalan teslimler; kesin sınav takvimini kontrol et.',
      proje: 'v0.1 sürüm + 2 dakikalık anlatım.',
      gitar: 'Tam tempo + solo; kayıt.',
    },
  },
  {
    start: '2026-12-14',
    label: 'Tatil: üniversite tekrarı',
    mode: 'revision',
    fypSession: false,
    awsDone: true,
    focus: {
      fyp: 'Literatür bölümü; deneyleri tekrar çalıştır.',
      lc: 'Karışık tekrar',
      ders: 'FM/CP ilk tam tekrar turu: notlar, hata listeleri, örnek değerlendirmeler.',
      is: '1-2 başvuru.',
    },
  },
  {
    start: '2026-12-21',
    label: 'Tatil: hafif hafta',
    mode: 'light',
    fypSession: false,
    monthlyReview: true,
    awsDone: true,
    overrides: { 4: 'lightDay' },
    focus: {
      lc: 'Günde 20 dk tekrar',
      fyp: 'Günde en fazla 45 dk.',
      gitar: 'Serbest; yeni bir şarkı seç.',
    },
    note: '25 Aralık hafif gün. Pazar 27 Ara: aylık kontrol.',
  },
  {
    start: '2026-12-28',
    label: 'Sınav hazırlığı',
    mode: 'revision',
    fypSession: false,
    awsDone: true,
    overrides: { 4: 'lightDay' },
    focus: {
      ders: 'Süreli denemeler, sonuç analizi.',
      lc: 'Günde 20-30 dk tekrar',
    },
    note: '1 Ocak hafif gün.',
  },
  {
    start: '2027-01-04',
    label: 'Sınav dönemi',
    mode: 'exam',
    fypSession: false,
    awsDone: true,
    focus: {
      ders: 'Gerçek sınav ve teslim saatleri her bloğun önünde. Diğer günlerde en yakın değerlendirme.',
      lc: '15 dk eski kolay soru',
      fyp: 'Günde 20 dk bakım.',
    },
    note: 'Genel sınav dönemi 4-15 Ocak. Kendi CMISGo takvimin esas.',
  },
  {
    start: '2027-01-11',
    label: 'Sınav dönemi (son)',
    mode: 'exam',
    fypSession: false,
    monthlyReview: true,
    awsDone: true,
    focus: {
      ders: '15 Ocak dönem sonu.',
      fyp: 'Son sınavdan sonra 2. dönem görevlerini sırala.',
      proje: "Sertifikayı profiler'a uygulayacağın küçük bir adım seç.",
    },
    note: 'Pazar 17 Oca: dönem sonu kontrolü ve 2. dönem planı.',
  },
];

/** Shown instead of the day's blocks when "bad day mode" is on. */
export const BAD_DAY: { cat: CategoryId; title: string; detail?: string }[] = [
  { cat: 'tekrar', title: 'En yakın değerlendirmeden tek görev', detail: 'Coursework, sınav ya da FYP teslimi: hangisi en yakınsa.' },
  { cat: 'fyp', title: 'FYP: 20 dk', detail: 'Tek küçük görev ya da log.' },
  { cat: 'proje', title: 'Profiler: 15 dk', detail: 'Bir test, bir hata ya da sonraki adımı yazmak.' },
  { cat: 'lc', title: 'LeetCode tekrar: 15 dk', detail: 'Eski bir soru.' },
  { cat: 'gitar', title: 'Gitar: 15-30 dk' },
  { cat: 'rev', title: "22:45'te yat", detail: 'Kaçanları yarına taşıma.' },
];

export const DEFAULT_DEADLINES: Deadline[] = [
  { title: 'Formal Methods coursework (tarih ve saati gir)', date: null, cat: 'tekrar' },
  { title: 'Concurrent Programming coursework (tarih ve saati gir)', date: null, cat: 'tekrar' },
  { title: 'FYP resmî teslimleri (tarihleri gir)', date: null, cat: 'fyp' },
  { title: "Ocak sınavlarım (CMISGo'dan gir)", date: null, cat: 'ders' },
  { title: 'Başlangıç kontrolü + AWS randevusunu al', date: '2026-09-27', cat: 'rev' },
  { title: 'Son haftalık FYP oturumu', date: '2026-10-23', cat: 'fyp' },
  { title: 'Aylık kontrol', date: '2026-10-25', cat: 'rev' },
  { title: 'AWS 1. tam deneme', date: '2026-10-31', cat: 'aws' },
  { title: 'FYP oturumu', date: '2026-11-06', cat: 'fyp' },
  { title: 'AWS 2. tam deneme', date: '2026-11-07', cat: 'aws' },
  { title: 'AWS 3. deneme: hazır oluş kontrolü', date: '2026-11-14', cat: 'aws' },
  { title: 'Geçici Ocak sınav takvimini kontrol et', date: '2026-11-16', cat: 'ders' },
  { title: 'AWS 4. tam deneme (son)', date: '2026-11-21', cat: 'aws' },
  { title: 'AWS SAA-C03 sınavı (hedef)', date: '2026-11-25', cat: 'aws' },
  { title: 'Aylık kontrol', date: '2026-11-29', cat: 'rev' },
  { title: 'AWS yedek sınav tarihi (gerekirse)', date: '2026-12-02', cat: 'aws' },
  { title: 'FYP oturumu', date: '2026-12-04', cat: 'fyp' },
  { title: 'Son ders günü', date: '2026-12-11', cat: 'ders' },
  { title: 'Aylık kontrol', date: '2026-12-27', cat: 'rev' },
  { title: 'Sınav dönemi başlar', date: '2027-01-04', cat: 'ders' },
  { title: 'Sınav dönemi biter', date: '2027-01-15', cat: 'ders' },
  { title: 'Dönem sonu kontrolü + 2. dönem planı', date: '2027-01-17', cat: 'rev' },
];

export const REVIEWS = {
  daily: {
    title: 'Günlük',
    when: 'Derslerden hemen sonra, ertesi gün ve akşam kapanışında',
    items: [
      "Aynı gün: Pazartesi seminerlerinden sonra 15'er dk, Perşembe lecture'larından sonra 20'şer dk. Notsuz 3 ana fikir, 1 örnek, 1 soru.",
      "Ertesi gün: Pazartesi içeriği Salı 17:15'te, Perşembe içeriği Cuma 08:00'de.",
      '3 / 7 / 30 gün kuyruğu: Pazartesi sabahı, Perşembe 08:45 ve Pazar blokları. Sıra: yanlışlar, yaklaşan değerlendirme, kolay eski konular.',
      "Kapanış (22:15): blokları işaretle, FYP log'a 3 satır: ne yaptım, ne öğrendim, ilk sonraki adım.",
      "LeetCode'da takıldığın soruyu 1, 7 ve 30 gün sonrasına tekrar kuyruğuna koy.",
    ],
  },
  weekly: {
    title: 'Haftalık',
    when: 'Cuma 11:15 ders sentezi, Pazar 13:30 plan',
    items: [
      'Cuma sentezi: haftanın FM ve CP konularını tek sayfada birleştir (zihin haritası ya da kısa özet, açık sorular).',
      'Pazar planı: sadece 3 ana çıktı seç: bir akademik, bir FYP, bir AWS.',
      'Kaçan bloklara bak: plan mı fazla, gün mü kötüydü?',
      "Teslimler'de önümüzdeki 21 güne bak ve geri sayım kuralını uygula.",
      'AWS yanlış defterinde en sık 3 hatayı yaz.',
      'Başvuru takibi: gönderilen, yanıt, sonraki adım.',
    ],
  },
  monthly: {
    title: 'Aylık',
    when: '25 Eki, 29 Kas, 27 Ara, 17 Oca (Pazar sabahı)',
    items: [
      "FM + CP: 45'er dk, önceki 4 haftadan karışık sorular; en zayıf 3 konu.",
      'AWS: deneme skoru trendi ve alan bazlı zayıflar (güvenli %30, dayanıklı %26, performans %24, maliyet %20).',
      'FYP: kilometre taşları plana göre nerede? Gerekirse yol haritasını kaydır.',
      'Başvuru hunisi: başvuru, test, mülakat oranları; hangi CV sürümü yanıt alıyor?',
      'Profiler ve gitar: ayın demosu ve 30-60 sn kayıt, öncekiyle karşılaştır.',
      'Plan: sürekli kaçan blokları sil ya da küçült.',
    ],
  },
} as const;

export const RULES = {
  courseworkCountdown: [
    { daysBefore: 21, task: 'Brief ve rubriği oku, işi küçük görevlere böl.' },
    { daysBefore: 14, task: 'Çalışan ilk sürüm ya da tam çözüm iskeleti.' },
    { daysBefore: 7, task: "Ana içerik bitti; eksik test, ispat, analiz ve rapor kapanıyor. Profiler ve Cumartesi AWS lab'ı bu işe geçer." },
    { daysBefore: 3, task: 'Rubrik üzerinden son kontrol: kaynaklar, dosyalar, çalıştırma, format.' },
    { daysBefore: 2, task: 'Kişisel erken teslim; doğru dosyayı ve teslim kaydını kontrol et.' },
  ],
  whenPlanSlips: [
    'Kaçan blokları ertesi güne taşıma.',
    'Ertesi günün birinci önceliği en yakın gerçek değerlendirme, sonra FYP ve AWS.',
    'İki hafta üst üste plan yetişmiyorsa önce profiler kapsamını ve yeni soru sayısını küçült; uyku ve yemek korunur.',
    'Sınavdan 14 gün önce: coursework blokları süreli sorulara döner; profiler günlük 15 dk, yeni LeetCode haftada 2, başvurular 1-2.',
    'Sınav günü: sınav, giriş ve yol her şeyin önünde; diğer alışkanlıklar 10-15 dk\'ya iner ya da atlanır.',
  ],
  awsReadiness: [
    '14 ve 21 Kasım denemelerinde, görülmemiş sorularda ~%80-85.',
    '130 dakikada rahat bitirme.',
    'Yanlış seçeneklerin neden yanlış olduğunu açıklayabilme.',
    'Sağlanmıyorsa 25 Kasım yerine 2 Aralık; açığı kapatmak için önce profiler ve yeni LeetCode azalır, uyku azalmaz.',
    'Resmî geçme puanı ölçeklenmiş 720/1000; bu eşik kişisel.',
  ],
} as const;

/**
 * Per-category hue.
 *
 * The site is single-accent by rule, and this is the scoped exception: the
 * colour is the only thing telling two adjacent blocks apart at 12px in a
 * seven-column grid, so it carries meaning rather than variety. Same
 * justification as the /tokyo spend categories. Values are the dark set from
 * the reference artifact, which was already picked against a near-black panel.
 */
export const CATEGORY_COLOUR: Record<CategoryId, string> = {
  ders: '#7d9cc8',
  tekrar: '#78a6cc',
  fyp: '#3fb4a3',
  aws: '#e8a93a',
  lc: '#a78bdb',
  is: '#5dbb85',
  proje: '#e27da3',
  gitar: '#d9586e',
  rev: '#9aa2b0',
  bos: '#4a5361',
  yol: '#4a5361',
};

// ---------------------------------------------------------------- helpers

export const DAY_NAMES = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'] as const;
export const DAY_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'] as const;
export const MONTH_SHORT = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'] as const;

export const toHours = (t: string): number => {
  const [h, m] = t.split(':').map(Number);
  return h + m / 60;
};
export const parseISO = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (d: Date, n: number): Date => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
export const toISO = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const formatShort = (d: Date): string => `${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
/** Monday = 0 */
export const dayIndex = (d: Date): number => (d.getDay() + 6) % 7;

export function isInSemester(d: Date): boolean {
  return d >= parseISO(WEEKS[0].start) && d < addDays(parseISO(WEEKS[WEEKS.length - 1].start), 7);
}

/** Index into WEEKS for a date; clamps to first/last week outside the range. */
export function weekIndexFor(d: Date): number {
  for (let i = 0; i < WEEKS.length; i++) {
    const s = parseISO(WEEKS[i].start);
    if (d >= s && d < addDays(s, 7)) return i;
  }
  return d < parseISO(WEEKS[0].start) ? 0 : WEEKS.length - 1;
}

const AWS_DONE_BLOCK = {
  cat: 'tekrar' as CategoryId,
  title: 'Serbest çalışma bloğu',
  detail:
    "AWS bitti: önce yaklaşan coursework, yoksa FYP ya da profiler. Sınavı 2 Aralık'a kaydırdıysan bu blok o tarihe kadar AWS kalır.",
};

/** The 7 days (Mon..Sun) of blocks for a week, with all week rules applied. */
export function blocksForWeek(w: Week): Block[][] {
  const T = TEMPLATES;
  let days: Block[][];
  switch (w.mode) {
    case 'teach':
      days = [T.mon, T.tue, T.wed, T.thu, w.fypSession ? T.friMeeting : T.friNoMeeting, T.sat, T.sun];
      break;
    case 'gap':
      days = [T.tue, T.tue, T.wed, T.wed, T.friNoMeeting, T.sat, T.sun];
      break;
    case 'revision':
      days = [T.rev, T.rev, T.rev, T.rev, T.rev, T.revSat, T.sun];
      break;
    case 'light':
      days = [T.light, T.light, T.light, T.light, T.light, T.light, T.light];
      break;
    default:
      days = [T.exam, T.exam, T.exam, T.exam, T.exam, T.exam, T.examSun];
  }
  days = days.map((d) => d.map((b) => ({ ...b })));
  if (w.monthlyReview) days[6] = TEMPLATES.monthSun.map((b) => ({ ...b }));
  if (w.overrides) {
    for (const [k, id] of Object.entries(w.overrides)) {
      if (id) days[+k] = TEMPLATES[id].map((b) => ({ ...b }));
    }
  }
  const from = w.awsDone ? 0 : w.awsDoneFromDay ?? 7;
  return days.map((d, i) =>
    i < from ? d : d.map((b) => (b.cat === 'aws' ? { ...b, ...AWS_DONE_BLOCK } : b))
  );
}

/** Blocks for a single date, or null outside the semester. */
export function blocksForDate(
  d: Date
): { week: Week; weekNumber: number; blocks: Block[] } | null {
  if (!isInSemester(d)) return null;
  const i = weekIndexFor(d);
  return { week: WEEKS[i], weekNumber: i + 1, blocks: blocksForWeek(WEEKS[i])[dayIndex(d)] };
}

/** Whole days from today to an ISO date (negative = past). */
export function daysUntil(iso: string, today = new Date()): number {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((parseISO(iso).getTime() - t.getTime()) / 864e5);
}
