---
title: T2 Requirements
---

**Focus:** Complete synthesis and DRC pass for ASIC fabrication
**Reward:** ASIC Shuttle Slot

To submit for T2, your repo should have:

- **A synthesis report** — `.rpt`, `.txt`, or `.log`, with the filename containing `synth`
- **A DRC pass report** — `.rpt`, `.txt`, or `.log`, with the filename containing `drc`
- **GDSII (or equivalent)** — `.gds`, `.gds2`, or `.gdsii`
- **A `README.md`** explaining your design decisions

## A note on the automatic scan

The synthesis and DRC report checks look for a keyword in the filename (`synth` / `drc`), since the file extensions alone (`.rpt`/`.txt`/`.log`) are too generic to tell them apart. If your report is named something that doesn't include that keyword, the scan may say "not detected" even though the file is genuinely there — this won't stop you from submitting, just double check the reviewer will be able to tell which file is which.