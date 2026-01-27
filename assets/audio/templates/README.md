# Template Audio Files

Place your template audio files in this directory. Files should be named to match the template IDs in `data/templates.ts`.

## Expected Files

### Sounds Category
| Filename | Template Name | Description |
|----------|---------------|-------------|
| `gentle-sunrise.mp3` | Gentle Sunrise | Soft, gradually increasing tones |
| `morning-birds.mp3` | Morning Birds | Peaceful birdsong to ease you awake |
| `ocean-waves.mp3` | Ocean Waves | Calming waves with soft chimes |
| `wind-chimes.mp3` | Wind Chimes | Delicate chimes in a gentle breeze |
| `forest-morning.mp3` | Forest Morning | Rustling leaves and distant birds |
| `soft-piano.mp3` | Soft Piano | Gentle piano melody |

### Speech Category
| Filename | Template Name | Description |
|----------|---------------|-------------|
| `motivational-start.mp3` | Motivational Start | Energizing words to begin your day |
| `calm-awakening.mp3` | Calm Awakening | Soothing voice guiding you awake |
| `positive-affirmations.mp3` | Positive Affirmations | Start with self-love and positivity |
| `mindful-morning.mp3` | Mindful Morning | Brief mindfulness to center yourself |
| `energy-boost.mp3` | Energy Boost | High-energy wake-up call |
| `gratitude-moment.mp3` | Gratitude Moment | Start your day with thankfulness |

## Audio Format Recommendations

- **Format:** MP3 or M4A
- **Sample Rate:** 44.1 kHz
- **Bit Rate:** 128-256 kbps
- **Duration:** Match the duration specified in `data/templates.ts`

## Adding New Templates

1. Add the audio file to this directory
2. Add a corresponding entry in `data/templates.ts` with:
   - Matching `id` (filename without extension)
   - Appropriate `title`, `description`, `category`
   - Accurate `duration` (e.g., "0:30", "1:00")
   - Suitable `icon` for the UI
