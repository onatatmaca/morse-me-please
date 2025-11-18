/**
 * Comprehensive Morse Code Lesson Data
 * Uses the Koch Method for progressive character introduction
 *
 * Koch Method: Start with two characters (E, T), master them, then add more
 * This prevents students from "counting" dots and dashes, forcing pattern recognition
 */

export const LESSONS = [
  // ==================== BEGINNER LESSONS (1-5) ====================

  {
    id: 1,
    title: "First Steps: E and T",
    description: "Learn the two simplest letters in Morse code",
    difficulty: "beginner",
    icon: "🎯",
    characters: ['E', 'T'], // E=·  T=−
    newCharacters: ['E', 'T'],
    estimatedTime: "5 min",
    requiredAccuracy: 70, // Forgiving for first lesson
    requiredWPM: 5,
    exercises: [
      {
        id: '1-1',
        type: 'listen',
        title: 'Listen: E',
        instruction: 'Listen to the letter E (one dot)',
        character: 'E',
        repetitions: 3
      },
      {
        id: '1-2',
        type: 'type',
        title: 'Type: E',
        instruction: 'Now type the letter E',
        target: 'E',
        attempts: 3
      },
      {
        id: '1-3',
        type: 'listen',
        title: 'Listen: T',
        instruction: 'Listen to the letter T (one dash)',
        character: 'T',
        repetitions: 3
      },
      {
        id: '1-4',
        type: 'type',
        title: 'Type: T',
        instruction: 'Now type the letter T',
        target: 'T',
        attempts: 3
      },
      {
        id: '1-5',
        type: 'mixed',
        title: 'Mixed Practice: E & T',
        instruction: 'Type what you hear',
        characters: ['E', 'T'],
        count: 10
      },
      {
        id: '1-6',
        type: 'word',
        title: 'Simple Words',
        instruction: 'Type these simple combinations',
        targets: ['TE', 'ET', 'EET', 'TET'],
        each: 2
      }
    ],
    tips: [
      "E is the shortest: just one quick tap (·)",
      "T is just one long press (−)",
      "Don't worry about perfect timing at first!",
      "Focus on feeling the difference between short and long"
    ],
    achievements: ['first-letter', 'first-lesson']
  },

  {
    id: 2,
    title: "Adding I, A, N, M",
    description: "Expand your vocabulary with four new letters",
    difficulty: "beginner",
    icon: "📝",
    characters: ['E', 'T', 'I', 'A', 'N', 'M'],
    newCharacters: ['I', 'A', 'N', 'M'],
    estimatedTime: "8 min",
    requiredAccuracy: 75,
    requiredWPM: 5,
    exercises: [
      {
        id: '2-1',
        type: 'review',
        title: 'Quick Review',
        instruction: 'Review E and T',
        characters: ['E', 'T'],
        count: 5
      },
      {
        id: '2-2',
        type: 'learn',
        title: 'New Letter: I',
        instruction: 'I = two dots (··)',
        character: 'I',
        showCode: true
      },
      {
        id: '2-3',
        type: 'learn',
        title: 'New Letter: A',
        instruction: 'A = dot dash (·−)',
        character: 'A',
        showCode: true
      },
      {
        id: '2-4',
        type: 'learn',
        title: 'New Letter: N',
        instruction: 'N = dash dot (−·)',
        character: 'N',
        showCode: true
      },
      {
        id: '2-5',
        type: 'learn',
        title: 'New Letter: M',
        instruction: 'M = two dashes (−−)',
        character: 'M',
        showCode: true
      },
      {
        id: '2-6',
        type: 'mixed',
        title: 'All Six Letters',
        instruction: 'Type what you hear',
        characters: ['E', 'T', 'I', 'A', 'N', 'M'],
        count: 15
      },
      {
        id: '2-7',
        type: 'word',
        title: 'Real Words!',
        instruction: 'You can now spell actual words',
        targets: ['TEAM', 'MEAT', 'NAME', 'MAIN', 'MANE', 'AMEN'],
        each: 2
      }
    ],
    tips: [
      "I is like E but twice (··)",
      "M is like T but twice (−−)",
      "A and N are opposites: ·− vs −·",
      "You can now spell real English words!"
    ],
    achievements: ['six-letters', 'first-word']
  },

  {
    id: 3,
    title: "SOS - Emergency Signal",
    description: "Learn the world's most famous Morse code sequence",
    difficulty: "beginner",
    icon: "🚨",
    characters: ['S', 'O', 'E', 'T', 'I', 'A', 'N', 'M'],
    newCharacters: ['S', 'O'],
    estimatedTime: "6 min",
    requiredAccuracy: 75,
    requiredWPM: 6,
    exercises: [
      {
        id: '3-1',
        type: 'learn',
        title: 'New Letter: S',
        instruction: 'S = three dots (···)',
        character: 'S',
        showCode: true
      },
      {
        id: '3-2',
        type: 'learn',
        title: 'New Letter: O',
        instruction: 'O = three dashes (−−−)',
        character: 'O',
        showCode: true
      },
      {
        id: '3-3',
        type: 'word',
        title: 'The Famous SOS',
        instruction: 'Type SOS - the international distress signal',
        targets: ['SOS'],
        each: 5,
        special: true
      },
      {
        id: '3-4',
        type: 'story',
        title: 'Why SOS?',
        text: "SOS (··· −−− ···) was chosen because it's distinctive and easy to recognize, even in poor conditions. It doesn't actually stand for 'Save Our Ship' - that's a myth!",
        quiz: {
          question: "Now type SOS from memory",
          answer: 'SOS'
        }
      },
      {
        id: '3-5',
        type: 'mixed',
        title: 'Practice with S & O',
        instruction: 'All eight letters',
        characters: ['E', 'T', 'I', 'A', 'N', 'M', 'S', 'O'],
        count: 15
      },
      {
        id: '3-6',
        type: 'word',
        title: 'More Words',
        instruction: 'New words with S and O',
        targets: ['SON', 'SIT', 'SAT', 'SET', 'SEASON', 'MASON'],
        each: 2
      }
    ],
    tips: [
      "S and O are opposites: ··· vs −−−",
      "SOS is easy to remember: S-O-S",
      "In an emergency, SOS can save lives!",
      "Practice SOS until it's automatic"
    ],
    achievements: ['sos-master', 'emergency-ready']
  },

  {
    id: 4,
    title: "Common Letters: H, U, V, F",
    description: "Learn four frequently used letters",
    difficulty: "beginner",
    icon: "⭐",
    characters: ['E', 'T', 'I', 'A', 'N', 'M', 'S', 'O', 'H', 'U', 'V', 'F'],
    newCharacters: ['H', 'U', 'V', 'F'],
    estimatedTime: "10 min",
    requiredAccuracy: 75,
    requiredWPM: 7,
    exercises: [
      {
        id: '4-1',
        type: 'learn',
        title: 'H = ····',
        instruction: 'H is four dots',
        character: 'H',
        showCode: true
      },
      {
        id: '4-2',
        type: 'learn',
        title: 'U = ··−',
        instruction: 'U is two dots and a dash',
        character: 'U',
        showCode: true
      },
      {
        id: '4-3',
        type: 'learn',
        title: 'V = ···−',
        instruction: 'V is three dots and a dash (think: V for Victory)',
        character: 'V',
        showCode: true
      },
      {
        id: '4-4',
        type: 'learn',
        title: 'F = ··−·',
        instruction: 'F is dot dot dash dot',
        character: 'F',
        showCode: true
      },
      {
        id: '4-5',
        type: 'mixed',
        title: 'All 12 Letters',
        instruction: 'Type what you hear',
        characters: ['E', 'T', 'I', 'A', 'N', 'M', 'S', 'O', 'H', 'U', 'V', 'F'],
        count: 20
      },
      {
        id: '4-6',
        type: 'word',
        title: 'Real Words',
        instruction: 'Common English words',
        targets: ['FUN', 'HAS', 'VAN', 'HAVE', 'SAVE', 'FIVE', 'MOST', 'FAST', 'SOFT'],
        each: 2
      }
    ],
    tips: [
      "V for Victory: ···− (three dots, one dash)",
      "H is like I but doubled: ···· vs ··",
      "Notice patterns: S=···, H=····, 5=·····",
      "You now know 12 of the most common letters!"
    ],
    achievements: ['twelve-letters', 'common-words']
  },

  {
    id: 5,
    title: "More Letters: L, R, W, J, P",
    description: "Expand to 17 letters with important additions",
    difficulty: "intermediate",
    icon: "🎓",
    characters: ['E', 'T', 'I', 'A', 'N', 'M', 'S', 'O', 'H', 'U', 'V', 'F', 'L', 'R', 'W', 'J', 'P'],
    newCharacters: ['L', 'R', 'W', 'J', 'P'],
    estimatedTime: "12 min",
    requiredAccuracy: 78,
    requiredWPM: 8,
    exercises: [
      {
        id: '5-1',
        type: 'learn',
        title: 'R = ·−·',
        instruction: 'R is dot dash dot',
        character: 'R',
        showCode: true
      },
      {
        id: '5-2',
        type: 'learn',
        title: 'L = ·−··',
        instruction: 'L is dot dash dot dot',
        character: 'L',
        showCode: true
      },
      {
        id: '5-3',
        type: 'learn',
        title: 'W = ·−−',
        instruction: 'W is dot dash dash',
        character: 'W',
        showCode: true
      },
      {
        id: '5-4',
        type: 'learn',
        title: 'P = ·−−·',
        instruction: 'P is dot dash dash dot',
        character: 'P',
        showCode: true
      },
      {
        id: '5-5',
        type: 'learn',
        title: 'J = ·−−−',
        instruction: 'J is dot dash dash dash',
        character: 'J',
        showCode: true
      },
      {
        id: '5-6',
        type: 'mixed',
        title: 'All 17 Letters',
        instruction: 'Type what you hear',
        characters: ['E', 'T', 'I', 'A', 'N', 'M', 'S', 'O', 'H', 'U', 'V', 'F', 'L', 'R', 'W', 'J', 'P'],
        count: 25
      },
      {
        id: '5-7',
        type: 'word',
        title: 'Complex Words',
        instruction: 'More challenging vocabulary',
        targets: ['HELP', 'WANT', 'WORK', 'JUST', 'POWER', 'WATER', 'PEOPLE', 'PERSON'],
        each: 2
      }
    ],
    tips: [
      "Notice the pattern: J=·−−− has more dashes than W=·−−",
      "R (·−·) is very common in English",
      "L and R are easy to confuse - practice them!",
      "You're halfway through the alphabet!"
    ],
    achievements: ['seventeen-letters', 'half-alphabet']
  },

  // ==================== INTERMEDIATE LESSONS (6-10) ====================

  {
    id: 6,
    title: "Final Letters: B, C, D, G, K",
    description: "Add five more important consonants",
    difficulty: "intermediate",
    icon: "📖",
    characters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'W'],
    newCharacters: ['B', 'C', 'D', 'G', 'K'],
    estimatedTime: "12 min",
    requiredAccuracy: 78,
    requiredWPM: 9,
    exercises: [
      {
        id: '6-1',
        type: 'learn',
        title: 'B = −···',
        instruction: 'B is dash dot dot dot',
        character: 'B',
        showCode: true
      },
      {
        id: '6-2',
        type: 'learn',
        title: 'C = −·−·',
        instruction: 'C is dash dot dash dot',
        character: 'C',
        showCode: true
      },
      {
        id: '6-3',
        type: 'learn',
        title: 'D = −··',
        instruction: 'D is dash dot dot',
        character: 'D',
        showCode: true
      },
      {
        id: '6-4',
        type: 'learn',
        title: 'G = −−·',
        instruction: 'G is dash dash dot',
        character: 'G',
        showCode: true
      },
      {
        id: '6-5',
        type: 'learn',
        title: 'K = −·−',
        instruction: 'K is dash dot dash',
        character: 'K',
        showCode: true
      },
      {
        id: '6-6',
        type: 'mixed',
        title: '22 Letters!',
        instruction: 'Type what you hear',
        characters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'W'],
        count: 30
      },
      {
        id: '6-7',
        type: 'word',
        title: 'New Vocabulary',
        instruction: 'Words using new letters',
        targets: ['BACK', 'CODE', 'GOOD', 'KIND', 'DARK', 'BLACK', 'DECK', 'CLOCK'],
        each: 2
      }
    ],
    tips: [
      "C (−·−·) has a rhythm: dash dot dash dot",
      "K (−·−) is like C but shorter",
      "D (−··) is like B (−···) but shorter",
      "Almost done with the alphabet!"
    ],
    achievements: ['twenty-two-letters', 'consonant-master']
  },

  {
    id: 7,
    title: "Last Letters: Q, X, Y, Z",
    description: "Complete the alphabet with the final four letters",
    difficulty: "intermediate",
    icon: "🏆",
    characters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    newCharacters: ['Q', 'X', 'Y', 'Z'],
    estimatedTime: "10 min",
    requiredAccuracy: 80,
    requiredWPM: 10,
    exercises: [
      {
        id: '7-1',
        type: 'learn',
        title: 'Q = −−·−',
        instruction: 'Q is dash dash dot dash',
        character: 'Q',
        showCode: true
      },
      {
        id: '7-2',
        type: 'learn',
        title: 'X = −··−',
        instruction: 'X is dash dot dot dash',
        character: 'X',
        showCode: true
      },
      {
        id: '7-3',
        type: 'learn',
        title: 'Y = −·−−',
        instruction: 'Y is dash dot dash dash',
        character: 'Y',
        showCode: true
      },
      {
        id: '7-4',
        type: 'learn',
        title: 'Z = −−··',
        instruction: 'Z is dash dash dot dot',
        character: 'Z',
        showCode: true
      },
      {
        id: '7-5',
        type: 'mixed',
        title: 'Complete Alphabet!',
        instruction: 'All 26 letters - Type what you hear',
        characters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
        count: 35
      },
      {
        id: '7-6',
        type: 'word',
        title: 'Challenge Words',
        instruction: 'Complex words using all letters',
        targets: ['QUIZ', 'WAXY', 'LAZY', 'QUICK', 'EXACTLY', 'OXYGEN'],
        each: 2
      },
      {
        id: '7-7',
        type: 'sentence',
        title: 'Full Sentence',
        instruction: 'Type this complete sentence',
        target: 'THE QUICK BROWN FOX JUMPS',
        showText: true
      }
    ],
    tips: [
      "Q and X are rare but important",
      "Y (−·−−) is like a long dash pattern",
      "Z (−−··) sounds like a buzzing bee",
      "Congratulations! You know the entire alphabet!"
    ],
    achievements: ['complete-alphabet', 'alphabet-master', 'pangram-practice']
  },

  {
    id: 8,
    title: "Numbers 0-9",
    description: "Learn all ten numeric digits",
    difficulty: "intermediate",
    icon: "🔢",
    characters: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    newCharacters: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    estimatedTime: "12 min",
    requiredAccuracy: 78,
    requiredWPM: 10,
    exercises: [
      {
        id: '8-1',
        type: 'story',
        title: 'Number Pattern',
        text: "Numbers in Morse follow a pattern: 1-5 start with dots, 6-0 start with dashes. 5 is all dots (·····), 0 is all dashes (−−−−−).",
        quiz: null
      },
      {
        id: '8-2',
        type: 'learn',
        title: '1 = ·−−−−',
        instruction: '1 is one dot, four dashes',
        character: '1',
        showCode: true
      },
      {
        id: '8-3',
        type: 'learn',
        title: '2 = ··−−−',
        instruction: '2 is two dots, three dashes',
        character: '2',
        showCode: true
      },
      {
        id: '8-4',
        type: 'learn',
        title: '3 = ···−−',
        instruction: '3 is three dots, two dashes',
        character: '3',
        showCode: true
      },
      {
        id: '8-5',
        type: 'learn',
        title: '4 = ····−',
        instruction: '4 is four dots, one dash',
        character: '4',
        showCode: true
      },
      {
        id: '8-6',
        type: 'learn',
        title: '5 = ·····',
        instruction: '5 is five dots',
        character: '5',
        showCode: true
      },
      {
        id: '8-7',
        type: 'learn',
        title: '6 = −····',
        instruction: '6 is one dash, four dots',
        character: '6',
        showCode: true
      },
      {
        id: '8-8',
        type: 'learn',
        title: '7 = −−···',
        instruction: '7 is two dashes, three dots',
        character: '7',
        showCode: true
      },
      {
        id: '8-9',
        type: 'learn',
        title: '8 = −−−··',
        instruction: '8 is three dashes, two dots',
        character: '8',
        showCode: true
      },
      {
        id: '8-10',
        type: 'learn',
        title: '9 = −−−−·',
        instruction: '9 is four dashes, one dot',
        character: '9',
        showCode: true
      },
      {
        id: '8-11',
        type: 'learn',
        title: '0 = −−−−−',
        instruction: '0 is five dashes',
        character: '0',
        showCode: true
      },
      {
        id: '8-12',
        type: 'mixed',
        title: 'All Numbers',
        instruction: 'Type the numbers you hear',
        characters: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        count: 20
      },
      {
        id: '8-13',
        type: 'sequence',
        title: 'Number Sequences',
        instruction: 'Type these number sequences',
        targets: ['123', '456', '789', '2024', '911', '1776', '42'],
        each: 2
      }
    ],
    tips: [
      "Numbers always have 5 symbols total",
      "1-5: Start with dots, 6-0: Start with dashes",
      "5 and 0 are easiest: all dots or all dashes",
      "Practice counting: 1-2-3-4-5-6-7-8-9-0"
    ],
    achievements: ['number-master', 'count-to-ten']
  },

  {
    id: 9,
    title: "Common Punctuation",
    description: "Learn the most useful punctuation marks",
    difficulty: "intermediate",
    icon: "✏️",
    characters: ['.', ',', '?', '!', "'"],
    newCharacters: ['.', ',', '?', '!', "'"],
    estimatedTime: "10 min",
    requiredAccuracy: 75,
    requiredWPM: 10,
    exercises: [
      {
        id: '9-1',
        type: 'learn',
        title: 'Period: ·−·−·−',
        instruction: 'Period is dot dash dot dash dot dash',
        character: '.',
        showCode: true
      },
      {
        id: '9-2',
        type: 'learn',
        title: 'Comma: −−··−−',
        instruction: 'Comma is dash dash dot dot dash dash',
        character: ',',
        showCode: true
      },
      {
        id: '9-3',
        type: 'learn',
        title: 'Question: ··−−··',
        instruction: 'Question mark is dot dot dash dash dot dot',
        character: '?',
        showCode: true
      },
      {
        id: '9-4',
        type: 'learn',
        title: 'Exclamation: −·−·−−',
        instruction: 'Exclamation is dash dot dash dot dash dash',
        character: '!',
        showCode: true
      },
      {
        id: '9-5',
        type: 'learn',
        title: "Apostrophe: ·−−−−·",
        instruction: "Apostrophe is dot dash dash dash dash dot",
        character: "'",
        showCode: true
      },
      {
        id: '9-6',
        type: 'sentence',
        title: 'Sentences with Punctuation',
        instruction: 'Type these sentences',
        targets: [
          'HI THERE.',
          'HOW ARE YOU?',
          'HELP!',
          "IT'S EASY.",
          'YES, I CAN.'
        ],
        each: 1,
        showText: true
      }
    ],
    tips: [
      "Punctuation is longer than letters",
      "Period (·−·−·−) has a dot-dash pattern",
      "Question mark mimics the tone of a question",
      "You can now write proper sentences!"
    ],
    achievements: ['punctuation-pro', 'full-sentences']
  },

  {
    id: 10,
    title: "Speed Training: 15 WPM",
    description: "Increase your transmission speed",
    difficulty: "advanced",
    icon: "⚡",
    characters: ['E', 'T', 'A', 'O', 'I', 'N', 'S', 'H', 'R', 'D', 'L', 'U'], // Most common letters
    newCharacters: [],
    estimatedTime: "15 min",
    requiredAccuracy: 85,
    requiredWPM: 15,
    exercises: [
      {
        id: '10-1',
        type: 'story',
        title: 'Speed Training',
        text: "To increase speed, focus on rhythm rather than individual dots and dashes. Learn to recognize whole characters as patterns. This lesson will push you to 15 WPM!",
        quiz: null
      },
      {
        id: '10-2',
        type: 'speed',
        title: 'Common Letters Sprint',
        instruction: 'Type as many as you can in 60 seconds',
        characters: ['E', 'T', 'A', 'O', 'I', 'N'],
        duration: 60,
        targetWPM: 15
      },
      {
        id: '10-3',
        type: 'word',
        title: 'Common Words - Speed',
        instruction: 'Type these quickly',
        targets: ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER'],
        each: 3,
        timeLimit: 5 // 5 seconds per word
      },
      {
        id: '10-4',
        type: 'sentence',
        title: 'Speed Sentences',
        instruction: 'Type complete sentences quickly',
        targets: [
          'THE SUN IS OUT',
          'SEND HELP NOW',
          'I CAN DO THIS',
          'SPEED UP YOUR MORSE',
          'PRACTICE MAKES PERFECT'
        ],
        each: 2,
        showText: true
      }
    ],
    tips: [
      "Don't think about dots and dashes - hear patterns",
      "Increase WPM gradually in Settings",
      "Accuracy is more important than speed",
      "15 WPM is considered competent!"
    ],
    achievements: ['speed-demon-15', 'rhythm-master']
  },

  // ==================== ADVANCED LESSONS (11-15) ====================

  {
    id: 11,
    title: "Conversation Practice",
    description: "Practice realistic conversational exchanges",
    difficulty: "advanced",
    icon: "💬",
    characters: [], // Uses all known characters
    newCharacters: [],
    estimatedTime: "15 min",
    requiredAccuracy: 80,
    requiredWPM: 12,
    exercises: [
      {
        id: '11-1',
        type: 'conversation',
        title: 'Greeting Exchange',
        instruction: 'Respond to the greeting',
        prompts: [
          { bot: 'HI THERE', userShouldSay: 'HI' },
          { bot: 'HOW ARE YOU', userShouldSay: 'GOOD' },
          { bot: 'NICE TO MEET YOU', userShouldSay: 'YOU TOO' }
        ]
      },
      {
        id: '11-2',
        type: 'conversation',
        title: 'Question & Answer',
        instruction: 'Answer the questions',
        prompts: [
          { bot: 'WHAT IS YOUR NAME', userShouldSay: 'YOUR NAME' },
          { bot: 'WHERE ARE YOU FROM', userShouldSay: 'YOUR LOCATION' },
          { bot: 'DO YOU LIKE MORSE CODE', userShouldSay: 'YES' }
        ],
        freeform: true
      },
      {
        id: '11-3',
        type: 'conversation',
        title: 'Practice Conversation',
        instruction: 'Have a full conversation with the practice bot',
        bot: true,
        topics: ['greetings', 'hobbies', 'weather'],
        minExchanges: 5
      }
    ],
    tips: [
      "Conversations are more natural than drills",
      "Think about what you want to say",
      "Common phrases become automatic",
      "This prepares you for real chats!"
    ],
    achievements: ['conversationalist', 'chat-ready']
  },

  {
    id: 12,
    title: "Advanced Punctuation",
    description: "Master all punctuation marks",
    difficulty: "advanced",
    icon: "📑",
    characters: ['.', ',', '?', '!', "'", '"', '/', ':', ';', '(', ')', '=', '-', '_', '+', '@'],
    newCharacters: ['"', '/', ':', ';', '(', ')', '=', '-', '_', '+', '@'],
    estimatedTime: "12 min",
    requiredAccuracy: 75,
    requiredWPM: 10,
    exercises: [
      {
        id: '12-1',
        type: 'learn',
        title: 'Quotation: ·−··−·',
        instruction: 'Quotation mark',
        character: '"',
        showCode: true
      },
      {
        id: '12-2',
        type: 'learn',
        title: 'Slash: −··−·',
        instruction: 'Forward slash',
        character: '/',
        showCode: true
      },
      {
        id: '12-3',
        type: 'learn',
        title: 'Colon: −−−···',
        instruction: 'Colon',
        character: ':',
        showCode: true
      },
      {
        id: '12-4',
        type: 'learn',
        title: 'Semicolon: −·−·−·',
        instruction: 'Semicolon',
        character: ';',
        showCode: true
      },
      {
        id: '12-5',
        type: 'learn',
        title: 'Parentheses: −·−−· and −·−−·−',
        instruction: 'Opening and closing parentheses',
        characters: ['(', ')'],
        showCode: true
      },
      {
        id: '12-6',
        type: 'learn',
        title: 'Equals: −···−',
        instruction: 'Equals sign',
        character: '=',
        showCode: true
      },
      {
        id: '12-7',
        type: 'learn',
        title: 'Hyphen: −····−',
        instruction: 'Hyphen/minus',
        character: '-',
        showCode: true
      },
      {
        id: '12-8',
        type: 'learn',
        title: 'Underscore: ··−−·−',
        instruction: 'Underscore',
        character: '_',
        showCode: true
      },
      {
        id: '12-9',
        type: 'learn',
        title: 'Plus: ·−·−·',
        instruction: 'Plus sign',
        character: '+',
        showCode: true
      },
      {
        id: '12-10',
        type: 'learn',
        title: 'At sign: ·−−·−·',
        instruction: 'At symbol (@)',
        character: '@',
        showCode: true
      },
      {
        id: '12-11',
        type: 'sentence',
        title: 'Complex Sentences',
        instruction: 'Type sentences with various punctuation',
        targets: [
          'HE SAID, "HELLO!"',
          'TIME: 12:30',
          '2 + 2 = 4',
          'EMAIL ME @ MORSE.COM',
          'YES/NO (PICK ONE);'
        ],
        each: 1,
        showText: true
      }
    ],
    tips: [
      "Punctuation adds meaning to messages",
      "Not commonly used in casual morse chat",
      "Essential for technical communications",
      "You now know the complete morse code set!"
    ],
    achievements: ['punctuation-master', 'complete-code']
  },

  {
    id: 13,
    title: "Speed Challenge: 20 WPM",
    description: "Reach professional speed",
    difficulty: "advanced",
    icon: "🚀",
    characters: [],
    newCharacters: [],
    estimatedTime: "15 min",
    requiredAccuracy: 85,
    requiredWPM: 20,
    exercises: [
      {
        id: '13-1',
        type: 'story',
        title: '20 WPM Milestone',
        text: "20 WPM is considered professional competency. At this speed, you can handle real-world morse communications. Focus on smooth rhythm!",
        quiz: null
      },
      {
        id: '13-2',
        type: 'speed',
        title: '20 WPM Sprint',
        instruction: 'Random letters at 20 WPM for 90 seconds',
        characters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
        duration: 90,
        targetWPM: 20
      },
      {
        id: '13-3',
        type: 'word',
        title: 'High-Speed Words',
        instruction: 'Type words quickly',
        targets: ['QUICK', 'BROWN', 'FOX', 'JUMPS', 'OVER', 'LAZY', 'DOG'],
        each: 3,
        targetWPM: 20
      },
      {
        id: '13-4',
        type: 'sentence',
        title: 'Speed Paragraphs',
        instruction: 'Type complete sentences at 20 WPM',
        targets: [
          'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG',
          'PACK MY BOX WITH FIVE DOZEN LIQUOR JUGS',
          'SPHINX OF BLACK QUARTZ JUDGE MY VOW'
        ],
        each: 2,
        targetWPM: 20,
        showText: true
      }
    ],
    tips: [
      "20 WPM means you're a skilled operator",
      "Maintain steady rhythm - don't rush",
      "Accuracy still beats speed",
      "Professional morse operators use 20-25 WPM"
    ],
    achievements: ['speed-demon-20', 'professional-operator']
  },

  {
    id: 14,
    title: "Master Challenge: 25 WPM",
    description: "Achieve expert-level speed",
    difficulty: "expert",
    icon: "👑",
    characters: [],
    newCharacters: [],
    estimatedTime: "20 min",
    requiredAccuracy: 90,
    requiredWPM: 25,
    exercises: [
      {
        id: '14-1',
        type: 'story',
        title: 'Expert Territory',
        text: "25 WPM is expert level. Very few morse operators can sustain this speed with high accuracy. You're in elite company!",
        quiz: null
      },
      {
        id: '14-2',
        type: 'speed',
        title: 'Expert Sprint',
        instruction: 'All characters at 25 WPM for 120 seconds',
        characters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        duration: 120,
        targetWPM: 25
      },
      {
        id: '14-3',
        type: 'dictation',
        title: 'News Article',
        instruction: 'Type this article at 25 WPM',
        text: 'MORSE CODE REMAINS RELEVANT IN MODERN TIMES. DESPITE THE RISE OF DIGITAL COMMUNICATION, AMATEUR RADIO OPERATORS AND EMERGENCY SERVICES STILL USE THIS CLASSIC METHOD. IT WORKS WHEN OTHER SYSTEMS FAIL.',
        targetWPM: 25,
        showText: false // Listen and type from memory
      }
    ],
    tips: [
      "You're operating at expert level!",
      "Maintain this speed in real conversations",
      "Ham radio license tests require 5-20 WPM",
      "You've mastered morse code!"
    ],
    achievements: ['speed-demon-25', 'expert-operator', 'morse-master']
  },

  {
    id: 15,
    title: "Ultimate Challenge: Farnsworth Method",
    description: "Learn advanced training technique",
    difficulty: "expert",
    icon: "🎖️",
    characters: [],
    newCharacters: [],
    estimatedTime: "20 min",
    requiredAccuracy: 85,
    requiredWPM: 15,
    unlockRequirement: "Complete all previous lessons",
    exercises: [
      {
        id: '15-1',
        type: 'story',
        title: 'Farnsworth Timing',
        text: "The Farnsworth method sends characters at high speed (20+ WPM) but adds extra spacing between letters and words. This trains you to hear patterns instantly rather than counting dots and dashes. It's used by professional morse training programs worldwide.",
        quiz: {
          question: 'Why use Farnsworth timing?',
          options: ['To go faster', 'To learn patterns not count signals', 'To make it easier', 'To confuse learners'],
          correct: 1
        }
      },
      {
        id: '15-2',
        type: 'farnsworth',
        title: 'Farnsworth Practice',
        instruction: 'Characters sent at 20 WPM, effective speed 10 WPM',
        characters: ['E', 'T', 'A', 'O', 'I', 'N', 'S', 'H', 'R'],
        charWPM: 20,
        effectiveWPM: 10,
        count: 30
      },
      {
        id: '15-3',
        type: 'farnsworth',
        title: 'Advanced Farnsworth',
        instruction: 'Chars at 25 WPM, effective 12 WPM',
        characters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
        charWPM: 25,
        effectiveWPM: 12,
        count: 40
      },
      {
        id: '15-4',
        type: 'graduation',
        title: 'Final Test',
        instruction: 'Demonstrate mastery of all skills',
        tests: [
          { type: 'alphabet', requirement: '90% accuracy' },
          { type: 'numbers', requirement: '90% accuracy' },
          { type: 'punctuation', requirement: '85% accuracy' },
          { type: 'speed', requirement: '20 WPM sustained' },
          { type: 'conversation', requirement: 'Complete dialogue' }
        ]
      }
    ],
    tips: [
      "Farnsworth is the gold standard for training",
      "Used by military and ham radio courses",
      "Prevents bad habit of counting",
      "Congratulations on completing all lessons!"
    ],
    achievements: ['farnsworth-graduate', 'ultimate-master', 'training-complete']
  }
];

