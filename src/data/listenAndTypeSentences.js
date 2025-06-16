export const SENTENCE_POOLS = {
  A2: [
    {
      id: 'a2_01',
      correctText: "I like to eat pizza on Fridays",
      difficulty: "A2 - Simple present tense with basic vocabulary",
      audioFile: "audio/listen-and-type/A2-01.mp3",
      topics: ["food", "time", "preferences"],
      grammarFocus: "simple present"
    },
    {
      id: 'a2_02',
      correctText: "She's going to the supermarket tomorrow",
      difficulty: "A2 - Future with 'going to' and contractions",
      audioFile: "audio/listen-and-type/A2-02.mp3",
      topics: ["shopping", "future plans"],
      grammarFocus: "going to future"
    },
    {
      id: 'a2_03',
      correctText: "My brother works in a big office",
      difficulty: "A2 - Simple present with family and work vocabulary",
      audioFile: "audio/listen-and-type/A2-03.mp3",
      topics: ["family", "work"],
      grammarFocus: "simple present"
    },
    {
      id: 'a2_04',
      correctText: "We can't find our keys anywhere",
      difficulty: "A2 - Modal verbs with contractions",
      audioFile: "audio/listen-and-type/A2-04.mp3",
      topics: ["problems", "everyday objects"],
      grammarFocus: "modal verbs"
    },
    {
      id: 'a2_05',
      correctText: "The children are playing in the garden",
      difficulty: "A2 - Present continuous with basic vocabulary",
      audioFile: "audio/listen-and-type/A2-05.mp3",
      topics: ["family", "activities", "places"],
      grammarFocus: "present continuous"
    }
  ],
  
  B1: [
    {
      id: 'b1_01',
      correctText: "I've been working here for three years",
      difficulty: "B1 - Present perfect with time expressions",
      audioFile: "audio/listen-and-type/B1-01.mp3",
      topics: ["work", "time expressions"],
      grammarFocus: "present perfect"
    },
    {
      id: 'b1_02',
      correctText: "If it doesn't rain tomorrow we'll have a picnic",
      difficulty: "B1 - First conditional with contractions",
      audioFile: "audio/listen-and-type/B1-02.mp3",
      topics: ["weather", "plans", "conditions"],
      grammarFocus: "first conditional"
    },
    {
      id: 'b1_03',
      correctText: "The meeting was cancelled because the manager wasn't available",
      difficulty: "B1 - Past tense with reason clauses",
      audioFile: "audio/listen-and-type/B1-03.mp3",
      topics: ["work", "meetings", "reasons"],
      grammarFocus: "past simple + because"
    },
    {
      id: 'b1_04',
      correctText: "I used to live in Manchester when I was younger",
      difficulty: "B1 - Used to with past experiences",
      audioFile: "audio/listen-and-type/B1-04.mp3",
      topics: ["past experiences", "places"],
      grammarFocus: "used to"
    }
  ],
  
  B2: [
    {
      id: 'b2_01',
      correctText: "Despite having studied for weeks he couldn't pass the examination",
      difficulty: "B2 - Complex sentence with 'despite' and past perfect",
      audioFile: "audio/listen-and-type/B2-01.mp3",
      topics: ["education", "results"],
      grammarFocus: "despite + gerund"
    },
    {
      id: 'b2_02',
      correctText: "The research suggests that people who exercise regularly live longer",
      difficulty: "B2 - Relative clauses with academic vocabulary",
      audioFile: "audio/listen-and-type/B2-02.mp3",
      topics: ["health", "research"],
      grammarFocus: "complex relative clauses"
    },
    {
      id: 'b2_03',
      correctText: "I wish I'd taken that job offer instead of staying here",
      difficulty: "B2 - Third conditional with regret",
      audioFile: "audio/listen-and-type/B2-03.mp3",
      topics: ["regret", "career decisions"],
      grammarFocus: "wish + past perfect"
    },
    {
      id: 'b2_04',
      correctText: "Had I known about the traffic I would have left earlier",
      difficulty: "B2 - Inverted conditional structures",
      audioFile: "audio/listen-and-type/B2-04.mp3",
      topics: ["transport", "regret"],
      grammarFocus: "inverted conditionals"
    }
  ],
  
  C1: [
    {
      id: 'c1_01',
      correctText: "The government's refusal to make big changes has been criticised a lot",
      difficulty: "C1 - Complex possessive structures with passive voice",
      audioFile: "audio/listen-and-type/C1-01.mp3",
      topics: ["politics", "criticism"],
      grammarFocus: "complex possessive + passive"
    },
    {
      id: 'c1_02',
      correctText: "Despite what the committee said the idea was rejected by everyone",
      difficulty: "C1 - Complex clause structures with simple vocabulary",
      audioFile: "audio/listen-and-type/C1-02.mp3",
      topics: ["meetings", "decisions"],
      grammarFocus: "despite what + clause"
    },
    {
      id: 'c1_03',
      correctText: "The problem shows itself in many different ways that seem unconnected",
      difficulty: "C1 - Complex sentence structure with relative clauses",
      audioFile: "audio/listen-and-type/C1-03.mp3",
      topics: ["problems", "analysis"],
      grammarFocus: "complex relative clauses"
    }
  ]
};

export const TEST_STRUCTURE = [
  { level: 'A2', count: 2 },
  { level: 'B1', count: 3 },
  { level: 'B2', count: 3 },
  { level: 'C1', count: 2 }
];
