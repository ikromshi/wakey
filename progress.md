# RiseAlarm Development Progress

## Task Breakdown (34 tasks total)

### Foundation & Setup (Complete)
- [x] Task 1: Update theme/colors
- [x] Task 2: Set up custom fonts (Quicksand)
- [x] Task 3: Configure 3-tab navigation (Alarms, Create, Templates)

### Home Screen - Alarms (Complete)
- [x] Task 4: Create Alarm data types & context
- [x] Task 5: Build AlarmCard component
- [x] Task 6: Build Alarms list screen
- [x] Task 7: Add swipe-to-delete
- [x] Task 8: Add "New Alarm" flow (time picker)

### Create Page (Complete)
- [x] Task 9: Build Create page layout
- [x] Task 10: Implement audio recording (+ UX redesign)
- [x] Task 11: Build Script reading feature
- [x] Task 12: Build AI TTS interface

### Templates Page (Complete)
- [x] Task 13: Build Templates page layout
- [x] Task 14: Build Template list items
- [x] Task 15: Add audio playback

### Data & Persistence (Complete)
- [x] Task 16: Implement local storage (AsyncStorage)
- [x] Task 17: Implement audio file storage

### Alarm Functionality (Complete)
- [x] Task 18: Set up alarm scheduling (Notifee)

### Onboarding Experience
- [x] Task 19: Set up onboarding navigation flow
- [x] Task 20: Build Welcome screen (intro + value proposition)
- [x] Task 21: Build Feature Discovery screen (interactive demo)
- [x] Task 22: Build AI Voice Preview screen (try the voices)
- [x] Task 23: Build Wake-up Styles screen (personalization)
- [x] Task 24: Complete onboarding flow and transition

### Paywall & Monetization
- [x] Task 25: Install and configure Superwall SDK
- [x] Task 26: Create paywall UI with Basic ($4.99) and Full ($9.99) plans
- [x] Task 27: Implement subscription state management
- [ ] Task 28: Gate AI Voice feature behind Full plan
- [ ] Task 29: Add upgrade prompts and restore purchases

### Authentication & Database
- [ ] Task 30: Set up Supabase project and configuration
- [ ] Task 31: Create database schema (users, subscriptions)
- [ ] Task 32: Build sign-up screen (name, email, password)
- [ ] Task 33: Implement auth state management and session persistence
- [ ] Task 34: Connect subscription data to user accounts

---

## Completed Tasks

### Task 1: Update theme/colors
**Status:** Complete
**Date:** 2026-01-26

