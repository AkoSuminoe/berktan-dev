/**
 * Final year Semester 1 plan (2026/27), University of Westminster.
 * Single source of truth for the /semester page on berktan.dev.
 * Framework-agnostic: pure data + pure helpers, no DOM, no React.
 *
 * Times are UK local "HH:MM". Dates are ISO "YYYY-MM-DD" (local, not UTC).
 * Day indices: 0 = Monday ... 6 = Sunday.
 *
 * Range dashes are plain hyphens throughout, per Hard Rule 5.
 *
 * To change the plan, edit this file. The page reads everything from here and
 * holds no schedule data of its own.
 */

export type CategoryId =
  | 'classes'
  | 'revision'
  | 'fyp'
  | 'aws'
  | 'leetcode'
  | 'jobs'
  | 'profiler'
  | 'guitar'
  | 'planning'
  | 'free'
  | 'commute';

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

/**
 * The week's headline per stream.
 *
 * Every key is also a `CategoryId`, deliberately: the focus card and the
 * blocks it describes then share one colour without a second lookup table
 * that could fall out of step.
 */
export type FocusKey = Extract<
  CategoryId,
  'classes' | 'fyp' | 'aws' | 'leetcode' | 'jobs' | 'profiler' | 'guitar'
>;

export type WeekFocus = Partial<Record<FocusKey, string>>;

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
  classes: 'Classes',
  revision: 'Revision and coursework',
  fyp: 'Final year project',
  aws: 'AWS SAA-C03',
  leetcode: 'LeetCode and NeetCode',
  jobs: 'Job applications',
  profiler: 'JVM profiler',
  guitar: 'Guitar',
  planning: 'Planning',
  free: 'Break and free time',
  commute: 'Commute',
};

/** Categories rendered as soft/dashed and without a checkbox. */
export const SOFT_CATEGORIES: CategoryId[] = ['free', 'commute'];

export const COURSES: Course[] = [
  {
    code: '6SENG005W',
    name: 'Formal Methods',
    type: 'Seminar',
    day: 'Monday',
    time: '11:00-13:00',
    loc: 'Copland LG.105',
    staff: 'Klaus Draeger',
    group: '6SE02',
    weeks: '21 Sep to 19 Oct, 2 Nov to 7 Dec',
  },
  {
    code: '6SENG006W',
    name: 'Concurrent Programming',
    type: 'Seminar',
    day: 'Monday',
    time: '14:00-16:00',
    loc: 'Copland G.105',
    staff: 'Tendai Mhlanga',
    group: '6SE02',
    weeks: '21 Sep to 19 Oct, 2 Nov to 7 Dec',
  },
  {
    code: '6SENG005W',
    name: 'Formal Methods',
    type: 'Lecture',
    day: 'Thursday',
    time: '09:00-11:00',
    loc: 'Cavendish C1.03',
    staff: 'Klaus Draeger',
    group: '',
    weeks: '24 Sep to 22 Oct, 5 Nov to 10 Dec',
  },
  {
    code: '6SENG006W',
    name: 'Concurrent Programming',
    type: 'Lecture',
    day: 'Thursday',
    time: '11:00-13:00',
    loc: 'Cavendish C1.15-16',
    staff: 'Tendai Mhlanga',
    group: '',
    weeks: '24 Sep to 22 Oct, 5 Nov to 10 Dec',
  },
  {
    code: '6SENG010W',
    name: 'Software Engineering Final Project',
    type: 'Project session',
    day: 'Friday',
    time: '09:00-11:00',
    loc: 'Online (live)',
    staff: 'Rolf Banziger',
    group: '',
    weeks: 'Weekly 25 Sep to 23 Oct; 6 Nov and 4 Dec',
  },
];

/*
 * Details that recur verbatim across templates. Named once so a wording change
 * is one edit rather than fourteen, and so two copies can never drift apart.
 */
const CLOSE_DETAIL =
  '5 min: tick the blocks, three lines in the FYP log (what I did, what I learned, the first next step). Then screens off.';
const GUITAR_DETAIL =
  '5 min warm up + 10 min technique (alternate picking, palm muting, transitions) + 10 min on the song of the week + 5 min free.';
const LC_NEW_DETAIL =
  '5 min on the approach + 25 min attempt + 10 min comparing solutions + 5 min error note. If you get stuck take a hint, close the solution, then solve it again unaided.';
const SYNTHESIS_DETAIL =
  "Bring the week's two modules onto one page: a mind map or a short summary, plus the open questions.";

const CLOSE: Block = {
  start: '22:15',
  end: '22:45',
  cat: 'planning',
  title: 'Close the day and wind down',
  detail: CLOSE_DETAIL,
};
const GUITAR: Block = {
  start: '19:00',
  end: '19:30',
  cat: 'guitar',
  title: 'Guitar',
  detail: GUITAR_DETAIL,
};

