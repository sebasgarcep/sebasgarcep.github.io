---
id: rom-translation-part-2
title: Translating a Retro Game (Part 2)
subtitle: It was hard...
date: 2026-04-16
tags: [Assembly, ROM Hacking]
draft: true
latex: false
---

- Talk about how translating the menu caused the game to crash
  - Talk about the menu text pointer being hardcoded
  - Talk about identifying a large empty contiguous block
  - Talk about updating the menu pointer and the game crashing

- Handroll assembly to use lookup table for text
- We can now support arbitrarily long-text (in theory)
  - But text is still cut off

- Talk about text being dispersed all through the ROM, even in-between code segments
- Talk about the fact that there are redirects to the strings, but they don't seem to be packed in a concrete order. For example, some string pointers were 6 bytes apart one time, then 10 bytes apart, hinting that the data structure I was looking at wasn't a lookup table, or it was something more complex than I could handle right now.

- Invite the reader to work on this project themselves if their interest is piqued and they have the means/time
