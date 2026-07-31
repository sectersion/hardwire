// Scans a GitHub repo's file tree and buckets files into the categories
// each tier requires. Extension-only categories are reliable; filename-heuristic
// categories (marked below) can miss unconventionally-named files.

interface ScannedFile {
  path: string
  url: string // github blob URL, viewable directly
}

type Category = string

const GITHUB_API = "https://api.github.com"

function parseGithubUrl(repoUrl: string): { owner: string; repo: string } | null {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/.]+)/)
  if (!match) return null
  return { owner: match[1], repo: match[2] }
}

async function githubFetch(path: string) {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" }
  // Add a GITHUB_TOKEN to your .env for higher rate limits (60/hr unauthenticated
  // vs 5000/hr authenticated) — worth doing once more than a couple people use this.
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  const res = await fetch(`${GITHUB_API}${path}`, { headers })
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  return res.json()
}

async function getDefaultBranch(owner: string, repo: string): Promise<string> {
  const data = await githubFetch(`/repos/${owner}/${repo}`)
  return data.default_branch
}

async function getRepoTree(owner: string, repo: string, branch: string) {
  const data = await githubFetch(`/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`)
  return (data.tree ?? []).filter((f: any) => f.type === "blob") as { path: string }[]
}

// Extension-only match: reliable, no ambiguity.
function matchExt(path: string, extensions: string[]) {
  const lower = path.toLowerCase()
  return extensions.some((ext) => lower.endsWith(ext))
}

// Extension + filename heuristic: use when extension alone is ambiguous
// (e.g. testbench vs design are both .v files).
function matchExtAndName(path: string, extensions: string[], nameHints: string[]) {
  const lower = path.toLowerCase()
  if (!extensions.some((ext) => lower.endsWith(ext))) return false
  return nameHints.some((hint) => lower.includes(hint))
}

type CategoryRule = { key: string; test: (path: string) => boolean; heuristic: boolean }

const RULES: Record<string, CategoryRule[]> = {
  T1: [
    {
      key: "rtl",
      test: (p) =>
        matchExt(p, [".v", ".sv", ".vhd", ".vhdl"]) &&
        !matchExtAndName(p, [".v", ".sv", ".vhd", ".vhdl"], ["tb", "test", "testbench"]),
      heuristic: true,
    },
    {
      key: "testbench",
      test: (p) => matchExtAndName(p, [".v", ".sv", ".vhd", ".vhdl"], ["tb", "test", "testbench"]),
      heuristic: true,
    },
    {
      key: "simulation",
      test: (p) => matchExt(p, [".vcd", ".fst", ".ghw", ".wlf"]),
      heuristic: false,
    },
  ],
  T2: [
    { key: "synthesis_report", test: (p) => matchExtAndName(p, [".rpt", ".txt", ".log"], ["synth"]), heuristic: true },
    { key: "drc_report", test: (p) => matchExtAndName(p, [".rpt", ".txt", ".log"], ["drc"]), heuristic: true },
    { key: "gds", test: (p) => matchExt(p, [".gds", ".gds2", ".gdsii"]), heuristic: false },
  ],
  T3: [
    { key: "kicad_source", test: (p) => matchExt(p, [".kicad_pro", ".kicad_sch", ".kicad_pcb"]), heuristic: false },
    { key: "bom", test: (p) => matchExtAndName(p, [".csv"], ["bom"]), heuristic: true },
    {
      key: "gerbers",
      test: (p) => matchExt(p, [".gbr", ".gtl", ".gbl", ".gto", ".gbs", ".gts", ".drl"]),
      heuristic: false,
    },
  ],
}

export async function scanRepoForTier(repoUrl: string, tier: string) {
  const parsed = parseGithubUrl(repoUrl)
  if (!parsed) throw new Error("Couldn't parse GitHub URL. Make sure it's a full github.com repo link.")

  const branch = await getDefaultBranch(parsed.owner, parsed.repo)
  const files = await getRepoTree(parsed.owner, parsed.repo, branch)

  const rules = RULES[tier] ?? []
  const result: Record<Category, ScannedFile[]> = {}

  for (const rule of rules) {
    result[rule.key] = files
      .filter((f) => rule.test(f.path))
      .map((f) => ({
        path: f.path,
        url: `https://github.com/${parsed.owner}/${parsed.repo}/blob/${branch}/${f.path}`,
      }))
  }

  // README check, every tier — this is where design decisions should actually
  // live, per how the program's docs describe a good submission.
  const readme = files.find((f) => /^readme\.md$/i.test(f.path))
  result.readme = readme
    ? [{ path: readme.path, url: `https://github.com/${parsed.owner}/${parsed.repo}/blob/${branch}/${readme.path}` }]
    : []

  return result
}