export const TEMPLATES: Record<TemplateId, Block[]> = {
  mon: [
    { start: '07:00', end: '07:45', cat: 'free', title: 'Breakfast and morning plan', detail: 'No screen work; write the three priorities for the day.' },
    { start: '07:45', end: '08:45', cat: 'fyp', title: 'FYP: target for the week', detail: 'Write the one demonstrable output for the week and start its first task. A progress note in the last 5 min.' },
    { start: '08:55', end: '09:40', cat: 'aws', title: 'AWS: course', detail: '30 min video + 15 min free recall and 3 to 5 questions.' },
    { start: '09:40', end: '10:10', cat: 'revision', title: 'Spaced revision', detail: 'The FM and CP questions that are due (the 3 / 7 / 30 day queue), without looking at notes.' },
    { start: '10:15', end: '10:50', cat: 'commute', title: 'Commute: Manor House to Warren Street', detail: '20 min tube + 7 min walk + 8 min buffer. Time it door to door in the first week.' },
    { start: '11:00', end: '13:00', cat: 'classes', title: 'Formal Methods seminar', detail: '6SENG005W, Copland LG.105, Klaus Draeger. Flag the questions you cannot solve.', location: 'Copland LG.105' },
    { start: '13:00', end: '14:00', cat: 'free', title: 'Lunch and break' },
    { start: '14:00', end: '16:00', cat: 'classes', title: 'Concurrent Programming seminar', detail: '6SENG006W, Copland G.105, Tendai Mhlanga. Record the code examples and the errors.', location: 'Copland G.105' },
    { start: '16:00', end: '16:30', cat: 'revision', title: 'Same day revision', detail: '15 min FM + 15 min CP: three main ideas from memory and one unsolved question each.' },
    { start: '16:30', end: '17:05', cat: 'commute', title: 'Commute: home' },
    { start: '17:05', end: '18:15', cat: 'free', title: 'Food and rest', detail: 'Do not add work here.' },
    { start: '18:15', end: '19:00', cat: 'leetcode', title: 'LeetCode: revision', detail: 'Rewrite one or two already solved questions without opening the solution.' },
    GUITAR,
    { start: '19:30', end: '22:15', cat: 'free', title: 'Free time' },
    CLOSE,
  ],
  tue: [
    { start: '07:00', end: '08:00', cat: 'free', title: 'Breakfast and morning plan', detail: 'A short walk or a stretch; write the three priorities for the day.' },
    { start: '08:00', end: '10:00', cat: 'fyp', title: 'FYP: deep work', detail: "2 x 50 min + a 10 min break. Phone in another room. One sentence target at the start, for example 'the pod scheduling step in the simulator'." },
    { start: '10:15', end: '11:00', cat: 'leetcode', title: 'LeetCode: new question', detail: LC_NEW_DETAIL },
    { start: '11:15', end: '12:30', cat: 'revision', title: 'Formal Methods: coursework', detail: 'Finish one subtask from the brief; with nothing set, solve a seminar or exam question.' },
    { start: '12:30', end: '13:30', cat: 'free', title: 'Lunch and a walk', detail: 'Get away from the screen.' },
    { start: '13:30', end: '15:00', cat: 'aws', title: 'AWS: topic and lab', detail: "The week's topic plus a small lab in the console. Output: an architecture sketch, which service in which situation, and why the wrong answers are wrong. Delete the resources at the end." },
    { start: '15:15', end: '16:00', cat: 'jobs', title: 'Job application', detail: 'One considered application: read the posting, adapt the CV, send it, log it in the tracker.' },
    { start: '16:15', end: '17:15', cat: 'profiler', title: 'JVM profiler', detail: "One piece of the week's profiler target. Close the session by writing the next step." },
    { start: '17:15', end: '17:35', cat: 'revision', title: 'Next day revision', detail: 'Monday seminars: recall without notes, correct the mistakes.' },
    { start: '17:35', end: '19:00', cat: 'free', title: 'Food, movement, rest' },
    GUITAR,
    { start: '19:30', end: '22:15', cat: 'free', title: 'Free time' },
    CLOSE,
  ],
  wed: [
    { start: '07:00', end: '08:00', cat: 'free', title: 'Breakfast and morning plan', detail: 'A short walk or a stretch; write the three priorities for the day.' },
    { start: '08:00', end: '10:00', cat: 'fyp', title: 'FYP: deep work (code)', detail: 'Simulator and agent code. Commit and log at the end of the session.' },
    { start: '10:15', end: '11:00', cat: 'leetcode', title: 'LeetCode: new question', detail: LC_NEW_DETAIL },
    { start: '11:15', end: '12:30', cat: 'revision', title: 'Concurrent Programming: coursework', detail: 'One subtask, a test or an error analysis; with nothing set, a CP exercise.' },
    { start: '12:30', end: '13:30', cat: 'free', title: 'Lunch and a walk', detail: 'Get away from the screen.' },
    { start: '13:30', end: '15:00', cat: 'aws', title: 'AWS: apply it', detail: 'Build or draw the architecture you learned on Tuesday; explain why those services.' },
    { start: '15:15', end: '16:00', cat: 'jobs', title: 'Job application', detail: 'One application. An interview or an online assessment takes this block instead.' },
    { start: '16:15', end: '17:15', cat: 'profiler', title: 'JVM profiler', detail: "One piece of the week's profiler target. Close the session by writing the next step." },
    { start: '17:15', end: '17:35', cat: 'revision', title: 'Thursday prep', detail: 'Skim the FM and CP headings, write down one question to ask in class.' },
    { start: '17:35', end: '19:00', cat: 'free', title: 'Food, movement, rest' },
    GUITAR,
    { start: '19:30', end: '22:15', cat: 'free', title: 'Free time' },
    CLOSE,
  ],
  thu: [
    { start: '07:00', end: '07:30', cat: 'free', title: 'Breakfast' },
    { start: '07:30', end: '08:05', cat: 'aws', title: 'AWS: short revision', detail: '20 min on old topics + 15 min on a scenario question. No new video.' },
    { start: '08:10', end: '08:45', cat: 'commute', title: 'Commute: Warren Street' },
    { start: '08:45', end: '09:00', cat: 'revision', title: 'Short revision', detail: "The 3 to 5 questions that are due and today's lecture headings." },
    { start: '09:00', end: '11:00', cat: 'classes', title: 'Formal Methods lecture', detail: '6SENG005W, Cavendish C1.03.', location: 'Cavendish C1.03' },
    { start: '11:00', end: '13:00', cat: 'classes', title: 'Concurrent Programming lecture', detail: '6SENG006W, Cavendish C1.15-16.', location: 'Cavendish C1.15-16' },
    { start: '13:00', end: '14:00', cat: 'free', title: 'Lunch and break' },
    { start: '14:00', end: '14:40', cat: 'revision', title: 'Same day revision', detail: '20 min FM + 20 min CP: recall without notes, one example each.' },
    { start: '14:40', end: '15:15', cat: 'commute', title: 'Commute: home' },
    { start: '15:15', end: '16:15', cat: 'revision', title: 'Coursework and lab', detail: 'CP: write the concurrency example from the lecture yourself. FM: a spec or a proof exercise.' },
    { start: '16:30', end: '17:30', cat: 'aws', title: 'AWS: question set', detail: "Scenario questions from the week's topics + the error log." },
    { start: '17:30', end: '17:50', cat: 'fyp', title: 'FYP: session note', detail: 'For Friday: what I did, what I am stuck on, what I will ask.' },
    { start: '17:50', end: '19:00', cat: 'free', title: 'Food and rest' },
    GUITAR,
    { start: '19:30', end: '19:50', cat: 'leetcode', title: 'LeetCode: revision', detail: 'Rebuild the approach and the critical code of an old question.' },
    { start: '19:50', end: '22:15', cat: 'free', title: 'Free time' },
    CLOSE,
  ],
  sat: [
    { start: '08:00', end: '09:00', cat: 'free', title: 'Breakfast', detail: 'Slow start to the weekend.' },
    { start: '09:00', end: '10:30', cat: 'aws', title: 'AWS: lab', detail: "Build the week's scenario. Last 15 min: the architecture decisions and the mistakes." },
    { start: '10:45', end: '11:30', cat: 'leetcode', title: 'LeetCode: timed run', detail: 'One new question; think aloud with test cases, like an interview.' },
    { start: '11:30', end: '12:30', cat: 'free', title: 'Lunch and a walk' },
    { start: '12:30', end: '14:30', cat: 'fyp', title: 'FYP: code and architecture', detail: "Pull the week's output together: a test, an experiment or a piece of the report." },
    { start: '14:45', end: '15:45', cat: 'profiler', title: 'JVM profiler: output for the week', detail: 'Finish the weekly target, test it, add it to the README.' },
    { start: '16:00', end: '17:00', cat: 'guitar', title: 'Guitar: long session', detail: '60 min: play the song end to end, isolate the hard bars. Record 30 to 60 seconds once a week and pick one thing to improve.' },
    { start: '17:00', end: '22:45', cat: 'free', title: 'Free evening', detail: 'Social time and rest.' },
  ],
  sun: [
    { start: '08:00', end: '10:00', cat: 'free', title: 'Free morning' },
    { start: '10:00', end: '10:45', cat: 'leetcode', title: 'LeetCode: weekly revision', detail: 'Solve the hardest question of the week again, explaining the approach out loud.' },
    { start: '10:45', end: '11:15', cat: 'revision', title: 'Revision queue', detail: 'Only the cards that are due and the mistakes.' },
    { start: '11:15', end: '11:45', cat: 'fyp', title: 'FYP log', detail: "The week's output, the problems, Monday's first task. No big development." },
    { start: '11:45', end: '12:45', cat: 'free', title: 'Lunch' },
    { start: '12:45', end: '13:30', cat: 'jobs', title: 'Application follow up', detail: "Replies, deadlines, next week's three target postings." },
    { start: '13:30', end: '14:00', cat: 'planning', title: 'Weekly plan', detail: 'Pick three main outputs: one academic, one FYP, one AWS. Look at the next 21 days on the Deadlines tab.' },
    { start: '14:00', end: '14:30', cat: 'guitar', title: 'Guitar (relaxed)', detail: 'Play the songs you like.' },
    { start: '14:30', end: '22:15', cat: 'free', title: 'Free half day', detail: 'No catch up marathon.' },
    CLOSE,
  ],
  monthSun: [
    { start: '08:00', end: '09:00', cat: 'free', title: 'Breakfast' },
    { start: '09:00', end: '09:30', cat: 'fyp', title: 'FYP log', detail: "The week's output and Monday's first task." },
    { start: '09:30', end: '10:15', cat: 'revision', title: 'Formal Methods: monthly revision', detail: 'Mixed questions from the previous four weeks; record the three weakest topics.' },
    { start: '10:15', end: '11:00', cat: 'revision', title: 'Concurrent Programming: monthly revision', detail: 'Concepts, code and error analysis.' },
    { start: '11:00', end: '11:30', cat: 'planning', title: 'Monthly check', detail: 'Work through the monthly list on the Review and rules tab.' },
    { start: '11:30', end: '12:00', cat: 'leetcode', title: 'LeetCode: revision', detail: 'A question from an earlier month.' },
    { start: '12:00', end: '13:00', cat: 'free', title: 'Lunch' },
    { start: '13:00', end: '13:45', cat: 'jobs', title: 'Application follow up', detail: "Funnel rates and next week's postings." },
    { start: '13:45', end: '14:15', cat: 'guitar', title: 'Guitar and the monthly recording', detail: 'Record the song and compare it with last month.' },
    { start: '14:15', end: '22:15', cat: 'free', title: 'Free' },
    CLOSE,
  ],
  mockSat: [
    { start: '08:00', end: '09:00', cat: 'free', title: 'Breakfast' },
    { start: '09:00', end: '11:10', cat: 'aws', title: 'AWS: full mock (130 min)', detail: '65 questions, unseen, at exam pace. No breaks.' },
    { start: '11:10', end: '11:30', cat: 'free', title: 'Break' },
    { start: '11:30', end: '12:15', cat: 'aws', title: 'Mock analysis', detail: 'A knowledge gap or a misreading? Put every wrong answer in the error log and record the score.' },
    { start: '12:15', end: '13:15', cat: 'free', title: 'Lunch and a walk' },
    { start: '13:15', end: '15:00', cat: 'fyp', title: 'FYP: code and architecture', detail: "Pull the week's output together." },
    { start: '15:15', end: '16:00', cat: 'profiler', title: 'JVM profiler', detail: 'Finish the weekly target.' },
    { start: '16:15', end: '17:15', cat: 'guitar', title: 'Guitar: long session' },
    { start: '17:15', end: '22:45', cat: 'free', title: 'Free evening' },
  ],
  awsExam: [
    { start: '07:00', end: '08:00', cat: 'free', title: 'Breakfast' },
    { start: '08:00', end: '08:45', cat: 'aws', title: 'Final skim', detail: 'Only the error log and the service comparisons. No new topics.' },
    { start: '09:00', end: '13:30', cat: 'aws', title: 'SAA-C03 exam window', detail: 'Adjust to the appointment time: 130 min exam plus check in and travel.' },
    { start: '13:30', end: '19:00', cat: 'free', title: 'Free', detail: 'No other blocks today.' },
    GUITAR,
    { start: '19:30', end: '22:15', cat: 'free', title: 'Free time' },
    CLOSE,
  ],
  rev: [
    { start: '08:00', end: '09:00', cat: 'free', title: 'Breakfast' },
    { start: '09:00', end: '09:45', cat: 'fyp', title: 'FYP: writing', detail: 'The literature section or the experiment notes.' },
    { start: '10:00', end: '11:30', cat: 'revision', title: 'Assessment prep', detail: 'FM and CP on alternate days. An official submission takes this block.' },
    { start: '11:30', end: '12:00', cat: 'revision', title: 'Revision queue', detail: 'Mistakes and whatever is due.' },
    { start: '12:00', end: '13:00', cat: 'free', title: 'Lunch' },
    { start: '13:00', end: '13:30', cat: 'leetcode', title: 'LeetCode: revision', detail: 'One old question; no need for a new one.' },
    { start: '13:30', end: '14:15', cat: 'profiler', title: 'Profiler or applications', detail: 'Alternate day by day.' },
    { start: '14:30', end: '15:30', cat: 'fyp', title: 'FYP: code and experiments', detail: 'Rerun the experiments, update the results table.' },
    { start: '15:45', end: '16:15', cat: 'guitar', title: 'Guitar' },
    { start: '16:15', end: '22:15', cat: 'free', title: 'Holiday and rest' },
    CLOSE,
  ],
  revSat: [
    { start: '09:00', end: '10:00', cat: 'free', title: 'Breakfast' },
    { start: '10:00', end: '11:00', cat: 'profiler', title: 'JVM profiler' },
    { start: '11:00', end: '11:30', cat: 'leetcode', title: 'LeetCode: revision' },
    { start: '11:30', end: '16:00', cat: 'free', title: 'Free' },
    { start: '16:00', end: '17:00', cat: 'guitar', title: 'Guitar: long session' },
    { start: '17:00', end: '22:45', cat: 'free', title: 'Free evening' },
  ],
  light: [
    { start: '08:30', end: '09:00', cat: 'free', title: 'Breakfast' },
    { start: '09:00', end: '09:45', cat: 'fyp', title: 'FYP: short', detail: 'A log entry or a small fix.' },
    { start: '10:00', end: '11:00', cat: 'revision', title: 'FM and CP revision', detail: 'Alternating, light.' },
    { start: '11:15', end: '11:35', cat: 'leetcode', title: 'LeetCode: revision' },
    { start: '11:35', end: '11:55', cat: 'profiler', title: 'Profiler: maintenance' },
    { start: '12:00', end: '15:00', cat: 'free', title: 'Holiday' },
    { start: '15:00', end: '15:30', cat: 'guitar', title: 'Guitar' },
    { start: '15:30', end: '22:45', cat: 'free', title: 'Holiday' },
  ],
  lightDay: [
    { start: '09:00', end: '09:10', cat: 'fyp', title: 'FYP: short note' },
    { start: '09:10', end: '09:20', cat: 'profiler', title: 'Profiler: write the next task' },
    { start: '09:20', end: '09:30', cat: 'leetcode', title: 'LeetCode: recall one approach' },
    { start: '09:30', end: '09:40', cat: 'revision', title: 'A few revision cards' },
    { start: '09:40', end: '10:10', cat: 'guitar', title: 'Guitar (for fun)' },
    { start: '10:10', end: '22:45', cat: 'free', title: 'Free day', detail: 'Move this light day to another day if you want.' },
  ],
  exam: [
    { start: '07:30', end: '09:00', cat: 'free', title: 'Breakfast', detail: 'If this is a real exam day the plan is void: the exam time and the travel come first.' },
    { start: '09:00', end: '10:30', cat: 'revision', title: 'Nearest assessment: focus', detail: 'A timed question or the missing part of a coursework; without notes.' },
    { start: '10:45', end: '12:00', cat: 'revision', title: 'Error analysis and closing gaps', detail: "Check the morning's work, then move to the second module." },
    { start: '12:00', end: '13:00', cat: 'free', title: 'Lunch and a walk' },
    { start: '13:00', end: '14:00', cat: 'revision', title: 'Second module or submission check', detail: "A short question set; tomorrow's assessment takes priority." },
    { start: '14:00', end: '14:20', cat: 'revision', title: 'Revision queue', detail: 'The error list, without opening a new topic.' },
    { start: '14:30', end: '14:50', cat: 'fyp', title: 'FYP: maintenance', detail: '20 min of log or a small task.' },
    { start: '14:50', end: '15:05', cat: 'profiler', title: 'Profiler: maintenance' },
    { start: '15:05', end: '15:20', cat: 'leetcode', title: 'LeetCode: old easy question', detail: 'Optional on an exam day.' },
    { start: '15:20', end: '15:50', cat: 'guitar', title: 'Guitar (to unwind)' },
    { start: '15:50', end: '22:15', cat: 'free', title: 'Rest', detail: 'An urgent application takes 20 min at most. Do not trade away sleep.' },
    CLOSE,
  ],
  examSun: [
    { start: '07:30', end: '09:00', cat: 'free', title: 'Breakfast' },
    { start: '09:00', end: '10:30', cat: 'revision', title: 'Nearest assessment: focus' },
    { start: '10:45', end: '12:00', cat: 'revision', title: 'Error analysis' },
    { start: '12:00', end: '12:20', cat: 'fyp', title: 'FYP: short note' },
    { start: '12:20', end: '12:35', cat: 'profiler', title: 'Profiler: maintenance' },
    { start: '12:35', end: '12:50', cat: 'leetcode', title: 'LeetCode: revision' },
    { start: '12:50', end: '13:20', cat: 'guitar', title: 'Guitar' },
    { start: '13:20', end: '22:15', cat: 'free', title: 'Free', detail: 'With an exam close, short revision only.' },
    CLOSE,
  ],
  friMeeting: [
    { start: '07:00', end: '08:00', cat: 'free', title: 'Breakfast', detail: 'Working from home today.' },
    { start: '08:00', end: '08:30', cat: 'revision', title: 'Next day revision', detail: 'Thursday lectures: 15 min each of FM and CP, without notes.' },
    { start: '08:30', end: '08:55', cat: 'fyp', title: 'Session prep', detail: "Agenda, the week's output, the questions." },
    { start: '09:00', end: '11:00', cat: 'fyp', title: '6SENG010W session (online)', detail: 'Rolf Banziger. Write the actions down as they come; separate out the questions for the supervisor. The current CMISGo or Blackboard notice takes priority.', location: 'Online (live)' },
    { start: '11:15', end: '12:00', cat: 'revision', title: 'Weekly FM and CP synthesis', detail: SYNTHESIS_DETAIL },
    { start: '12:00', end: '13:00', cat: 'free', title: 'Lunch and a walk' },
    { start: '13:00', end: '14:00', cat: 'fyp', title: 'FYP: apply the feedback', detail: 'Start the first action from the session straight away.' },
    { start: '14:15', end: '15:00', cat: 'leetcode', title: 'LeetCode: new question', detail: 'One new question; update the error log.' },
    { start: '15:15', end: '16:00', cat: 'aws', title: 'AWS: wrong answer analysis', detail: '10 to 15 questions. For each wrong one, write why the other options were eliminated.' },
    { start: '16:00', end: '16:45', cat: 'jobs', title: 'Applications and networking', detail: 'One application or two LinkedIn messages.' },
    { start: '16:45', end: '19:00', cat: 'free', title: 'Rest and food' },
    GUITAR,
    { start: '19:30', end: '22:45', cat: 'free', title: 'Friday evening free' },
  ],
  friNoMeeting: [
    { start: '07:00', end: '08:00', cat: 'free', title: 'Breakfast', detail: 'Working from home today.' },
    { start: '08:00', end: '08:30', cat: 'revision', title: 'Next day revision', detail: 'Thursday lectures: 15 min each of FM and CP, without notes.' },
    { start: '08:30', end: '08:55', cat: 'fyp', title: 'FYP: pick the target', detail: 'Write the single target for these two hours.' },
    { start: '09:00', end: '11:00', cat: 'fyp', title: 'FYP: deep work', detail: 'No session: these two hours are independent project work.' },
    { start: '11:15', end: '12:00', cat: 'revision', title: 'Weekly FM and CP synthesis', detail: SYNTHESIS_DETAIL },
    { start: '12:00', end: '13:00', cat: 'free', title: 'Lunch and a walk' },
    { start: '13:00', end: '14:00', cat: 'revision', title: 'Nearest assessment', detail: 'Work on whichever of FM, CP or the FYP submission is closest.' },
    { start: '14:15', end: '15:00', cat: 'leetcode', title: 'LeetCode: new question', detail: 'One new question; update the error log.' },
    { start: '15:15', end: '16:00', cat: 'aws', title: 'AWS: wrong answer analysis', detail: '10 to 15 questions. For each wrong one, write why the other options were eliminated.' },
    { start: '16:00', end: '16:45', cat: 'jobs', title: 'Applications and networking', detail: 'One application or two LinkedIn messages.' },
    { start: '16:45', end: '19:00', cat: 'free', title: 'Rest and food' },
    GUITAR,
    { start: '19:30', end: '22:45', cat: 'free', title: 'Friday evening free' },
  ],
};

