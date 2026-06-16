# Alchemist's Crucible: Design & Technical Pitch

## Overview
* **Genre**: Elemental Crafting Deck-Builder
* **Visuals**: Mystical wood/gold background, interactive card elements with floating particles, animated bubbling glass crucible, smooth drag physics.

## Core Loops
1. **Draw Phase**: Draw 5 cards per turn representing basic elements (Fire, Water, Earth, Air).
2. **Synthesis**: Drag cards into the central "Crucible" to combine them (e.g., Fire + Earth = Lava; Water + Air = Mist).
3. **Defense & Crafting**: Use created compounds to feed the cauldron, unlock magical recipes, and defend against incoming "entropy" events that freeze or scorch cards.

## User Interface & Controls
* **Controls**: Drag-and-drop card interaction.
* **Layout**: Cards sit at the bottom in a radial hand. Center is the glowing Crucible. Left side shows recipe book unlocked states. Right side shows active entropy level.

## Technical Stack
* HTML5 Drag and Drop API
* CSS 3D card flipping
* Canvas particle system for combining reactions
