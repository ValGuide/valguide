---
name: spotify-player-reference
description: Reference how Spotify structures player UI/UX. Use when designing, reviewing, or comparing ValGuide player, Now Playing, queue, transcript, or tour-stop playback experiences.
---

# Spotify Player Reference

Use this skill when the useful design question is: **how does Spotify do it?**

Read the full reference page first:

- `docs/research/reference/spotify-player.md`

## Official Screenshots

- Desktop Web Player: https://webplayer.byspotify.com/images/gif1.gif
- Your Library: https://webplayer.byspotify.com/images/ylx.gif
- Now Playing View: https://webplayer.byspotify.com/images/NPV.gif
- Mini player: https://webplayer.byspotify.com/images/media1.png
- Compact rows: https://webplayer.byspotify.com/images/compact.png

Primary sources:

- https://webplayer.byspotify.com/
- https://support.spotify.com/us/article/now-playing/
- https://open.spotify.com/

## What To Compare

1. Persistent playback: the current item and controls survive browsing.
2. Stable desktop zones: navigation/library, content canvas, and Now Playing context.
3. Bottom transport: title, play/pause, skip, progress, queue, output, and volume stay predictable.
4. Context next to controls: Now Playing explains the content instead of only duplicating transport actions.
5. Recoverability: current playback is visible in the player, lists, queue, and context panel.
6. Density modes: rich artwork-led views coexist with compact rows for scanning.

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

## Review Prompt

When reviewing player work, answer:

- Does playback remain persistent while the visitor browses?
- Can the visitor always identify what is playing?
- Can the visitor recover the active stop in one action?
- Are primary controls more prominent than secondary actions?
- Does the Now Playing surface add context, not only controls?