export const WEEKS: Week[] = [
  {
    start: '2026-09-21',
    label: 'Teaching week 1',
    mode: 'teach',
    fypSession: true,
    focus: {
      fyp: 'Literature: MARL (MAPPO, QMIX, MADDPG) and RL based K8s autoscaling. Set up the reading table.',
      aws: 'Split the course into sections. IAM, Regions and AZs, shared responsibility.',
      leetcode: 'Arrays and Hashing',
      jobs: 'CV, GitHub, tracker (company, role, link, deadline, sent, CV version, next step).',
      classes: 'Assessment types, weights and submission times, then put them on the Deadlines tab.',
      profiler: 'Scope and repo. The simplest Java agent, loaded with premain.',
      guitar: 'For Whom the Bell Tolls: the intro, slowly with a metronome.',
    },
    note: 'Start from 25 September; no catching up on the days before it. Sunday 27 Sep: start of term check, and book the AWS exam for 25 November.',
  },
  {
    start: '2026-09-28',
    label: 'Teaching week 2',
    mode: 'teach',
    fypSession: true,
    focus: {
      fyp: '2 to 3 research questions; compare the existing K8s simulators.',
      aws: 'EC2, EBS, EFS, instance store.',
      leetcode: 'Arrays and Hashing + Two Pointers',
      jobs: '3 applications; 1 STAR story.',
      profiler: 'Attach API: connect to a running JVM with agentmain.',
      guitar: 'Intro and main riff, palm muting.',
    },
  },
  {
    start: '2026-10-05',
    label: 'Teaching week 3',
    mode: 'teach',
    fypSession: true,
    focus: {
      fyp: 'Simulator decision (Gymnasium or PettingZoo). HPA baseline design.',
      aws: 'ELB, Auto Scaling, RDS and Aurora, ElastiCache.',
      leetcode: 'Sliding Window + Stack',
      jobs: '3 applications; make the project outcome measurable on the CV.',
      profiler: 'Sampling loop: collect thread stack traces at a fixed interval.',
    },
  },
  {
    start: '2026-10-12',
    label: 'Teaching week 4',
    mode: 'teach',
    fypSession: true,
    focus: {
      fyp: 'Draft the project proposal. Simulator skeleton: node, pod and workload model.',
      aws: 'Route 53, S3 (basics, advanced, security).',
      leetcode: 'Binary Search',
      jobs: '3 applications; rehearse 2 behavioural answers.',
      profiler: 'Merge the stacks (collapsed stack format), list the hottest methods.',
      guitar: 'Verse transitions.',
    },
  },
  {
    start: '2026-10-19',
    label: 'Teaching week 5',
    mode: 'teach',
    fypSession: true,
    monthlyReview: true,
    focus: {
      fyp: 'Take the proposal to the 23 Oct session (the last weekly one) and work the feedback in.',
      aws: 'CloudFront, Global Accelerator, Snow, FSx, Storage Gateway.',
      leetcode: 'Linked List',
      jobs: '3 applications + online assessment practice.',
      profiler: 'Flame graph output (HTML or SVG). First demo and README.',
      guitar: 'The whole song slowly; first recording.',
    },
    note: 'Sunday 25 Oct: monthly check.',
  },
  {
    start: '2026-10-26',
    label: 'Week with no classes listed',
    mode: 'gap',
    fypSession: false,
    overrides: { 5: 'mockSat' },
    focus: {
      fyp: 'Simulator MVP and a single agent PPO baseline, running.',
      aws: 'SQS, SNS, Kinesis, ECS, EKS, Fargate, Lambda, API Gateway, DynamoDB. Sat 31 Oct: the first full mock.',
      leetcode: 'Trees',
      jobs: '3 to 4 applications; clean up the tracker.',
      classes: 'Close the gaps; get ahead on coursework.',
      profiler: 'No new scope: fix bugs and finish what is already there.',
    },
    note: 'The timetable shows no classes this week but it is not confirmed as a holiday; check the university calendar. If nothing is on, Monday and Thursday are deep work days.',
  },
  {
    start: '2026-11-02',
    label: 'Teaching week 6',
    mode: 'teach',
    fypSession: true,
    overrides: { 5: 'mockSat' },
    focus: {
      fyp: 'Multi-agent setup (PettingZoo), reward design. A demo for the 6 Nov session.',
      aws: 'KMS, Secrets Manager, WAF, CloudWatch, CloudTrail, Config, VPC. Sat 7 Nov: the second mock.',
      leetcode: 'Trees + Tries',
      jobs: '3 applications; 1 mock interview.',
      profiler: 'CPU and wall clock modes; running threads only.',
    },
  },
  {
    start: '2026-11-09',
    label: 'Teaching week 7',
    mode: 'teach',
    fypSession: false,
    overrides: { 5: 'mockSat' },
    focus: {
      fyp: 'First experiments: MARL against HPA, small scale.',
      aws: 'DR and migration, cost, analytics and ML services; the course tour ends. Sat 14 Nov: the third mock, the readiness check.',
      leetcode: 'Heap and Priority Queue',
      jobs: '3 applications.',
      profiler: 'Overhead measurement: benchmark with the profiler on and off.',
      guitar: 'Faster tempo.',
    },
  },
  {
    start: '2026-11-16',
    label: 'Teaching week 8',
    mode: 'teach',
    fypSession: false,
    overrides: { 5: 'mockSat' },
    focus: {
      fyp: 'Experiment logging and a results table template.',
      aws: 'The error log and the weak areas. Sat 21 Nov: the fourth mock, the last one.',
      leetcode: 'Backtracking (3 new)',
      jobs: '3 applications.',
      classes: 'Check the provisional January exam timetable.',
      profiler: 'Small job: CLI arguments.',
    },
    note: 'If the 14 and 21 November mocks came out around 80 to 85 percent and finished inside the time, sit it on 25 November; otherwise 2 December.',
  },
  {
    start: '2026-11-23',
    label: 'Teaching week 9',
    mode: 'teach',
    fypSession: false,
    monthlyReview: true,
    awsDoneFromDay: 3,
    overrides: { 2: 'awsExam' },
    focus: {
      fyp: 'Evaluation plan: SLO violations, resource use, cost.',
      aws: 'Light revision Monday and Tuesday. Wednesday 25 Nov: EXAM (target).',
      leetcode: 'Graphs (light)',
      jobs: '2 applications.',
      profiler: 'A light week.',
    },
    note: 'AWS exam week. Sunday 29 Nov: monthly check.',
  },
  {
    start: '2026-11-30',
    label: 'Teaching week 10',
    mode: 'teach',
    fypSession: true,
    awsDone: true,
    focus: {
      fyp: '4 Dec session: progress report and early results. kind or minikube for sim to real.',
      aws: 'The 2 Dec fallback sitting if it is needed. Then add the certificate to the CV and LinkedIn.',
      leetcode: 'Graphs',
      jobs: '3 applications.',
      classes: 'Submission crunch: apply the countdown rule.',
      profiler: 'Safepoint bias: a limitations section in the README.',
    },
  },
  {
    start: '2026-12-07',
    label: 'Teaching week 11 (last)',
    mode: 'teach',
    fypSession: false,
    awsDone: true,
    focus: {
      fyp: 'Interim report and literature section draft; the first steps of semester 2.',
      leetcode: '1-D Dynamic Programming',
      jobs: 'Follow up emails.',
      classes: '11 Dec is the last teaching day. Remaining submissions; check the confirmed exam timetable.',
      profiler: 'v0.1 release and a two minute walkthrough.',
      guitar: 'Full tempo with the solo; recording.',
    },
  },
  {
    start: '2026-12-14',
    label: 'Holiday: university revision',
    mode: 'revision',
    fypSession: false,
    awsDone: true,
    focus: {
      fyp: 'Literature section; rerun the experiments.',
      leetcode: 'Mixed revision',
      classes: 'First full FM and CP revision pass: notes, error lists, sample assessments.',
      jobs: '1 to 2 applications.',
    },
  },
  {
    start: '2026-12-21',
    label: 'Holiday: light week',
    mode: 'light',
    fypSession: false,
    monthlyReview: true,
    awsDone: true,
    overrides: { 4: 'lightDay' },
    focus: {
      leetcode: '20 min of revision a day',
      fyp: '45 min a day at most.',
      guitar: 'Free; pick a new song.',
    },
    note: '25 December is a light day. Sunday 27 Dec: monthly check.',
  },
  {
    start: '2026-12-28',
    label: 'Exam preparation',
    mode: 'revision',
    fypSession: false,
    awsDone: true,
    overrides: { 4: 'lightDay' },
    focus: {
      classes: 'Timed mocks and results analysis.',
      leetcode: '20 to 30 min of revision a day',
    },
    note: '1 January is a light day.',
  },
  {
    start: '2027-01-04',
    label: 'Exam period',
    mode: 'exam',
    fypSession: false,
    awsDone: true,
    focus: {
      classes: 'Real exam and submission times come before every block. On the other days, the nearest assessment.',
      leetcode: '15 min on an old easy question',
      fyp: '20 min of maintenance a day.',
    },
    note: 'The general exam period is 4 to 15 January. Your own CMISGo calendar is what counts.',
  },
  {
    start: '2027-01-11',
    label: 'Exam period (last)',
    mode: 'exam',
    fypSession: false,
    monthlyReview: true,
    awsDone: true,
    focus: {
      classes: '15 January is the end of term.',
      fyp: 'Once the last exam is done, order the semester 2 tasks.',
      profiler: 'Pick one small step that applies the certificate to the profiler.',
    },
    note: 'Sunday 17 Jan: end of term check and the semester 2 plan.',
  },
];

