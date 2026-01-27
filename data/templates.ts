// Audio template data for the Templates page

export type TemplateCategory = 'sounds' | 'speech';

export interface AudioTemplate {
  id: string;
  title: string;
  description: string;
  category: TemplateCategory;
  duration: string; // e.g., "0:30"
  // In production, this would be a URI to an audio file
  // For now, we'll use placeholder identifiers
  audioSource: string;
  icon: 'sun' | 'moon' | 'bird' | 'water' | 'bell' | 'music' | 'speech';
}

export const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'sounds', label: 'Sounds' },
  { id: 'speech', label: 'Speech' },
] as const;

export const TEMPLATES: AudioTemplate[] = [
  // Sounds category
  {
    id: 'gentle-sunrise',
    title: 'Gentle Sunrise',
    description: 'Soft, gradually increasing tones',
    category: 'sounds',
    duration: '0:30',
    audioSource: 'gentle-sunrise',
    icon: 'sun',
  },
  {
    id: 'morning-birds',
    title: 'Morning Birds',
    description: 'Peaceful birdsong to ease you awake',
    category: 'sounds',
    duration: '0:45',
    audioSource: 'morning-birds',
    icon: 'bird',
  },
  {
    id: 'ocean-waves',
    title: 'Ocean Waves',
    description: 'Calming waves with soft chimes',
    category: 'sounds',
    duration: '1:00',
    audioSource: 'ocean-waves',
    icon: 'water',
  },
  {
    id: 'wind-chimes',
    title: 'Wind Chimes',
    description: 'Delicate chimes in a gentle breeze',
    category: 'sounds',
    duration: '0:30',
    audioSource: 'wind-chimes',
    icon: 'bell',
  },
  {
    id: 'forest-morning',
    title: 'Forest Morning',
    description: 'Rustling leaves and distant birds',
    category: 'sounds',
    duration: '1:00',
    audioSource: 'forest-morning',
    icon: 'bird',
  },
  {
    id: 'soft-piano',
    title: 'Soft Piano',
    description: 'Gentle piano melody',
    category: 'sounds',
    duration: '0:45',
    audioSource: 'soft-piano',
    icon: 'music',
  },

  // Speech category
  {
    id: 'motivational-start',
    title: 'Motivational Start',
    description: 'Energizing words to begin your day',
    category: 'speech',
    duration: '0:18',
    audioSource: 'motivational-start',
    icon: 'speech',
  },
  {
    id: 'calm-awakening',
    title: 'Calm Awakening',
    description: 'Soothing voice guiding you awake',
    category: 'speech',
    duration: '0:17',
    audioSource: 'calm-awakening',
    icon: 'speech',
  },
  {
    id: 'positive-affirmations',
    title: 'Positive Affirmations',
    description: 'Start with self-love and positivity',
    category: 'speech',
    duration: '0:20',
    audioSource: 'positive-affirmations',
    icon: 'speech',
  },
  {
    id: 'mindful-morning',
    title: 'Mindful Morning',
    description: 'Brief mindfulness to center yourself',
    category: 'speech',
    duration: '00:22',
    audioSource: 'mindful-morning',
    icon: 'speech',
  },
  {
    id: 'energy-boost',
    title: 'Energy Boost',
    description: 'High-energy wake-up call',
    category: 'speech',
    duration: '0:13',
    audioSource: 'energy-boost',
    icon: 'speech',
  },
  {
    id: 'rich-mindset',
    title: 'Rich Mindset',
    description: 'Start your day with a rich mindset',
    category: 'speech',
    duration: '0:24',
    audioSource: 'rich-mindset',
    icon: 'speech',
  },
];

export function getTemplatesByCategory(category: string): AudioTemplate[] {
  if (category === 'all') {
    return TEMPLATES;
  }
  return TEMPLATES.filter(t => t.category === category);
}

export function getTemplateById(id: string): AudioTemplate | undefined {
  return TEMPLATES.find(t => t.id === id);
}
