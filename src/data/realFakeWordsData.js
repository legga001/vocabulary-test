// src/data/realFakeWordsData.js
// Separated data for easy maintenance and expansion

export const REAL_WORDS = {
  B1: [
    'achieve', 'adventure', 'ancient', 'beneath', 'brilliant', 'capture', 'courage', 'declare',
    'educate', 'fantastic', 'genuine', 'humble', 'imagine', 'journey', 'kindness', 'luxury',
    'monster', 'natural', 'obvious', 'perfect', 'quality', 'respect', 'serious', 'trouble',
    'unique', 'victory', 'wonder', 'examine', 'picture', 'medicine', 'science', 'history',
    'culture', 'society', 'freedom', 'justice', 'beauty', 'wisdom', 'knowledge', 'success',
    'character', 'decision', 'environment', 'generation', 'information', 'opportunity', 'research',
    'strength', 'temperature', 'mountain', 'ocean', 'forest', 'desert', 'island', 'valley',
    'modern', 'popular', 'special', 'private', 'public', 'simple', 'complex', 'similar',
    'financial', 'political', 'physical', 'mental', 'social', 'personal', 'professional', 'international'
  ],

  B2: [
    'accomplish', 'appreciate', 'certificate', 'circumstances', 'colleague', 'concentrate', 'consequence',
    'definitely', 'eliminate', 'equipment', 'essential', 'experience', 'familiar', 'government',
    'identity', 'immediately', 'independence', 'influence', 'intelligence', 'management', 'necessary',
    'particular', 'personality', 'possibility', 'preparation', 'relationship', 'responsibility',
    'situation', 'technology', 'tradition', 'university', 'appearance', 'arrangement', 'atmosphere',
    'authority', 'beginning', 'celebration', 'comfortable', 'competition', 'condition', 'connection',
    'consideration', 'construction', 'development', 'difficulty', 'discussion', 'economic', 'education',
    'emergency', 'entertainment', 'establishment', 'examination', 'adjustment', 'navigation', 'admission',
    'cooperation', 'publication', 'resolution', 'transmission', 'comprehension', 'exaggeration',
    'accommodation', 'distribution', 'motivation', 'innovation', 'translation', 'declaration'
  ],

  C1: [
    'abundance', 'bureaucracy', 'catastrophe', 'diminish', 'elaborate', 'facilitate', 'gregarious',
    'hypothesis', 'inevitable', 'juxtapose', 'labyrinth', 'magnificent', 'notorious', 'obsolete',
    'phenomenal', 'quintessential', 'renaissance', 'sophisticated', 'tremendous', 'ubiquitous',
    'vicarious', 'whimsical', 'xenophobia', 'zealous', 'ambiguous', 'benevolent', 'conscientious',
    'diligent', 'eloquent', 'fastidious', 'grandiose', 'haphazard', 'immaculate', 'judicious',
    'meticulous', 'nonchalant', 'ostentatious', 'pragmatic', 'resilient', 'serendipity', 'anonymous',
    'articulate', 'comprehensive', 'contemporary', 'demonstrate', 'distinguish', 'entrepreneur',
    'fundamental', 'influential', 'prestigious', 'spontaneous', 'substantial', 'versatile',
    'transcendent', 'legislation', 'anticipation', 'proclamation', 'reconciliation', 'conglomerate',
    'unprecedented', 'revolutionary', 'indispensable', 'charismatic', 'peripheral', 'theoretical'
  ]
};

// Invented roots screened against English word lists and simple spelling edits.
export const FAKE_WORDS = {
  B1: [
    'dravnuck', 'flenship', 'shenvod', 'blashnet', 'thrimvot', 'brenwug',
    'ploovash', 'glessup', 'smavlek', 'frimnock', 'drenshul', 'vashnup',
    'sprolven', 'thravlet', 'flurmish', 'glarvett', 'branshud', 'clomvick',
    'shenvess', 'drallim', 'fremnuck', 'flovmish', 'narshup', 'prenvosh'
  ],

  B2: [
    'chavrelkin', 'grindovash', 'shambrivell', 'frenvaduck', 'glessavorn', 'dronivash',
    'cremavold', 'threnvashul', 'henvadrock', 'glindavess', 'froshnavek', 'brenkavell',
    'shavermock', 'drelmunash', 'skenvadorn', 'grivannock', 'quendavash', 'clensavitt',
    'throvanek', 'brandovick', 'fremalush', 'splunavock', 'drenshallup', 'blensavert',
    'glovernash', 'pralvenush', 'trivashnel', 'frondavuss'
  ],

  C1: [
    'threnavostrel', 'shavendrollic', 'brenvadullick', 'drallavernock', 'clomnavershick', 'skenvadremmish',
    'glessavornel', 'drovnamellic', 'flenshavorren', 'shenvodrallan', 'prenvashavick', 'fremnalovish',
    'thrammelavorn', 'cruvvenastrel', 'glindavonish', 'clensavermuck', 'grivannovesh', 'quendavalluck',
    'shambrivellic', 'chavrelanock', 'clomvadellick', 'brandovenshal', 'brenshamaluck', 'dronivastrel',
    'glarvenadock', 'sprelvanavish', 'shavermollick', 'threnvadavick', 'plimnavostrel'
  ]
};