/** Shown instead of the day's blocks when "bad day mode" is on. */
export const BAD_DAY: { cat: CategoryId; title: string; detail?: string }[] = [
  { cat: 'revision', title: 'One task from the nearest assessment', detail: 'Coursework, exam or FYP submission, whichever is closest.' },
  { cat: 'fyp', title: 'FYP: 20 min', detail: 'One small task or a log entry.' },
  { cat: 'profiler', title: 'Profiler: 15 min', detail: 'A test, a bug, or writing the next step.' },
  { cat: 'leetcode', title: 'LeetCode revision: 15 min', detail: 'One old question.' },
  { cat: 'guitar', title: 'Guitar: 15 to 30 min' },
  { cat: 'planning', title: 'In bed by 22:45', detail: 'Do not carry what you missed into tomorrow.' },
];

export const DEFAULT_DEADLINES: Deadline[] = [
  { title: 'Formal Methods coursework (add the date and time)', date: null, cat: 'revision' },
  { title: 'Concurrent Programming coursework (add the date and time)', date: null, cat: 'revision' },
  { title: 'FYP official submissions (add the dates)', date: null, cat: 'fyp' },
  { title: 'January exams (add them from CMISGo)', date: null, cat: 'classes' },
  { title: 'Start of term check and book the AWS exam', date: '2026-09-27', cat: 'planning' },
  { title: 'Last weekly FYP session', date: '2026-10-23', cat: 'fyp' },
  { title: 'Monthly check', date: '2026-10-25', cat: 'planning' },
  { title: 'AWS first full mock', date: '2026-10-31', cat: 'aws' },
  { title: 'FYP session', date: '2026-11-06', cat: 'fyp' },
  { title: 'AWS second full mock', date: '2026-11-07', cat: 'aws' },
  { title: 'AWS third mock: the readiness check', date: '2026-11-14', cat: 'aws' },
  { title: 'Check the provisional January exam timetable', date: '2026-11-16', cat: 'classes' },
  { title: 'AWS fourth full mock (the last)', date: '2026-11-21', cat: 'aws' },
  { title: 'AWS SAA-C03 exam (target)', date: '2026-11-25', cat: 'aws' },
  { title: 'Monthly check', date: '2026-11-29', cat: 'planning' },
  { title: 'AWS fallback exam date (if needed)', date: '2026-12-02', cat: 'aws' },
  { title: 'FYP session', date: '2026-12-04', cat: 'fyp' },
  { title: 'Last teaching day', date: '2026-12-11', cat: 'classes' },
  { title: 'Monthly check', date: '2026-12-27', cat: 'planning' },
  { title: 'Exam period starts', date: '2027-01-04', cat: 'classes' },
  { title: 'Exam period ends', date: '2027-01-15', cat: 'classes' },
  { title: 'End of term check and the semester 2 plan', date: '2027-01-17', cat: 'planning' },
];

