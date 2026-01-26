# Frontend Design & UI/UX

## 1. Brand Identity
- **Vibe:** Soft, rounded, approachable, and non-stressful. Avoid sharp corners and high-contrast blacks.
- **Typography:** Rounded Sans-Serif (e.g., Quicksand or Varela Round).

## 2. Color Palette (Warm & Calm)
- **Primary Background:** `#FFF9F2` (Soft Cream/Off-white).
- **Primary Accent:** `#FF9F43` (Soft Muted Orange - Represents the sun/waking up).
- **Secondary Accent:** `#74B9FF` (Calm Sky Blue).
- **Text:** `#4A4A4A` (Soft Charcoal, not pure black).
- **Cards/Items:** White with very subtle shadows (elevation: 2).

## 3. Layout Components
- **Tab Bar:**
  - 3 Icons: `Alarms` (Clock icon), `Create` (Plus/Mic icon), and `Templates` (Library icon).
  - Use a blurred/translucent background for the tab bar.
- **Alarm Cards:**
  - Large, bold time (e.g., 40px weight).
  - A simple toggle switch using the Primary Accent color when ON.
- **The "Create" Interface:**
  - A large, circular "Record" button that pulses gently when active.
  - Selection chips for "Man/Woman" and "Temperature" that change color when selected.
- **The "Templates" List:**
  - Horizontal scrolling categories at the top (e.g., "Nature," "Zen," "Hype").
  - List items with a small "Play" icon on the left and an "Add" icon on the right.

## 4. Animations
- **Transitions:** Use `react-native-reanimated` for smooth fade-ins between tabs.
- **On-Press:** All buttons should have a slight "squish" effect (scale down to 0.97) to feel tactile and friendly.
