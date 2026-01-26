# App Functionality & Logic

## 1. Initial Launch & Onboarding
- **App Description:** This is an alarm clock app to be built with ReactNative (with iOS+Android support) that focuses on custom audio experiences—specifically user recordings, AI-generated motivational speeches, and curated templates—to wake users up with intention.
- **Permission Requests:** On first launch, request necessary permissions for the app.

## 2. Home Screen (Alarm List)
- **Display:** A vertical list of set alarms (time, label, and toggle switch).
- **Toggle:** Enable/Disable alarm logic.
- **Delete:** Swipe-to-delete functionality similar to the native iOS clock.
- **Background Safety:** Whenever an alarm is toggled ON, the app schedules a "Safety Notification" (30s max) via Notifee as a backup in case the app is force-closed.

## 3. Create Page (Custom Audio Generation)
Users have three paths to generate an alarm sound:
- **Path A: Manual Recording:**
  - Standard Mic interface (Start/Stop/Preview).
  - Post-recording: File is saved in the appropriate place for the app.
- **Path B: Script Reading:**
  - App displays a scrollable list of short "Motivation Scripts."
  - User records themselves reading the script (using Path A logic).
- **Path C: AI Character TTS (Text-to-Speech):**
  - User inputs text. 
  - **Selector:** Gender (Man/Woman) and Temperature (Calm, Neutral, Motivating).
  - *Note:* This will require an integration with a TTS API (like ElevenLabs or OpenAI TTS) to generate and download the `.mp3`.

## 4. Templates Page (Audio Library)
- **Categorization:** Two sections: "Sounds" (Ambiance) and "Speech" (Pre-recorded clips).
- **Preview:** Tap to play/pause the audio.
- **Speech Customization:** For "Speech" items, users can toggle the "Voice Model" (Man/Woman/Temperature) which triggers a re-fetch or local processing of that audio file.
- **Selection:** "Set as Alarm" button which takes the user to the time-picker screen.

## 5. Alarm Logic
Custom set-up based in accordance with iOS and Android specifications.