// Helper: Get lesson by ID
export function getLessonById(id) {
  return LESSONS.find(lesson => lesson.id === id);
}

// Helper: Get unlocked lessons based on progress
export function getUnlockedLessons(completedLessonIds = []) {
  if (completedLessonIds.length === 0) {
    // First time: only lesson 1 is unlocked
    return [LESSONS[0]];
  }

  const maxCompleted = Math.max(...completedLessonIds);
  // Unlock up to the next lesson after highest completed
  return LESSONS.filter(lesson => lesson.id <= maxCompleted + 1);
}

// Helper: Check if lesson is unlocked
export function isLessonUnlocked(lessonId, completedLessonIds = []) {
  if (lessonId === 1) return true; // First lesson always unlocked

  // Unlock if previous lesson is completed
  return completedLessonIds.includes(lessonId - 1);
}

// Helper: Get all characters learned up to a lesson
export function getLearnedCharacters(completedLessonIds = []) {
  const chars = new Set();

  LESSONS.forEach(lesson => {
    if (completedLessonIds.includes(lesson.id)) {
      lesson.characters.forEach(char => chars.add(char));
    }
  });

  return Array.from(chars);
}

// Helper: Calculate overall progress percentage
export function calculateProgress(completedLessonIds = []) {
  return Math.round((completedLessonIds.length / LESSONS.length) * 100);
}

export default LESSONS;