**Changes made:**
1. Updated `/constants/theme.ts`:
   - Added RiseAlarm color palette (cream background #FFF9F2, orange accent #FF9F43, blue accent #74B9FF)
   - Added Spacing scale (xs, sm, md, lg, xl, xxl)
   - Added BorderRadius presets for rounded aesthetic
   - Added Shadow presets for cards
   - Added Typography scale with size/weight definitions
   - Configured Quicksand font family names (to be loaded in Task 2)

2. Updated `/app/_layout.tsx`:
   - Removed dark mode support (light-only as requested)
   - Created custom RiseAlarmTheme with design colors
   - Set StatusBar to dark style

3. Updated `/app/(tabs)/_layout.tsx`:
   - Updated tab bar styling with new colors
   - Configured tab bar appearance (background, border, padding)
   - Changed first tab icon to alarm icon
   - Removed colorScheme dependency

4. Updated `/components/ui/icon-symbol.tsx`:
   - Added icon mappings for app-specific icons (alarm, mic, library, play, pause, etc.)

**Files modified:**
- `constants/theme.ts`
- `app/_layout.tsx`
- `app/(tabs)/_layout.tsx`
- `components/ui/icon-symbol.tsx`

**How to verify:**
Run `npm start` or `expo start` and check:
- Background should be soft cream (#FFF9F2)
- Tab bar should have white background with orange active tint
- Status bar text should be dark

---

### Task 2: Set up custom fonts (Quicksand)
**Status:** Complete
**Date:** 2026-01-26

**Changes made:**
1. Installed font packages:
   - `@expo-google-fonts/quicksand`
   - `expo-font` (already included, but ensured proper setup)

2. Updated `/app/_layout.tsx`:
   - Added font loading with `useFonts` hook
   - Loaded all Quicksand weights: Regular (400), Medium (500), SemiBold (600), Bold (700)
   - Added splash screen management to prevent flash of unstyled content
   - App waits for fonts to load before rendering

3. Updated `/app/(tabs)/index.tsx`:
   - Replaced default Expo welcome screen with placeholder Alarms screen
   - Uses Quicksand font family for all text
   - Shows "No alarms yet" empty state with proper styling

**New dependencies:**
- `@expo-google-fonts/quicksand`

**Files modified:**
- `app/_layout.tsx`
- `app/(tabs)/index.tsx`

**How to verify:**
Run `npm start` and check:
- Text should appear in Quicksand font (rounded, friendly appearance)
- "Alarms" title should be bold
- "No alarms yet" should be semi-bold
- Subtext should be regular weight

---

### Task 3: Configure 3-tab navigation (Alarms, Create, Templates)
**Status:** Complete
**Date:** 2026-01-26

**Changes made:**
1. Created `/app/(tabs)/create.tsx`:
   - Placeholder Create screen with header and empty state
   - Uses Quicksand font and app colors
   - Will later contain recording/TTS functionality

2. Created `/app/(tabs)/templates.tsx`:
   - Placeholder Templates screen with header and empty state
   - Uses Quicksand font and app colors
   - Will later contain audio library

3. Updated `/app/(tabs)/_layout.tsx`:
   - Configured 3 tabs: Alarms, Create, Templates
   - Set appropriate icons for each tab:
     - Alarms: alarm icon
     - Create: microphone icon
     - Templates: library/stack icon
   - Added Quicksand-Medium font to tab labels

4. Removed `/app/(tabs)/explore.tsx`:
   - Deleted unused Expo boilerplate file

**Files created:**
- `app/(tabs)/create.tsx`
- `app/(tabs)/templates.tsx`

**Files modified:**
- `app/(tabs)/_layout.tsx`

**Files deleted:**
- `app/(tabs)/explore.tsx`

**How to verify:**
Run `npm start` and check:
- Bottom tab bar shows 3 tabs: Alarms, Create, Templates
- Each tab has its own icon (alarm, mic, library)
- Tapping each tab navigates to its respective screen
- Active tab is highlighted in orange

---

### Task 4: Create Alarm data types & context
**Status:** Complete
**Date:** 2026-01-26

**Changes made:**
1. Created `/types/alarm.ts`:
   - `Alarm` interface with all properties (id, hour, minute, label, enabled, repeatDays, audioSource, snooze settings)
   - `AudioSource` interface for different audio types (recording, tts, template, default)
   - `TTSVoiceConfig` for AI voice settings (gender, temperature)
   - `DayOfWeek` type for repeat scheduling
   - Helper functions: `formatAlarmTime()`, `getNextAlarmDate()`
   - `DEFAULT_ALARM` preset for new alarms
   - `CreateAlarmInput` and `UpdateAlarmInput` utility types

2. Created `/types/index.ts`:
   - Re-exports all types for convenient imports

3. Created `/context/AlarmContext.tsx`:
   - `AlarmProvider` component for state management
   - `useAlarms()` hook with:
     - `alarms` - full alarm list
     - `sortedAlarms` - alarms sorted by time
     - `activeAlarms` - enabled alarms only
     - `addAlarm()` - create new alarm
     - `updateAlarm()` - modify existing alarm
     - `deleteAlarm()` - remove alarm
     - `toggleAlarm()` - enable/disable alarm
     - `getAlarm()` - fetch single alarm by ID

4. Updated `/app/_layout.tsx`:
   - Wrapped app with `AlarmProvider`

5. Updated `/app/(tabs)/index.tsx`:
   - Connected to alarm context with `useAlarms()`
   - Shows alarm count when alarms exist

**Files created:**
- `types/alarm.ts`
- `types/index.ts`
- `context/AlarmContext.tsx`

**Files modified:**
- `app/_layout.tsx`
- `app/(tabs)/index.tsx`

**How to verify:**
Run `npm start` and check:
- App should load without errors
- Alarms screen should display "No alarms yet"
- No console errors about missing context

---

### Task 5: Build AlarmCard component
**Status:** Complete
**Date:** 2026-01-26

**Changes made:**
1. Created `/components/alarm/AlarmCard.tsx`:
   - White card with rounded corners and subtle shadow
   - Large time display (40px, semi-bold Quicksand)
   - Label and repeat days info
   - Toggle switch with orange active color
   - "Squish" animation on press (scale to 0.97)
   - Disabled state with reduced opacity
   - Helper function `formatRepeatDays()` for smart day formatting:
     - "One time", "Every day", "Weekdays", "Weekends", or individual days

2. Created `/components/alarm/index.ts`:
   - Exports AlarmCard for convenient imports

3. Updated `/app/(tabs)/index.tsx`:
   - Added orange "+" button in header
   - Temporary test alarm creation (random time)
   - ScrollView with AlarmCard list
   - Connected toggle functionality
   - Shows alarm count in header

**Files created:**
- `components/alarm/AlarmCard.tsx`
- `components/alarm/index.ts`

**Files modified:**
- `app/(tabs)/index.tsx`

**How to verify:**
Run `npm start` and check:
- Orange "+" button appears in header
- Tapping "+" creates a new alarm card
- Card shows time in large text, label, and "One time"
- Toggle switch changes color when enabled/disabled
- Card has subtle shadow and rounded corners
- Pressing card has slight squish animation

---

### Tasks 6 & 7: Complete Alarms list screen with swipe-to-delete
**Status:** Complete
**Date:** 2026-01-26

**Changes made:**
1. Created `/components/alarm/SwipeableAlarmCard.tsx`:
   - Wraps AlarmCard with swipe gesture handling
   - Swipe left to reveal red delete button
   - Uses react-native-gesture-handler Pan gesture
   - Smooth spring animations for snap behavior
   - Delete button with trash icon and "Delete" text
   - Animated deletion: slides out and collapses height
   - Tapping card when swiped closes the swipe first

2. Updated `/components/alarm/index.ts`:
   - Added SwipeableAlarmCard export

3. Updated `/app/_layout.tsx`:
   - Added GestureHandlerRootView wrapper (required for gestures)

4. Updated `/app/(tabs)/index.tsx`:
   - Switched from AlarmCard to SwipeableAlarmCard
   - Connected deleteAlarm function from context

**Files created:**
- `components/alarm/SwipeableAlarmCard.tsx`

**Files modified:**
- `components/alarm/index.ts`
- `app/_layout.tsx`
- `app/(tabs)/index.tsx`

**How to verify:**
Run `npm start` and check:
- Swipe left on any alarm card to reveal delete button
- Delete button is red with trash icon
- Tapping delete removes the alarm with animation
- Swiping partially and releasing snaps back or opens fully
- Card slides out and collapses when deleted
- Toggle still works when not swiped

---

### Task 8: Add "New Alarm" flow (time picker)
**Status:** Complete
**Date:** 2026-01-26

**Changes made:**
1. Installed `@react-native-community/datetimepicker`:
   - Native time picker component for iOS/Android

2. Created `/app/new-alarm.tsx`:
   - Modal screen for creating new alarms
   - Header with Cancel and Save buttons
   - Native time picker (spinner style on iOS)
   - Label input field with placeholder
   - Day selector for repeat scheduling (circular buttons for S M T W T F S)
   - Smart hint text ("One time alarm", "Every day", "X days selected")
   - Saves alarm and navigates back on Save

3. Updated `/app/_layout.tsx`:
   - Added new-alarm route as modal presentation

4. Updated `/app/(tabs)/index.tsx`:
   - "+" button now navigates to /new-alarm modal
   - Removed temporary random alarm creation

**New dependencies:**
- `@react-native-community/datetimepicker`

**Files created:**
- `app/new-alarm.tsx`

**Files modified:**
- `app/_layout.tsx`
- `app/(tabs)/index.tsx`

**How to verify:**
Run `npm start` and check:
- Tap "+" button opens modal from bottom
- Time picker allows selecting hour/minute
- Label input works with placeholder "Alarm"
- Day buttons toggle on/off (orange when selected)
- Cancel closes modal without saving
- Save creates alarm and closes modal
- New alarm appears in list sorted by time

---

### Task 9: Build Create page layout
**Status:** Complete
**Date:** 2026-01-26

**Changes made:**
1. Updated `/app/(tabs)/create.tsx`:
   - Header with title and subtitle
   - Three selectable PathCard components:
     - "Record Audio" (orange, mic icon) - manual recording
     - "Read a Script" (blue, stack icon) - script reading
     - "AI Voice" (purple, gear icon) - AI TTS generation
   - PathCard features:
     - Colored icon container
     - Title and description
     - Squish animation on press
     - Orange border and checkmark when selected
   - Conditional content sections below cards:
     - RecordSection with large circular record button (placeholder)
     - ScriptSection placeholder
     - AITTSSection placeholder
   - Divider between path selection and content

**Files modified:**
- `app/(tabs)/create.tsx`

**How to verify:**
Run `npm start` and check:
- Create tab shows three option cards
- Cards have colored icons (orange, blue, purple)
- Tapping a card selects it (orange border + checkmark)
- Tapping again deselects it
- Selected card shows relevant content section below
- Record section shows large orange mic button
- All cards have squish animation on press

---

### Task 10: Implement audio recording (+ UX redesign)
**Status:** Complete
**Date:** 2026-01-26

**Changes made:**
1. Installed `expo-audio` (replaced deprecated expo-av):
   - Modern audio recording and playback library
   - Uses `useAudioRecorder` and `useAudioPlayer` hooks from expo-audio

2. Created `/hooks/useAudioRecorder.ts`:
   - Custom hook wrapping expo-audio functionality
   - States: idle, recording, recorded, playing
   - `startRecording()` - sets audio mode, requests permission, starts recording
   - `stopRecording()` - stops recording, polls for URI availability
   - `playRecording()` / `stopPlayback()` - playback controls
   - `discardRecording()` - resets state
   - Duration tracking with interval timer
   - `formatDuration()` helper (MM:SS format)

3. **Major UX Redesign** of `/app/(tabs)/create.tsx`:
   - **New full-screen mode approach:**
     - Selection screen shows 3 path cards with chevron arrows
     - Tapping a card transitions to full-screen interface
     - Back button in header to return to selection
   - **RecordScreen component:**
     - Large 72px centered timer display
     - Big 120px pulsing record button
     - Status text (Ready/Recording/Complete/Playing)
     - Control buttons (Play/Discard/Save) with labels
     - FadeIn animation when controls appear
     - Confirmation dialogs for discard and save
   - **ScriptScreen & AITTSScreen placeholders** with Coming Soon messages

**New dependencies:**
- `expo-av` (for audio recording and playback)

**Files created:**
- `hooks/useAudioRecorder.ts`

**Files modified:**
- `app/(tabs)/create.tsx` (complete rewrite)

**Important Note:**
Initially implemented with `expo-audio`, but discovered a critical bug where `useAudioRecorder` hook doesn't actually save recording files to disk. Switched to `expo-av` which is deprecated but works reliably. The `expo-av` library will be removed in SDK 55, so this will need migration once `expo-audio` is fixed.

**How to verify:**
Run `npm start` and check:
- Create tab shows 3 cards with chevron arrows
- Tap "Record Audio" → full-screen recording interface
- Large timer, big record button centered
- Record → button turns red, pulses, timer counts
- Stop → control buttons appear below (Play/Discard/Save)
- Play button plays back the recorded audio
- Back button returns to selection screen

---

### Task 11: Build Script reading feature
**Status:** Complete
**Date:** 2026-01-26

**Changes made:**
1. Created `/data/scripts.ts`:
   - `Script` interface with id, title, category, text, duration
   - 4 categories: motivation, gentle, energetic, mindful
   - 12 pre-written motivational scripts (3 per category)
   - `SCRIPT_CATEGORIES` constant for filter UI
   - `getScriptsByCategory()` helper function

2. Updated `/app/(tabs)/create.tsx` - ScriptScreen:
   - Category filter with horizontal scrolling chips
   - Script list showing title, preview text, duration, category badge
   - Cards with shadow and rounded corners
   - Tap script to open recording view

3. Updated `/app/(tabs)/create.tsx` - ScriptRecordView:
   - Full script text displayed in card for reading
   - Recording controls (mic button with pulse animation)
   - Duration timer display
   - Status text (Ready/Recording/Complete/Playing)
   - Play/Discard/Save controls after recording
   - Confirmation dialogs for discard and save

**Files created:**
- `data/scripts.ts`

**Files modified:**
- `app/(tabs)/create.tsx`

**How to verify:**
Run `npm start` and check:
- Tap "Read a Script" on Create tab → full-screen script browser
- Category chips filter the script list (All, Motivation, Gentle, Energetic, Mindful)
- Script cards show title, preview text (2 lines), duration, and category badge
- Tap a script → opens recording view with full script text
- Record button works with pulsing animation while recording
- After recording: Play, Discard, Save buttons appear
- Back button returns to script list

---

### Task 12: Build AI TTS interface
**Status:** Complete
**Date:** 2026-01-26

**Changes made:**
1. Updated `/app/(tabs)/create.tsx` - AITTSScreen:
   - Full-screen interface for AI voice generation
   - Multi-line text input with character counter (500 max)
   - Placeholder text with example message
   - Voice gender selection (Female/Male) with visual toggle buttons
   - Voice style selection (Warm, Energetic, Calm, Professional) with descriptions
   - Generate button (disabled until 10+ characters entered)
   - Simulated API call with loading state
   - Generated audio preview card with waveform icon
   - Play/Pause, Discard, and Save controls for generated audio
   - All voice settings changes clear previously generated audio
   - Purple (#9B59B6) theme for AI Voice section

2. Updated `/components/ui/icon-symbol.tsx`:
   - Added `person.fill` icon mapping for gender selection
   - Added `waveform` icon mapping for audio preview

**Files modified:**
- `app/(tabs)/create.tsx`
- `components/ui/icon-symbol.tsx`

**How to verify:**
Run `npm start` and check:
- Tap "AI Voice" on Create tab → full-screen TTS interface
- Text input field accepts multi-line text with character counter
- Gender toggle buttons switch between Female/Male (purple when selected)
- Voice style grid shows 4 options with descriptions
- Generate button disabled when text < 10 characters
- Tapping Generate shows loading state, then "Audio Generated" alert
- Generated audio section appears with Play/Discard/Save buttons
- Changing text or voice settings clears generated audio
- Save confirms and returns to Create selection

---

### Tasks 13-15: Build Templates page with audio playback
**Status:** Complete
**Date:** 2026-01-27

**Changes made:**
1. Created `/data/templates.ts`:
   - `AudioTemplate` interface with id, title, description, category, duration, audioSource, icon
   - `TemplateCategory` type ('sounds' | 'speech')
   - `TEMPLATE_CATEGORIES` for filter UI (All, Sounds, Speech)
   - 12 pre-defined templates (6 sounds, 6 speech)
   - `getTemplatesByCategory()` and `getTemplateById()` helper functions

2. Updated `/app/(tabs)/templates.tsx`:
   - Header with title and subtitle
   - Category filter chips (All, Sounds, Speech)
   - Template list with animated cards
   - `TemplateCard` component with:
     - Colored icon based on template type
     - Title, description, category badge, duration
     - Play/Stop button with state management
     - Squish animation on press
   - "Now Playing" bar at bottom when audio is playing
   - Tap card to select template for alarm
   - Simulated playback (actual audio files not included)

3. Updated `/components/ui/icon-symbol.tsx`:
   - Added template icons: sun.max.fill, moon.fill, leaf.fill, drop.fill, bell.fill, music.note, text.bubble.fill

**Files created:**
- `data/templates.ts`

**Files modified:**
- `app/(tabs)/templates.tsx`
- `components/ui/icon-symbol.tsx`

**How to verify:**
Run `npm start` and check:
- Templates tab shows list of audio templates
- Category chips filter between All/Sounds/Speech
- Each card has colored icon, title, description, badge, duration
- Play button starts "playback" (simulated), turns red (Stop)
- "Now Playing" bar appears at bottom during playback
- Tapping card shows selection alert
- Cards have squish animation on press

---

### Task 16: Implement local storage (AsyncStorage)
**Status:** Complete
**Date:** 2026-01-27

**Changes made:**
1. Installed `@react-native-async-storage/async-storage`:
   - Persistent key-value storage for React Native
   - Works across iOS and Android

2. Updated `/context/AlarmContext.tsx`:
   - Added `STORAGE_KEY` constant (`@rise_alarm/alarms`)
   - Added `isLoading` state to track initialization
   - `loadAlarms()` - loads alarms from AsyncStorage on mount
   - `saveAlarms()` - persists alarms after any change
   - All CRUD operations now async:
     - `addAlarm()` returns `Promise<Alarm>`
     - `updateAlarm()` returns `Promise<void>`
     - `deleteAlarm()` returns `Promise<void>`
     - `toggleAlarm()` returns `Promise<void>`
   - Console logging for debug visibility

**New dependencies:**
- `@react-native-async-storage/async-storage`

**Files modified:**
- `context/AlarmContext.tsx`

**How to verify:**
Run `npm start` and check:
- Create some alarms
- Close and reopen the app
- Alarms should persist and reappear
- Toggle alarm state persists across sessions
- Delete alarm persists across sessions

---

### Task 17: Implement audio file storage
**Status:** Complete
**Date:** 2026-01-27

**Changes made:**
1. Created `/services/audioStorage.ts`:
   - Uses expo-file-system's new SDK 54 API (Paths, File, Directory classes)
   - Stores audio files in `Paths.document/audio/` directory
   - `saveAudioFile(tempUri, type)` - copies from temp to persistent storage
   - `deleteAudioFile(uri)` - removes an audio file
   - `listAudioFiles()` - lists all saved audio files with metadata
   - `getStorageUsage()` - calculates total storage used
   - `audioFileExists(uri)` - checks if a file exists
   - `cleanupOrphanedFiles(activeUris)` - removes files not in use
   - `formatFileSize(bytes)` - formats bytes for display

2. Created `/services/index.ts`:
   - Re-exports all services for convenient imports

3. Updated `/app/(tabs)/create.tsx`:
   - Integrated `saveAudioFile` into RecordScreen's save handler
   - Integrated `saveAudioFile` into ScriptRecordView's save handler
   - Added `isSaving` state for loading feedback
   - Audio files now persist to `Documents/audio/` directory

**Files created:**
- `services/audioStorage.ts`
- `services/index.ts`

**Files modified:**
- `app/(tabs)/create.tsx`

**How to verify:**
Run `npm start` and check:
- Record audio in "Record Audio" or "Read a Script"
- Tap Save - audio is now stored persistently
- Files are saved to Documents/audio/ directory
- Console shows save confirmation with file URI

---

### Task 18: Set up alarm scheduling (Notifee)
**Status:** Complete
**Date:** 2026-01-27

**Changes made:**
1. Installed `@notifee/react-native`:
   - Cross-platform notification library for React Native
   - Supports alarm-style notifications, triggers, and actions

2. Created `/services/alarmScheduler.ts`:
   - `initializeNotifications()` - creates Android notification channel
   - `requestNotificationPermissions()` - requests user permission
   - `scheduleAlarm(alarm)` - schedules a timestamp trigger notification
   - `cancelAlarm(alarmId)` - cancels a scheduled notification
   - `cancelAllAlarms()` - cancels all notifications
   - `rescheduleAllAlarms(alarms)` - reschedules all enabled alarms
   - `snoozeAlarm(alarm)` - schedules a snooze notification
   - `getPendingAlarms()` - lists pending trigger IDs
   - `displayTestNotification()` - shows a test notification
   - Android features: full-screen action, dismiss/snooze buttons, vibration, lights
   - iOS features: critical alerts, time-sensitive interruption level

3. Updated `/services/index.ts`:
   - Added exports for alarmScheduler

4. Updated `/app/_layout.tsx`:
   - Initialize notifications on app startup
   - Request notification permissions

5. Updated `/context/AlarmContext.tsx`:
   - `loadAlarms()` now reschedules all enabled alarms
   - `addAlarm()` schedules the new alarm if enabled
   - `updateAlarm()` reschedules or cancels based on enabled state
   - `deleteAlarm()` cancels the scheduled notification
   - `toggleAlarm()` schedules or cancels based on new state

**New dependencies:**
- `@notifee/react-native`

**Files created:**
- `services/alarmScheduler.ts`

**Files modified:**
- `services/index.ts`
- `app/_layout.tsx`
- `context/AlarmContext.tsx`

**How to verify:**
Run `npm start` and check:
- App requests notification permission on first launch
- Creating an enabled alarm schedules a notification
- Toggling alarm off cancels the notification
- Toggling alarm on schedules the notification
- Deleting an alarm cancels its notification
- Console shows scheduling/cancellation logs

---

## Phase 1 Complete (Tasks 1-18)

All 18 foundation tasks have been completed. The RiseAlarm app now has:

1. **UI Foundation:** Custom theme, Quicksand fonts, 3-tab navigation
2. **Alarms Screen:** List view, cards with toggle, delete button, edit functionality
3. **Create Screen:** Three audio creation paths (Record, Script, AI TTS with ElevenLabs)
4. **Templates Screen:** Browsable audio templates with category filter and playback
5. **Data Persistence:** AsyncStorage for alarms, file system for audio files
6. **Alarm Scheduling:** Notifee notifications with snooze support

---

### Task 25: Install and configure Superwall SDK
**Status:** Complete
**Date:** 2026-01-28

**Changes made:**
1. Installed `@superwall/react-native-superwall` package

2. Created `/config/superwall.ts`:
   - Placement IDs: `onboarding_complete`, `ai_voice_attempt`, `settings_upgrade`, `premium_template`
   - Product identifiers for Basic ($4.99) and Full ($9.99) monthly plans
   - `PLAN_FEATURES` mapping for feature gating
   - Helper functions: `canAccessFeature()`, `getProductId()`, `getPlanFromProduct()`

3. Created `/services/superwall.ts`:
   - `initializeSuperwall()` - initializes SDK with platform-specific API key
   - `RiseAlarmSuperwallDelegate` - custom delegate for handling Superwall events
   - `setUserAttributes()` - set user attributes for targeting
   - `setUserId()` / `resetUserIdentity()` - user identification
   - `registerPlacement()` - show paywalls for placements
   - `showOnboardingPaywall()`, `showAIVoicePaywall()`, `showSettingsPaywall()` - convenience functions
   - `checkSubscriptionStatus()` / `setSubscriptionStatus()` - subscription management
   - `addSubscriptionListener()` - subscribe to status changes
   - `getPresentationResult()` - check if paywall would show without presenting
   - `dismissPaywall()` - dismiss currently presented paywall
   - `getEntitlements()` - get user's active entitlements

4. Updated `/app.config.js`:
   - Added `superwallApiKeyIos` and `superwallApiKeyAndroid` to `extra`
   - Added `supabaseUrl` and `supabaseAnonKey` for future auth setup

5. Updated `/app/_layout.tsx`:
   - Added `initializeSuperwall()` call on app startup

6. Created `/.env.example`:
   - Template with placeholders for all API keys (ElevenLabs, Superwall, Supabase)

**New dependencies:**
- `@superwall/react-native-superwall`

**Files created:**
- `config/superwall.ts`
- `services/superwall.ts`
- `.env.example`

**Files modified:**
- `app.config.js`
- `app/_layout.tsx`
- `config/index.ts`
- `services/index.ts`

**Next steps:**
To use Superwall in production:
1. Create a Superwall account at superwall.com
2. Create an app and configure products (Basic/Full plans)
3. Create paywall templates in the dashboard
4. Add placements to campaigns
5. Copy API keys to `.env` file

---

### Task 26: Create paywall UI with Basic and Full plans
**Status:** Complete
**Date:** 2026-01-28

**Changes made:**
1. Created `/components/paywall/FeatureList.tsx`:
   - Reusable component for displaying feature lists
   - Green checkmark for included features
   - Gray X for excluded features
   - Support for highlighted features
   - Compact mode for use in plan cards

2. Created `/components/paywall/PlanCard.tsx`:
   - Individual plan card component
   - Animated press feedback (squish effect)
   - Badge support (e.g., "Best Value")
   - Configurable accent color
   - Loading state for button

3. Created `/app/paywall.tsx`:
   - Full paywall screen with two plan options
   - **Basic Plan ($4.99/month)**: Unlimited alarms, voice recording, script reading, audio templates
   - **Full Plan ($9.99/month)**: Everything in Basic + AI voices, unlimited AI generations, priority support
   - Full plan highlighted as "Best Value" with purple accent
   - Skip option to continue without subscribing
   - Restore Purchases link
   - Terms of Service and Privacy Policy links
   - Mock purchase flow for development/Expo Go

4. Updated `/app/_layout.tsx`:
   - Added paywall route to Stack navigator

5. Updated `/app/onboarding/index.tsx`:
   - Changed completion navigation to go to paywall instead of directly to tabs

**Files created:**
- `components/paywall/FeatureList.tsx`
- `components/paywall/PlanCard.tsx`
- `components/paywall/index.ts`
- `app/paywall.tsx`

**Files modified:**
- `app/_layout.tsx`
- `app/onboarding/index.tsx`

**How to verify:**
Run `npm start` and check:
- Complete onboarding to see paywall
- Two plan cards displayed (Full highlighted)
- Feature lists show checkmarks/X marks
- Buttons show loading state on press
- Skip navigates to main app
- Restore Purchases shows alert

---

### Task 27: Implement subscription state management
**Status:** Complete
**Date:** 2026-01-28

**Changes made:**
1. Created `/types/subscription.ts`:
   - `PlanType`: 'none' | 'basic' | 'full'
   - `SubscriptionStatus`: 'active' | 'expired' | 'cancelled' | 'grace_period' | 'none'
   - `Feature`: Feature identifiers for gating
   - `SubscriptionState`: Full subscription state interface
   - `FEATURE_ACCESS`: Mapping of plan to available features

2. Created `/context/SubscriptionContext.tsx`:
   - `SubscriptionProvider`: Context provider with reducer-based state
   - Persists subscription to AsyncStorage
   - Syncs with Superwall subscription status
   - Grace period handling (3 days after expiration)
   - `useSubscription()`: Full subscription context hook
   - `useCanUseFeature(feature)`: Check specific feature access
   - `useCanUseAIVoice()`: Quick check for AI voice access

3. Created `/hooks/useSubscription.ts`:
   - Re-exports hooks for convenient imports
   - Exports subscription types

4. Updated `/app/_layout.tsx`:
   - Wrapped app with `SubscriptionProvider`

**Subscription state includes:**
- `plan`: Current plan type
- `isSubscribed`: Whether user has active subscription
- `status`: Detailed subscription status
- `canUseAIVoice`: Quick access for AI voice feature
- `expirationDate`: When subscription expires
- `isLoading`: Loading state
- `lastSyncedAt`: Last sync timestamp

**Available actions:**
- `refreshSubscription()`: Sync with Superwall
- `handlePurchase(plan, productId)`: Process purchase
- `handleExpiration()`: Handle subscription expiration
- `canUseFeature(feature)`: Check feature access
- `clearSubscription()`: Clear for testing/logout

**Files created:**
- `types/subscription.ts`
- `context/SubscriptionContext.tsx`
- `hooks/useSubscription.ts`

**Files modified:**
- `app/_layout.tsx`

---

## Phase 2: Onboarding, Paywall & Authentication (Tasks 19-34)

### Task 19: Set up onboarding navigation flow
**Status:** Pending
**Estimated effort:** Medium

**Goal:**
Create the navigation infrastructure for onboarding screens that shows only on first app launch.

**Requirements:**
1. Detect first launch using AsyncStorage flag (`@rise_alarm/onboarding_complete`)
2. Create onboarding stack navigator with 5 screens
3. Root layout checks flag and shows either onboarding or main app
4. Smooth transitions between onboarding screens (horizontal slide)
5. Progress indicator (dots) at bottom of onboarding screens
6. Skip button option on non-critical screens

**Files to create:**
- `app/onboarding/_layout.tsx` - Onboarding stack navigator
- `app/onboarding/index.tsx` - Redirects to first screen
- `context/OnboardingContext.tsx` - Track onboarding state and progress
- `hooks/useFirstLaunch.ts` - Check/set first launch flag

**Files to modify:**
- `app/_layout.tsx` - Conditional rendering based on onboarding status

**Design notes:**
- Use full-screen layouts (no tab bar during onboarding)
- Consistent header style across all screens
- Animated transitions (fade + slide)
- Progress dots: filled = visited, outlined = upcoming

---

### Task 20: Build Welcome screen (intro + value proposition)
**Status:** Pending
**Estimated effort:** Medium

**Goal:**
Create an engaging welcome screen that introduces RiseAlarm and its core value proposition.

**Requirements:**
1. App logo/icon animation on entry
2. Welcoming headline: "Wake Up Inspired" or similar
3. 3-4 bullet points highlighting key benefits:
   - "Personalized wake-up messages"
   - "AI-generated motivational voices"
   - "Gentle, stress-free mornings"
   - "Custom recordings from your loved ones"
4. Beautiful illustration or gradient background
5. "Get Started" button to proceed
6. Subtle animation (floating elements, gentle pulse)

**Files to create:**
- `app/onboarding/welcome.tsx`
- `components/onboarding/WelcomeAnimation.tsx` (optional)

**Design notes:**
- Headspace-inspired: calm, friendly, approachable
- Use brand colors (cream background, orange accents)
- Large, readable typography
- Illustration style: soft, rounded, minimal

---

### Task 21: Build Feature Discovery screen (interactive demo)
**Status:** Pending
**Estimated effort:** High

**Goal:**
Interactive screen showcasing key features with mini-demos users can tap through.

**Requirements:**
1. Carousel or swipeable cards showing 3 features:
   - **Record Your Voice**: Show mic icon, brief description, mini waveform animation
   - **Read a Script**: Show script cards preview, tap to see script categories
   - **Audio Templates**: Show template cards, tap to hear a quick sample
2. Each card has:
   - Icon/illustration
   - Feature name
   - 1-2 sentence description
   - Interactive element (tap to demo)
3. "Try it" micro-interactions that don't require full setup
4. Continue button appears after viewing all features (or skip)

**Files to create:**
- `app/onboarding/features.tsx`
- `components/onboarding/FeatureCard.tsx`
- `components/onboarding/FeatureCarousel.tsx`

**Design notes:**
- Cards should feel tappable and interactive
- Use subtle haptic feedback on interactions
- Animations: card flip, icon bounce, waveform pulse
- Keep demos short (2-3 seconds max)

---

### Task 22: Build AI Voice Preview screen (try the voices)
**Status:** Pending
**Estimated effort:** High

**Goal:**
Let users experience the AI voices before committing. This is a key conversion moment.

**Requirements:**
1. Display all 4 AI voices (Nathaniel, Jessica, Milo, Jen) in a list
2. Each voice card shows:
   - Name and accent/style description
   - Play button to hear sample
   - Visual feedback when playing (waveform or pulse)
3. Pre-generated sample clips (not live API calls)
4. Highlight that this is a premium feature (subtle "Full Plan" badge)
5. "These voices will wake you up gently" messaging
6. Continue button to proceed

**Files to create:**
- `app/onboarding/voices.tsx`
- `components/onboarding/VoicePreviewCard.tsx`

**Assets needed:**
- Pre-recorded sample clips for each voice (already in assets/audio/voices/)

**Design notes:**
- Make this screen feel premium and special
- Purple accent color for AI voice section
- Smooth audio transitions between voice samples
- Only one voice plays at a time

---

### Task 23: Build Wake-up Styles screen (personalization)
**Status:** Pending
**Estimated effort:** Medium

**Goal:**
Help users identify their preferred wake-up style and show relevant content.

**Requirements:**
1. Question: "How do you like to wake up?"
2. 4 selectable style cards:
   - **Gentle & Calm**: "Ease into your day peacefully"
   - **Motivated & Energized**: "Start with purpose and drive"
   - **Mindful & Centered**: "Begin with clarity and focus"
   - **Fun & Playful**: "Wake up with a smile"
3. Users can select one (stored in AsyncStorage for personalization)
4. Brief explanation of how selection affects recommendations
5. "This helps us suggest the best sounds for you"
6. Continue button (selection optional but encouraged)

**Files to create:**
- `app/onboarding/styles.tsx`
- `components/onboarding/StyleCard.tsx`

**Files to modify:**
- `context/OnboardingContext.tsx` - Store selected style preference

**Design notes:**
- Each style card has distinct color/icon
- Selection animation (border highlight, checkmark)
- Cards arranged in 2x2 grid
- Gentle encouragement, not forced choice

---

### Task 24: Complete onboarding flow and transition
**Status:** Pending
**Estimated effort:** Medium

**Goal:**
Final onboarding screen that transitions to paywall, with proper state management.

**Requirements:**
1. Final screen with:
   - "You're all set!" or "Ready to Rise?" message
   - Summary of what they'll get
   - "Continue" button that goes to paywall
2. Mark onboarding as complete in AsyncStorage
3. Store user preferences (wake-up style) for personalization
4. Smooth transition animation to paywall
5. Handle back navigation (can go back through onboarding)
6. Analytics hooks for tracking completion rate (optional)

**Files to create:**
- `app/onboarding/complete.tsx`

**Files to modify:**
- `context/OnboardingContext.tsx` - Mark complete, store preferences
- `app/_layout.tsx` - Handle transition to paywall

**Design notes:**
- Celebratory but not over-the-top
- Clear call-to-action
- Reinforce value before showing prices

---

### Task 25: Install and configure Superwall SDK
**Status:** Pending
**Estimated effort:** Medium

**Goal:**
Set up Superwall for paywall management and A/B testing.

**Requirements:**
1. Install `@superwall/react-native-superwall`
2. Create Superwall account and app
3. Configure SDK in app entry point
4. Set up API keys (dev and prod)
5. Create placement identifiers for paywall triggers
6. Test SDK initialization and event logging

**Dependencies to install:**
- `@superwall/react-native-superwall`

**Files to create:**
- `services/superwall.ts` - Superwall configuration and helpers
- `config/superwall.ts` - Placement IDs and configuration

**Files to modify:**
- `app/_layout.tsx` - Initialize Superwall SDK
- `.env.example` - Add Superwall API key placeholder

**Superwall setup:**
1. Create app in Superwall dashboard
2. Define products: `basic_monthly` ($4.99), `full_monthly` ($9.99)
3. Create paywall template
4. Configure placement: `onboarding_complete`

---

### Task 26: Create paywall UI with Basic ($4.99) and Full ($9.99) plans
**Status:** Pending
**Estimated effort:** High

**Goal:**
Design and implement a compelling paywall with two subscription tiers.

**Requirements:**
1. Two plan options displayed clearly:
   - **Basic Plan - $4.99/month**:
     - ✓ Unlimited alarms
     - ✓ Voice recording
     - ✓ Script reading
     - ✓ All audio templates
     - ✗ AI-generated voices (shown as locked)
   - **Full Plan - $9.99/month** (recommended):
     - ✓ Everything in Basic
     - ✓ AI-generated voices (4 premium voices)
     - ✓ Unlimited AI generations
     - ✓ Priority support
2. Visual hierarchy emphasizing Full plan (larger, highlighted)
3. "Most Popular" or "Best Value" badge on Full plan
4. Clear pricing display with "/month" suffix
5. "Start Free Trial" or "Subscribe" button for each plan
6. Terms of service and privacy policy links
7. "Restore Purchases" link at bottom
8. Close/skip option (if allowed)

**Files to create:**
- `app/paywall.tsx` - Paywall screen
- `components/paywall/PlanCard.tsx` - Individual plan display
- `components/paywall/FeatureList.tsx` - Feature comparison

**Design notes:**
- Clean, trustworthy design
- Use green checkmarks, red X or gray for unavailable
- Highlight savings or value proposition
- Mobile-optimized layout

---

### Task 27: Implement subscription state management
**Status:** Pending
**Estimated effort:** High

**Goal:**
Create robust subscription state management that persists and syncs.

**Requirements:**
1. Create SubscriptionContext with:
   - `plan`: 'none' | 'basic' | 'full'
   - `isSubscribed`: boolean
   - `canUseAIVoice`: boolean (true only for 'full')
   - `expirationDate`: Date | null
   - `isLoading`: boolean
2. Persist subscription state locally (AsyncStorage)
3. Sync with Superwall subscription status
4. Handle subscription lifecycle events:
   - Purchase completed
   - Subscription renewed
   - Subscription expired
   - Subscription cancelled
5. Provide hooks: `useSubscription()`, `useCanUseFeature(feature)`
6. Grace period handling for expired subscriptions

**Files to create:**
- `context/SubscriptionContext.tsx`
- `hooks/useSubscription.ts`
- `types/subscription.ts`

**Files to modify:**
- `app/_layout.tsx` - Wrap with SubscriptionProvider
- `services/superwall.ts` - Add subscription status listeners

---

### Task 28: Gate AI Voice feature behind Full plan
**Status:** Pending
**Estimated effort:** Medium

**Goal:**
Restrict AI voice generation to Full plan subscribers while keeping the feature visible.

**Requirements:**
1. AI Voice page shows all voices and UI to all users
2. For Basic/Free users:
   - "Generate with [Voice]" button replaced with "Upgrade to Full Plan"
   - Tapping upgrade button shows paywall
   - Voice samples still playable (to entice upgrade)
   - Subtle "Full Plan Feature" badge on the page
3. For Full plan users:
   - Full functionality as implemented
   - No upgrade prompts
4. Handle edge cases:
   - Subscription expires mid-session
   - Network errors checking subscription

**Files to modify:**
- `app/(tabs)/create.tsx` - AITTSScreen component
- Add subscription check before generation

**Files to create:**
- `components/paywall/UpgradeButton.tsx` - Reusable upgrade prompt

**Design notes:**
- Don't hide the feature, make it desirable
- Upgrade button should be prominent but not annoying
- Show what they're missing, not just blocking

---

### Task 29: Add upgrade prompts and restore purchases
**Status:** Pending
**Estimated effort:** Medium

**Goal:**
Implement upgrade flows and purchase restoration for returning users.

**Requirements:**
1. Upgrade prompt component that can be shown from:
   - AI Voice page (when trying to generate)
   - Settings page (if we add one)
   - Programmatic triggers
2. Restore purchases functionality:
   - "Restore Purchases" button on paywall
   - Also accessible from settings
   - Shows loading state during restore
   - Success/failure feedback
3. Handle upgrade flow:
   - Basic → Full upgrade path
   - Show price difference or full price
4. Receipt validation (handled by Superwall)
5. Error handling for failed purchases

**Files to create:**
- `components/paywall/RestorePurchases.tsx`
- `components/paywall/UpgradePrompt.tsx`

**Files to modify:**
- `app/paywall.tsx` - Add restore functionality
- `services/superwall.ts` - Add restore and upgrade methods

---

### Task 30: Set up Supabase project and configuration
**Status:** Pending
**Estimated effort:** Medium

**Goal:**
Initialize Supabase backend for authentication and data storage.

**Requirements:**
1. Create Supabase project (or use existing)
2. Install `@supabase/supabase-js`
3. Configure Supabase client with:
   - Project URL
   - Anon key (public)
   - Proper TypeScript types
4. Set up environment variables
5. Test connection from app
6. Enable email authentication in Supabase dashboard

**Dependencies to install:**
- `@supabase/supabase-js`

**Files to create:**
- `services/supabase.ts` - Supabase client initialization
- `config/supabase.ts` - Configuration constants

**Files to modify:**
- `.env.example` - Add Supabase URL and key placeholders
- `app.config.js` - Add Supabase config to extra

**Supabase dashboard setup:**
1. Create new project
2. Enable Email auth provider
3. Configure email templates (optional)
4. Set up Row Level Security policies

---

### Task 31: Create database schema (users, subscriptions)
**Status:** Pending
**Estimated effort:** Medium

**Goal:**
Design and implement database schema for users and subscription data.

**Requirements:**
1. `profiles` table:
   - `id` (UUID, references auth.users)
   - `name` (text)
   - `email` (text)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)
   - `wake_up_style` (text, from onboarding)
2. `subscriptions` table:
   - `id` (UUID)
   - `user_id` (UUID, references profiles)
   - `plan` (text: 'basic' | 'full')
   - `status` (text: 'active' | 'cancelled' | 'expired')
   - `started_at` (timestamp)
   - `expires_at` (timestamp)
   - `superwall_subscription_id` (text, for reference)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)
3. Row Level Security:
   - Users can only read/update their own profile
   - Users can only read their own subscriptions
4. Database triggers:
   - Auto-create profile on user signup
   - Update `updated_at` on changes

**Files to create:**
- `supabase/migrations/001_create_profiles.sql`
- `supabase/migrations/002_create_subscriptions.sql`
- `types/database.ts` - TypeScript types for tables

---

### Task 32: Build sign-up screen (name, email, password)
**Status:** Pending
**Estimated effort:** Medium

**Goal:**
Create a clean sign-up flow that collects minimal user information.

**Requirements:**
1. Sign-up form with:
   - Name input (required)
   - Email input (required, validated)
   - Password input (required, min 8 chars)
   - Show/hide password toggle
2. Form validation:
   - Real-time validation feedback
   - Email format check
   - Password strength indicator (optional)
3. Submit button with loading state
4. Error handling:
   - Email already exists
   - Network errors
   - Invalid input
5. Success flow → redirect to main app
6. "Already have an account? Sign in" link
7. Terms acceptance checkbox (optional)

**Files to create:**
- `app/auth/signup.tsx`
- `app/auth/signin.tsx`
- `app/auth/_layout.tsx`
- `components/auth/AuthInput.tsx`
- `components/auth/PasswordInput.tsx`

**Design notes:**
- Keep it simple and fast
- Pre-fill email if available from paywall
- Friendly error messages
- Keyboard-aware layout

---

### Task 33: Implement auth state management and session persistence
**Status:** Pending
**Estimated effort:** High

**Goal:**
Create robust authentication state management with persistent sessions.

**Requirements:**
1. AuthContext with:
   - `user`: User | null
   - `session`: Session | null
   - `isLoading`: boolean
   - `isAuthenticated`: boolean
   - `signUp(name, email, password)`
   - `signIn(email, password)`
   - `signOut()`
   - `resetPassword(email)`
2. Session persistence using Supabase's built-in storage
3. Auto-refresh tokens before expiration
4. Handle auth state changes:
   - Sign in → fetch profile, sync subscription
   - Sign out → clear local data, reset state
   - Token refresh → seamless, no user action
5. Protected route handling
6. Deep link handling for email verification (optional)

**Files to create:**
- `context/AuthContext.tsx`
- `hooks/useAuth.ts`

**Files to modify:**
- `app/_layout.tsx` - Wrap with AuthProvider, handle auth state
- `services/supabase.ts` - Add auth helper functions

---

### Task 34: Connect subscription data to user accounts
**Status:** Pending
**Estimated effort:** High

**Goal:**
Link subscription purchases to user accounts for cross-device sync.

**Requirements:**
1. On successful purchase:
   - Create/update subscription record in Supabase
   - Link to authenticated user
   - Store Superwall subscription ID
2. On app launch (authenticated user):
   - Fetch subscription from Supabase
   - Reconcile with Superwall status
   - Handle conflicts (local vs server)
3. On sign-in on new device:
   - Fetch user's subscription from Supabase
   - Restore access to paid features
   - Sync with local Superwall state
4. Subscription status webhook (optional):
   - Supabase Edge Function to receive Superwall webhooks
   - Update subscription status in database
5. Handle edge cases:
   - User purchases before signing up
   - Subscription transfers between accounts

**Files to modify:**
- `context/SubscriptionContext.tsx` - Add Supabase sync
- `context/AuthContext.tsx` - Fetch subscription on sign-in
- `services/superwall.ts` - Add user ID to purchases

**Files to create:**
- `services/subscriptionSync.ts` - Sync logic between Superwall and Supabase
- `supabase/functions/subscription-webhook/index.ts` (optional)

---

## Implementation Order

**Recommended sequence:**
1. Tasks 19-24 (Onboarding) - Can be tested independently
2. Tasks 30-31 (Supabase setup) - Backend foundation
3. Tasks 25-27 (Superwall + subscription state) - Paywall core
4. Tasks 32-33 (Auth) - User accounts
5. Tasks 28-29 (Feature gating) - Connect paywall to features
6. Task 34 (Sync) - Final integration

**Why this order:**
- Onboarding can be built and tested without backend
- Supabase setup is needed before auth
- Superwall can work without auth initially (anonymous users)
- Auth builds on Supabase
- Feature gating needs subscription state
- Sync is the final piece connecting everything