const definitions = {
  achieve: "To succeed in reaching a goal.",
  adventure: "An exciting or unusual experience, often involving some risk.",
  ancient: "Very old or belonging to a time long ago.",
  beneath: "Directly under something or at a lower level.",
  brilliant: "Extremely clever, bright, or impressive.",
  capture: "To catch and hold someone or something.",
  courage: "The ability to face danger or difficulty even when you are afraid.",
  declare: "To announce something clearly or officially.",
  educate: "To teach someone or help them develop knowledge.",
  fantastic: "Extremely good or enjoyable.",
  genuine: "Real, sincere, or honestly felt.",
  humble: "Aware of your limits and not overly proud.",
  imagine: "To form a picture or idea in your mind.",
  journey: "The act of travelling from one place to another.",
  kindness: "Helpful or caring behaviour towards others.",
  luxury: "Something pleasant or expensive that is not essential.",
  monster: "A frightening creature, often from a story.",
  natural: "Existing in nature or happening without being forced.",
  obvious: "Easy to see, notice, or understand.",
  perfect: "As good as possible, or without faults.",
  quality: "How good or well made something is.",
  respect: "To value someone or treat them with care.",
  serious: "Important, worrying, or meant sincerely.",
  trouble: "A problem or a difficult situation.",
  unique: "The only one of its kind.",
  victory: "Success in a game, contest, or struggle.",
  wonder: "To think about something with curiosity.",
  examine: "To look at or study something carefully.",
  picture: "An image, such as a drawing, painting, or photograph.",
  medicine: "Something that helps treat or prevent illness.",
  science: "The study of the world through observation and experiments.",
  history: "The study or record of things that happened in the past.",
  culture: "The ideas, customs, and ways of life of a group.",
  society: "People living together as an organised community.",
  freedom: "The ability to act or choose without unfair limits.",
  justice: "Fair treatment, especially under the law.",
  beauty: "A quality that gives pleasure when seen, heard, or experienced.",
  wisdom: "The ability to make sound decisions based on knowledge and experience.",
  knowledge: "Facts or understanding gained by learning or experience.",
  success: "The achievement of something you wanted to do.",
  character: "The qualities that make a person who they are, or a person in a story.",
  decision: "A choice made after considering what to do.",
  environment: "The surroundings or conditions in which someone or something lives.",
  generation: "People born and living at roughly the same time.",
  information: "Facts or details about something.",
  opportunity: "A chance to do something.",
  research: "Careful study carried out to learn more about a subject.",
  strength: "The ability to lift, resist, or cope with something difficult.",
  temperature: "A measure of how hot or cold something is.",
  mountain: "A very high area of land with steep sides.",
  ocean: "One of the largest areas of salt water on Earth.",
  forest: "A large area covered mainly with trees.",
  desert: "A very dry area that receives little rain.",
  island: "An area of land completely surrounded by water.",
  valley: "Low land between hills or mountains.",
  modern: "Belonging to or typical of the present or recent times.",
  popular: "Liked or enjoyed by many people.",
  special: "Different from others in a way that matters.",
  private: "For a particular person or group and not open to everyone.",
  public: "Open to or intended for people in general.",
  simple: "Easy to understand or do.",
  complex: "Made of several connected parts and often hard to understand.",
  similar: "Alike in some ways.",
  financial: "Related to money and how it is managed.",
  political: "Related to government, power, or public decisions.",
  physical: "Related to the body or to real objects and forces.",
  mental: "Related to thinking, feelings, or the mind.",
  social: "Related to people spending time together or living in a community.",
  personal: "Related to you as an individual or to your private life.",
  professional: "Related to a job that requires training or skill.",
  international: "Involving two or more countries.",
  accomplish: "To complete something successfully.",
  appreciate: "To recognise the value of something or be thankful for it.",
  certificate: "An official document that confirms a fact or achievement.",
  circumstances: "The facts or conditions that affect a situation.",
  colleague: "Someone you work with.",
  concentrate: "To give most of your attention to one thing.",
  consequence: "A result or effect of something that happened.",
  definitely: "Without doubt, or for certain.",
  eliminate: "To remove something or put an end to it.",
  equipment: "The tools or objects needed for an activity.",
  essential: "Completely necessary or very important.",
  experience: "Knowledge gained by doing something, or an event that happens to you.",
  familiar: "Easy to recognise because you have seen or heard it before.",
  government: "The group or system that runs a country or region.",
  identity: "Who someone is, or what makes them distinct.",
  immediately: "Straight away, with no wait.",
  independence: "The ability to act or make decisions without being controlled by others.",
  influence: "To affect how someone thinks, acts, or develops.",
  intelligence: "The ability to learn, understand, and solve problems.",
  management: "The work of organising people, money, or activities.",
  necessary: "Needed for a particular purpose.",
  particular: "Used to single out one person or thing.",
  personality: "A person’s usual way of thinking, feeling, and behaving.",
  possibility: "Something that might happen or could be done.",
  preparation: "The work you do to get ready for something.",
  relationship: "The way two people or things are connected.",
  responsibility: "A duty to take care of something or make sure it gets done.",
  situation: "The conditions or facts at a particular time.",
  technology: "Tools, systems, or methods developed using scientific knowledge.",
  tradition: "A custom or belief passed down over time.",
  university: "An institution where people study for degrees or do research.",
  appearance: "The way something or someone looks.",
  arrangement: "A plan made in advance, or the way things are organised.",
  atmosphere: "The air around a planet, or the feeling of a place.",
  authority: "The power or right to make decisions or give orders.",
  beginning: "The first part or starting point of something.",
  celebration: "An event or activity that marks a happy or important occasion.",
  comfortable: "Making you feel at ease, with little pain or worry.",
  competition: "A contest, or the effort to do better than others.",
  condition: "The state something is in, or a requirement that must be met.",
  connection: "A link or relationship between things or people.",
  consideration: "Careful thought about something before deciding.",
  construction: "The work of building something.",
  development: "The process of growing, changing, or making something new.",
  difficulty: "A problem, or the amount of effort something takes.",
  discussion: "A conversation or exchange of ideas about a subject.",
  economic: "Related to money, trade, and how resources are used.",
  education: "The process of teaching and learning.",
  emergency: "A dangerous or urgent situation that needs immediate action.",
  entertainment: "Something people watch, hear, or do for enjoyment.",
  establishment: "The act of setting something up, or a business or organisation.",
  examination: "A formal test or a careful inspection.",
  adjustment: "A small change made to improve how something fits or works.",
  navigation: "The process of finding and following a route.",
  admission: "Permission to enter, or a statement that accepts something is true.",
  cooperation: "Working with others towards a shared result.",
  publication: "The act of releasing something to the public, or a work that is released.",
  resolution: "A firm decision, or the solving of a problem.",
  transmission: "The process of passing something such as a signal or illness from one place to another.",
  comprehension: "Understanding what something means.",
  exaggeration: "A description that makes something seem larger or more extreme than it is.",
  accommodation: "A place to stay or live.",
  distribution: "The process of sharing or delivering things to different people or places.",
  motivation: "The reason or desire that makes someone act.",
  innovation: "A new idea, method, or product.",
  translation: "Writing or saying something in another language.",
  declaration: "A formal statement or announcement.",
  abundance: "A large amount of something, often more than enough.",
  bureaucracy: "A system run through many officials, procedures, and rules.",
  catastrophe: "An event that causes great harm or damage.",
  diminish: "To become smaller or less important, or make something do so.",
  elaborate: "Very detailed, or to explain something in more detail.",
  facilitate: "To make an action or process easier.",
  gregarious: "Enjoying the company of other people.",
  hypothesis: "A proposed explanation that can be tested.",
  inevitable: "Certain to happen or impossible to avoid.",
  juxtapose: "To place two things side by side so they can be compared.",
  labyrinth: "A confusing network of paths or passages.",
  magnificent: "Very impressive, beautiful, or grand.",
  notorious: "Well known for something bad.",
  obsolete: "No longer used because something newer has replaced it.",
  phenomenal: "Extremely impressive or remarkable.",
  quintessential: "The clearest or most typical example of a particular quality.",
  renaissance: "A revival of interest, activity, or creativity.",
  sophisticated: "Highly developed, complex, or showing refined taste.",
  tremendous: "Very great in size, strength, or degree.",
  ubiquitous: "Present or found almost everywhere.",
  vicarious: "Experienced through someone else’s actions or experiences.",
  whimsical: "Playfully unusual or imaginative.",
  xenophobia: "Fear or dislike of people seen as coming from another country or culture.",
  zealous: "Showing very strong enthusiasm for a cause or activity.",
  ambiguous: "Having more than one possible meaning.",
  benevolent: "Kind and willing to help others.",
  conscientious: "Careful to do things properly and meet your responsibilities.",
  diligent: "Working carefully and steadily.",
  eloquent: "Able to express ideas clearly and persuasively.",
  fastidious: "Very concerned about accuracy, cleanliness, or small details.",
  grandiose: "Seeming impressive in a way that is exaggerated or unrealistic.",
  haphazard: "Done without a clear plan or order.",
  immaculate: "Perfectly clean, tidy, or free from mistakes.",
  judicious: "Showing careful and sensible judgement.",
  meticulous: "Paying very close attention to every detail.",
  nonchalant: "Appearing calm and unconcerned.",
  ostentatious: "Designed to attract attention by showing off wealth or importance.",
  pragmatic: "Focused on what works in practice.",
  resilient: "Able to recover after difficulties or change.",
  serendipity: "The chance discovery of something good or valuable.",
  anonymous: "Having a name that is unknown or deliberately kept private.",
  articulate: "Able to express thoughts clearly, or to put them into words.",
  comprehensive: "Covering all or almost all of what matters.",
  contemporary: "Existing at the same time, or belonging to the present.",
  demonstrate: "To show how something works or provide evidence for it.",
  distinguish: "To recognise or show the difference between things.",
  entrepreneur: "Someone who starts a business and takes on its risks.",
  fundamental: "Forming an essential part or foundation of something.",
  influential: "Able to affect what people think or what happens.",
  prestigious: "Widely admired or respected.",
  spontaneous: "Happening naturally without being planned in advance.",
  substantial: "Large or important enough to matter.",
  versatile: "Able to do many different things or be used in different ways.",
  transcendent: "Going beyond ordinary limits or experience.",
  legislation: "Laws, or the process of making laws.",
  anticipation: "The feeling or act of expecting something in advance.",
  proclamation: "An official public announcement.",
  reconciliation: "The process of restoring agreement or a good relationship.",
  conglomerate: "A large company made up of several different businesses.",
  unprecedented: "Never known or done before.",
  revolutionary: "Involving or bringing about a complete or major change.",
  indispensable: "So necessary that you cannot do without it.",
  charismatic: "Having personal charm that strongly attracts or influences others.",
  peripheral: "Near an outer edge, or less important than the main thing.",
  theoretical: "Based on ideas or principles, rather than on practical experience."
};