export const REVIEWS = {
  daily: {
    title: 'Daily',
    when: 'Right after class, the next day, and at the evening close',
    items: [
      'Same day: 15 min each after the Monday seminars, 20 min each after the Thursday lectures. Three main ideas from memory, one example, one question.',
      "Next day: Monday's material at 17:15 on Tuesday, Thursday's at 08:00 on Friday.",
      'The 3 / 7 / 30 day queue: Monday morning, Thursday 08:45 and the Sunday blocks. Order: mistakes, then the upcoming assessment, then easy old topics.',
      'Close (22:15): tick the blocks, three lines in the FYP log: what I did, what I learned, the first next step.',
      'Put a LeetCode question you got stuck on back in the queue at 1, 7 and 30 days.',
    ],
  },
  weekly: {
    title: 'Weekly',
    when: 'Friday 11:15 synthesis, Sunday 13:30 plan',
    items: [
      "Friday synthesis: bring the week's FM and CP topics onto one page (a mind map or a short summary, plus the open questions).",
      'Sunday plan: pick only three main outputs, one academic, one FYP, one AWS.',
      'Look at the blocks you missed: was the plan too full, or was it a bad day?',
      'Look at the next 21 days on the Deadlines tab and apply the countdown rule.',
      'Write the three most frequent mistakes from the AWS error log.',
      'Application tracking: sent, replied, next step.',
    ],
  },
  monthly: {
    title: 'Monthly',
    when: '25 Oct, 29 Nov, 27 Dec, 17 Jan (Sunday morning)',
    items: [
      'FM and CP: 45 min each, mixed questions from the previous four weeks; note the three weakest topics.',
      'AWS: the mock score trend and the weak domains (secure 30 percent, resilient 26 percent, performance 24 percent, cost 20 percent).',
      'FYP: where are the milestones against the plan? Shift the roadmap if you have to.',
      'Application funnel: application, test and interview rates; which CV version gets replies?',
      'Profiler and guitar: the demo of the month and a 30 to 60 second recording, compared with the last one.',
      'Plan: delete or shrink the blocks that keep getting missed.',
    ],
  },
} as const;

