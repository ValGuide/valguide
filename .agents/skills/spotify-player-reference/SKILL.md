---
name: spotify-player-reference
description: Reference how Spotify structures player UI/UX. Use when designing, reviewing, or comparing ValGuide player, Now Playing, queue, transcript, or tour-stop playback experiences.
---

# Spotify Player Reference

Use this skill when the useful design question is: **how does Spotify do it?**

Use this reference when designing or reviewing ValGuide player experiences. The useful comparison is how Spotify makes playback feel persistent, predictable, and easy to recover from while the listener moves through content.

## Sources and Screenshots

Spotify's own product copy describes the Web Player as a single platform for music, podcasts, audiobooks, video, and creator context. Its official Web Player case study is the best source for current screenshots of the desktop player, Your Library, Now Playing View, mini player, and compact list rows.

Primary sources:

- Spotify Desktop Web Player case study: https://webplayer.byspotify.com/
- Spotify Now Playing support article: https://support.spotify.com/us/article/now-playing/
- Spotify Web Player: https://open.spotify.com/

Official screenshot assets:

- Desktop Web Player: https://webplayer.byspotify.com/images/gif1.gif
- Your Library: https://webplayer.byspotify.com/images/ylx.gif
- Now Playing View: https://webplayer.byspotify.com/images/NPV.gif
- Mini player: https://webplayer.byspotify.com/images/media1.png
- Compact rows: https://webplayer.byspotify.com/images/compact.png

## What Spotify Optimizes For

### Persistent Playback

Playback is treated as application-level state, not page-level state. The current item, transport controls, timeline, volume, queue, and device output remain available while the listener browses, searches, opens lists, or inspects creator context.

For ValGuide, the audio player should survive route changes and content browsing. A visitor should be able to inspect the stop list, open a transcript, switch language, or browse related stops without losing the sense of what is playing.

### Stable Desktop Zones

Spotify's desktop player uses a stable three-zone model:

| Zone | Spotify role | ValGuide analogue |
| --- | --- | --- |
| Left rail | Library, saved content, navigation, filters | Tour stops, saved or recent tours, language/context navigation |
| Center canvas | Current browsing surface: playlist, album, search, home | Current tour stop, transcript, media, maps, related content |
| Right panel | Now Playing View with artwork, creator context, merch, events | Now Playing stop context, artwork, location details, curator notes, related media |

The important pattern is that browsing and playback are separate but coordinated. The center can change without collapsing the Now Playing context or moving the transport controls.

### Bottom Transport Bar

Spotify keeps the transport bar in the most stable location on desktop. The bar gives constant access to:

- current item identity
- play/pause, previous, next
- progress and duration
- queue
- output/device control
- volume
- secondary actions such as save or share

For ValGuide, use the same hierarchy: title and stop identity first, primary transport second, then lower-frequency controls. Avoid hiding core playback actions inside menus.

### Now Playing as Context

Spotify's support article frames Now Playing as the place to control what plays, while the Web Player case study expands it into a creator-context panel: cover artwork, save/share, artist or producer details, concerts, merch, and related media.

For ValGuide, the Now Playing panel should explain the stop while audio plays. Useful content includes hero image, stop title, chapter or segment context, transcript access, map and location cues, related objects, credits, and share/save actions.

### Recoverability

Spotify makes it hard to get lost because the active playback object is visible in multiple places: bottom bar, highlighted current row, Now Playing panel, and queue. The user can browse away from the source list and still recover the current item.

For ValGuide, show the active stop in the stop list and keep a direct "back to current stop" affordance when the visitor has navigated elsewhere.

### Density Modes

Spotify supports richer artwork-led surfaces and compact rows. Compact mode matters because repeat listeners and power users scan by title, artist, duration, and state rather than by large thumbnails.

For ValGuide, support both modes where the context requires it:

- immersive mode for first-time listening and exhibit storytelling
- compact mode for stop lists, transcript navigation, admin review, or quick resumption

## Interaction Patterns to Borrow

### Controls Are Predictable

The play/pause control stays visually dominant. Secondary controls keep standard positions. This helps users operate the player without re-learning controls on every surface.

ValGuide should keep play/pause, skip, progress, and speed controls consistent across stop detail, tour overview, mini player, and lock-screen-style surfaces.

### Browsing Does Not Interrupt Listening

Spotify's library filters, search, queue, and Now Playing panel let listeners explore while playback continues. The interaction model assumes that exploration is part of listening, not a separate mode.

ValGuide should let visitors browse stop details, maps, images, and related tours without stopping playback or resetting progress.

### Creator or Content Context Is Adjacent

Spotify avoids making the user open a separate page to answer "what is this?" The Now Playing panel gives adjacent context, then links out to deeper pages.

ValGuide should answer "what am I hearing?" adjacent to playback: object title, location, short description, image, transcript, and next stop.

### Session Controls Are Environment-Aware

Spotify Connect and volume controls acknowledge that playback may move across devices. Even if ValGuide does not need Spotify Connect-level complexity, it should respect the user's listening environment: browser audio state, mute, captions/transcripts, and offline or low-connectivity fallbacks.

## ValGuide Translation

When applying this reference to ValGuide, preserve:

- active stop identity across route changes
- a clear way back to the currently playing stop
- highlighted current stop in lists
- transcript, language, captions, speed, and progress as first-class controls
- contextual stop details adjacent to playback

Adapt for museum behavior:

- visitors may be walking, sharing devices, or under poor connectivity
- location and object context often matter more than catalog breadth
- controls need to be legible under short, interrupted sessions

## Design Checklist

- Keep playback state persistent across route changes.
- Always expose the active stop title, tour title, progress, and primary transport.
- Separate browsing surfaces from the player shell.
- Offer a Now Playing panel that carries context, not only controls.
- Highlight the currently playing stop in lists.
- Provide a clear way back to the active stop.
- Use compact rows where users need to scan many stops.
- Keep secondary actions available but visually quieter than play/pause.
- Treat transcript, captions, language, and speed as first-class listening controls.
- Preserve playback state when opening media, maps, or related content.

## Do Not Copy Blindly

Spotify is optimized for large catalogs, personalization, and repeat daily use. ValGuide is often used in a physical place, with visitors walking, sharing devices, and needing location context. Borrow the persistence, recoverability, and control hierarchy; adapt the density, labeling, and context panel to museum and tour behavior.

## Review Prompt

When reviewing player work, answer:

- Does playback remain persistent while the visitor browses?
- Can the visitor always identify what is playing?
- Can the visitor recover the active stop in one action?
- Are primary controls more prominent than secondary actions?
- Does the Now Playing surface add context, not only controls?