// Configuration constants
export const GAME_CONFIG = {
  TIMER_DURATION: 5, // seconds per question
  TOTAL_QUESTIONS: 20,
  WORDS_PER_TYPE: 10, // 10 real, 10 fake
  EXAMPLE_WORD: {
    word: 'fantastic',
    isReal: true,
    explanation: "Fantastic is a real English word meaning 'extremely good' or 'excellent'."
  }
};

// Helper functions for word generation
export const getAllRealWords = () => {
  return Object.values(REAL_WORDS).flat();
};

export const getAllFakeWords = () => {
  return Object.values(FAKE_WORDS).flat();
};

function shuffle(words) {
  const result = [...words];
  for (let index = result.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

export const generateRandomWords = () => {
  const selectedReal = shuffle(getAllRealWords())
    .slice(0, GAME_CONFIG.WORDS_PER_TYPE)
    .map(word => ({ word, isReal: true, definition: definitions[word] }));
  const selectedFake = shuffle(getAllFakeWords())
    .slice(0, GAME_CONFIG.WORDS_PER_TYPE)
    .map(word => ({ word, isReal: false }));

  return shuffle([...selectedReal, ...selectedFake]);
};

// Utility function to check if a word is real
export const isRealWord = (word) => {
  return getAllRealWords().includes(word.toLowerCase());
};

// Get word statistics for debugging/admin purposes
export const getWordStats = () => {
  const realCount = getAllRealWords().length;
  const fakeCount = getAllFakeWords().length;
  
  return {
    totalReal: realCount,
    totalFake: fakeCount,
    totalWords: realCount + fakeCount,
    realByLevel: Object.entries(REAL_WORDS).map(([level, words]) => ({ level, count: words.length })),
    fakeByLevel: Object.entries(FAKE_WORDS).map(([level, words]) => ({ level, count: words.length }))
  };
};