export const RULES = {
  courseworkCountdown: [
    { daysBefore: 21, task: 'Read the brief and the rubric, break the work into small tasks.' },
    { daysBefore: 14, task: 'A working first version, or a full solution skeleton.' },
    { daysBefore: 7, task: 'Main content done; the missing tests, proofs, analysis and report are closing. The profiler and the Saturday AWS lab move onto this.' },
    { daysBefore: 3, task: 'Final pass against the rubric: sources, files, does it run, format.' },
    { daysBefore: 2, task: 'Personal early submission; check the right file went up and the receipt landed.' },
  ],
  whenPlanSlips: [
    'Do not carry missed blocks into the next day.',
    "The next day's first priority is the nearest real assessment, then the FYP and AWS.",
    'If the plan misses two weeks running, cut the profiler scope and the number of new questions first; sleep and meals stay.',
    '14 days before an exam: coursework blocks become timed questions; the profiler drops to 15 min a day, new LeetCode to two a week, applications to one or two.',
    'Exam day: the exam, the check in and the travel come before everything; the other habits drop to 10 or 15 min, or get skipped.',
  ],
  awsReadiness: [
    'Around 80 to 85 percent on unseen questions in the 14 and 21 November mocks.',
    'Finishing comfortably inside 130 minutes.',
    'Being able to explain why the wrong options are wrong.',
    'If that does not hold, 2 December instead of 25 November; to close the gap the profiler and new LeetCode shrink first, sleep does not.',
    'The official pass mark is a scaled 720/1000; this threshold is personal.',
  ],
} as const;

/**
 * Per-category hue.
 *
 * The site is single-accent by rule, and this is the scoped exception: the
 * colour is the only thing telling two adjacent blocks apart at 12px in a
 * seven-column grid, so it carries meaning rather than variety. Same
 * justification as the /tokyo spend categories. Break and commute share one
 * grey on purpose: neither is competing for attention.
 */
export const CATEGORY_COLOUR: Record<CategoryId, string> = {
  classes: '#7d9cc8',
  revision: '#78a6cc',
  fyp: '#3fb4a3',
  aws: '#e8a93a',
  leetcode: '#a78bdb',
  jobs: '#5dbb85',
  profiler: '#e27da3',
  guitar: '#d9586e',
  planning: '#9aa2b0',
  free: '#4a5361',
  commute: '#4a5361',
};

// ---------------------------------------------------------------- helpers

export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

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
  cat: 'revision' as CategoryId,
  title: 'Free study block',
  detail:
    'AWS is done: upcoming coursework first, otherwise the FYP or the profiler. If you moved the exam to 2 December, this block stays AWS until then.',
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
