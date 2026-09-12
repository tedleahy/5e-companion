# 5e Companion - Product Doc

## Purpose

To assist players and DMs when they're playing Dungeons & Dragons 5th Edition; it should allow them to browse and interact with all the resources they need to know about while playing a session.

## Core value proposition

When playing D&D, often the information players need is spread across multiple physical sources - character sheets, spell cards, source books, online resources, etc. This app will centralise all that info into one place, providing a UI for players and DMs to access it quickly and easily.

## Proposed stack

- Rails REST API, postgres DB
- React Native frontend (web, android, iOS)
- Web frontend auto-deployed on pushes to main with cloudflare pages
- Backend hosted on a VPS; auto-deployed on pushes to main via github actions

## Target users

### Primary users
Players in a D&D campaign who need quick access to their character, spells, equipment, and available actions during a session.

### Secondary users
DMs who need to review party information, manage initiative, and reference NPCs during play.

## Product principles

- Optimise for use during play, not just preparation.
- Common information should be reachable in a few seconds.
- Designed to be used on mobile, tablet and desktop.
- Minimise typing and unnecessary interaction during a session.
- Dense information is acceptable, but it must be scannable, and easy to navigate.
- Should work both online (MVP) and offline (post-MVP)

## Core journeys

### Player journeys

1. Sign up and log in with email and password (MVP)

2. Create character (MVP)

3. During play, quickly inspect and update the current state of a character - HP, spell slots, conditions, resources, equipment, abilities, etc. (MVP)

4. Manage/edit a character - edit persistent character info outside or during a session (MVP)

5. Browse and search game content content like spells, classes, subclasses, races, equipment, etc. (MVP)
	1. Display SRD content (non-editable/deletable)
	2. Add ability to create, edit, and delete homebrew/custom content

6. Level up characters - interactive wizard that guides users through the different choices they have to make

### DM journeys

1. Create campaign

2. Add players to campaign

3. Live view of players & their stats for a campaign

4. Manage combat order

5. Manage NPCs

## MVP (player journeys)

1. Sign up and log in with email and password

2. Create character

3. During play, quickly inspect and update the current state of a character - HP, spell slots, conditions, resources, equipment, abilities, etc.

4. Edit character sheet

5. Browse and search game content content like spells, classes, subclasses, races, equipment, etc.
	1. Display SRD content (non-editable/deletable)
	2. Add ability to create, edit, and delete homebrew/custom content
