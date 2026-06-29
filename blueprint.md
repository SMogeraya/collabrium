# Project Blueprint

## Overview

This document outlines the project structure, features, and implementation details for "Collabrium," an AI-powered real-time communication and personal organization tool.

## Current Features

### RemNote

- **Note Keeper:** A section to add, view, edit, and delete personal notes, with data stored in a Firestore collection. Each note has a title and a description.
- **Chat Reminders:** A section to display reminders extracted from chat messages.
- **Add to Reminder:** A feature to add a reminder from a chat message containing a date.
- **Delete Reminder:** A feature to delete a reminder from the RemNote page.
- **Edit Reminder:** A feature to edit a reminder's text and date.

### General

- **Real-time Chat:** One-on-one and group chat functionalities.
- **AI-Powered Translations:** In-chat translation of messages to various languages.
- **AI-Powered Formalizer:** An option to rephrase messages in a more formal tone.

## Planned Features

### Knowledge Canvas

A freeform, collaborative digital whiteboard for brainstorming, mind-mapping, and organizing ideas visually.

**Implementation Plan:**

- **Phase 1: Basic Canvas Implementation (Complete)**
    - Install the `tldraw` library.
    - Create a new page component `src/pages/KnowledgeCanvas/index.jsx`.
    - Add a new route and a navigation link for the "Knowledge Canvas" in the main `Dashboard` component.
    - Implement a simple, non-collaborative `tldraw` canvas on the new page.

- **Phase 2: URL-Based Navigation & Chat Integration**
    - **Integrate `react-router-dom`:** Upgrade the dashboard's navigation to support dynamic URLs.
    - **Create Per-Chat Canvases:** Establish a `canvases` collection in Firestore where each document corresponds to a chat ID.
    - **Add Canvas Button to Chat:** Place a button in the chat header to navigate to the specific canvas for that chat (`/canvas/:chatId`).

- **Phase 3: Real-Time Collaboration & Sharing**
    - **Connect to Firestore:** Update the `KnowledgeCanvas` component to read the `chatId` from the URL and sync its state with the corresponding Firestore document in real-time.
    - **Implement Sharing:** Add a "Share" button to the canvas that opens a modal, allowing the user to select other chats and grant them access by sending a link and updating Firestore permissions.

- **Phase 4: Custom "Collabrium" Elements**
    - Design and create custom shapes/cards that match the project's "Bold" aesthetic for representing items like chat messages or notes.

- **Phase 5: Drag-and-Drop Integration**
    - Implement functionality to drag messages from `ChatHistory` and notes from `RemNote` onto the canvas.
