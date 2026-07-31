---
title: T3 Requirements
---

**Focus:** Design a custom PCB to carry your ASIC
**Reward:** PCB Fab & Test Components

To submit for T3, your repo should have:

- **KiCad source files** - `.kicad_pro`, `.kicad_sch`, and `.kicad_pcb`
- **A Bill of Materials** - `.csv`, with the filename containing `bom`, including a total cost
- **Gerbers** - `.gbr`, `.gtl`, `.gbl`, `.gto`, `.gbs`, `.gts`, or `.drl`
- **A `README.md`** explaining your design decisions

## A note on the automatic scan

The BOM check looks for `bom` somewhere in the filename, since `.csv` alone is too generic. If your BOM is named something else, the scan may miss it — that's fine, submit anyway, just make sure it's easy for a reviewer to find.