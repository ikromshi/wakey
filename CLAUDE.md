# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RiseAlarm is a React Native alarm clock app (iOS + Android) focused on custom audio experiences—user recordings, AI-generated motivational speeches, and curated audio templates.

**Current Status:** Pre-development (planning/design phase). Expo project initialized.

## Planned Architecture

### Core Features
- **Home Screen:** Alarm list with toggle, swipe-to-delete, safety notifications via Notifee
- **Create Page:** Three audio generation paths:
  - Manual recording (mic interface)
  - Script reading (user records from prompts)
  - AI TTS (text input with gender/temperature selection, uses ElevenLabs or OpenAI TTS API)
- **Templates Page:** Categorized audio library (Sounds/Speech) with preview and voice customization

### Navigation
3-tab bottom bar: Alarms (clock), Create (mic), Templates (library)

### Key Dependencies (Planned)
- React Native (iOS + Android)
- TTS API (ElevenLabs or OpenAI) for AI voice generation
- react-native-reanimated (animations)
- other dependencies as the project progresses

## Design Guidelines

- **Aesthetic:** Soft, rounded, approachable—avoid sharp corners and high-contrast blacks
- **Typography:** Rounded Sans-Serif (Quicksand or Varela Round)
- **Colors:**
  - Background: `#FFF9F2` (soft cream)
  - Primary accent: `#FF9F43` (muted orange)
  - Secondary accent: `#74B9FF` (sky blue)
  - Text: `#4A4A4A` (soft charcoal)
- **Interactions:** Squish effect (scale 0.97) on button press; pulsing record button when active
