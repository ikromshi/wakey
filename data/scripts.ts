/**
 * Motivational scripts for users to record
 */

export interface Script {
  id: string;
  title: string;
  category: 'motivation' | 'gentle' | 'energetic' | 'mindful';
  text: string;
  duration: string; // Estimated reading time
}

export const SCRIPT_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'motivation', label: 'Motivation' },
  { id: 'gentle', label: 'Gentle' },
  { id: 'energetic', label: 'Energetic' },
  { id: 'mindful', label: 'Mindful' },
] as const;

export const SCRIPTS: Script[] = [
  // Motivation
  {
    id: 'mot-1',
    title: 'Champion Mindset',
    category: 'motivation',
    text: "Rise and shine, champion! Today is your day to conquer. Every great achievement starts with the decision to try. Get up, show up, and never give up. You've got this!",
    duration: '~15 sec',
  },
  {
    id: 'mot-2',
    title: 'New Opportunities',
    category: 'motivation',
    text: "Good morning! A new day means new opportunities. Yesterday's failures are today's lessons. Get up and chase your dreams with everything you've got.",
    duration: '~12 sec',
  },
  {
    id: 'mot-3',
    title: 'Unstoppable',
    category: 'motivation',
    text: "Wake up! You are unstoppable. The only limits that exist are the ones you place on yourself. Today, break through those barriers and show the world what you're made of.",
    duration: '~15 sec',
  },

  // Gentle
  {
    id: 'gen-1',
    title: 'Peaceful Morning',
    category: 'gentle',
    text: "Good morning, beautiful soul. Take a deep breath. There's no rush. Gently open your eyes and welcome this new day with gratitude and peace.",
    duration: '~12 sec',
  },
  {
    id: 'gen-2',
    title: 'Soft Awakening',
    category: 'gentle',
    text: "Hey there, sleepyhead. It's time to slowly wake up. Stretch your body, feel the comfort around you, and when you're ready, start your day with a smile.",
    duration: '~12 sec',
  },
  {
    id: 'gen-3',
    title: 'Self-Care Start',
    category: 'gentle',
    text: "Good morning. Remember, you deserve rest, but you also deserve to experience this beautiful day. Take your time, be kind to yourself, and rise when you're ready.",
    duration: '~14 sec',
  },

  // Energetic
  {
    id: 'eng-1',
    title: 'Let\'s Go!',
    category: 'energetic',
    text: "WAKE UP! Let's GO! The world is waiting for you! Jump out of bed, splash some water on your face, and attack this day with unstoppable energy!",
    duration: '~10 sec',
  },
  {
    id: 'eng-2',
    title: 'Morning Power',
    category: 'energetic',
    text: "Rise and GRIND! No more snoozing! Every second counts. Get up, get moving, and make today absolutely LEGENDARY!",
    duration: '~10 sec',
  },
  {
    id: 'eng-3',
    title: 'Seize the Day',
    category: 'energetic',
    text: "GOOD MORNING! Time to seize the day! Your goals won't achieve themselves. Get up, get dressed, and go get what's yours!",
    duration: '~10 sec',
  },

  // Mindful
  {
    id: 'mind-1',
    title: 'Present Moment',
    category: 'mindful',
    text: "As you wake, take three deep breaths. Feel your body. Notice the air filling your lungs. You are alive. You are present. This moment is a gift.",
    duration: '~15 sec',
  },
  {
    id: 'mind-2',
    title: 'Gratitude Morning',
    category: 'mindful',
    text: "Good morning. Before you rise, think of three things you're grateful for. Let that gratitude fill your heart and guide your day with positivity.",
    duration: '~12 sec',
  },
  {
    id: 'mind-3',
    title: 'Intention Setting',
    category: 'mindful',
    text: "Welcome to a new day. As you open your eyes, set one intention for today. What kind of person do you want to be? Hold that vision as you begin.",
    duration: '~14 sec',
  },
];

export function getScriptsByCategory(category: string): Script[] {
  if (category === 'all') return SCRIPTS;
  return SCRIPTS.filter(s => s.category === category);
}
