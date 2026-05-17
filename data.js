// =========================================================================
// SIGNAL — data.js
// Behavioral Entropy Model · seeded data generation
// Generates 248 employees across 16 teams in 5 departments.
// Deterministic via seeded RNG (seed: 42).
//
// New in v3: Manager Relationship Entropy (mre) per employee.
//   Low mre  = healthy manager dynamic (low friction)
//   High mre = high friction with manager style / approach
//   Managers themselves: mre = null
// =========================================================================

// ---------- Seeded RNG ----------
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(42);
function r() { return rng(); }
function rNorm(mean, sd) {
  const u = 1 - r(), v = r();
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }

// ---------- Names, Roles, Departments ----------
const FIRST_NAMES = ["Aanya","Aarav","Aditi","Ananya","Arjun","Avani","Bhavya","Chetan","Dev","Diya","Esha","Farhan","Gaurav","Harini","Isha","Jay","Kabir","Kavya","Khushi","Lavanya","Manav","Meera","Nikhil","Nisha","Ojas","Pari","Pranav","Priya","Rahul","Rhea","Riya","Rohit","Sameer","Sanya","Shaurya","Siddharth","Tanvi","Tara","Uday","Varun","Vihaan","Yash","Aiden","Ben","Clara","Daniel","Eva","Felix","Grace","Henry","Iris","James","Kate","Leo","Mia","Noah","Olivia","Paul","Quinn","Ravi","Sara","Theo","Uma","Vera","Will","Xena","Yara","Zane","Amara","Bilal","Camila","Dimitri","Elena","Faisal","Gia","Haruki","Imani","Junko","Kenji","Lila","Mateo","Nadia","Omar","Petra","Qadir","Ravenna","Soren","Tomas","Ulrika","Viktor","Wren","Xiomara","Yusuf","Zara"];

const LAST_NAMES = ["Sharma","Mehta","Kapoor","Iyer","Reddy","Nair","Khan","Singh","Joshi","Bhatia","Pillai","Verma","Rao","Patel","Das","Bose","Chen","Park","Wilson","Garcia","Smith","Johnson","Brown","Davis","Miller","Anderson","Taylor","Lopez","Martinez","Lee","Walker","Hall","Young","King","Wright","Hill","Scott","Green","Adams","Baker","Nakamura","Ahmed","Petrov","Müller","O'Brien","Costa","Moreau","Yamamoto","Abebe","Khoury"];

const ROLES = {
  "Engineering": ["Software Engineer","Senior SWE","Staff Engineer","Engineering Manager","SRE","Frontend Engineer","Backend Engineer","ML Engineer","QA Engineer","DevOps"],
  "Product":     ["Product Manager","Senior PM","Product Lead","UX Researcher","Product Analyst"],
  "Design":      ["Product Designer","Senior Designer","Design Lead","Brand Designer","Motion Designer"],
  "Operations":  ["Ops Analyst","Ops Manager","Program Manager","BizOps Lead","Workflow Specialist"],
  "Customer":    ["CS Manager","Account Executive","Solutions Engineer","Support Lead","CSM Lead"]
};
const DEPTS = Object.keys(ROLES);

function pickName() {
  return FIRST_NAMES[Math.floor(r() * FIRST_NAMES.length)] + " " + LAST_NAMES[Math.floor(r() * LAST_NAMES.length)];
}

// ---------- Team Plan ----------
// scenario drives the behavioral fingerprint distribution.
// syntropy = count of Syntropy Triggers seeded into the team.
const TEAM_PLAN = [
  { dept: "Engineering", team: "Platform",        size: 22, scenario: "healthy",       syntropy: 1 },
  { dept: "Engineering", team: "Mobile",          size: 18, scenario: "healthy",       syntropy: 0 },
  { dept: "Engineering", team: "Data Infra",      size: 16, scenario: "healthy",       syntropy: 1 },
  { dept: "Engineering", team: "Growth Eng",      size: 14, scenario: "ecg",           syntropy: 0 },
  { dept: "Engineering", team: "ML Systems",      size: 12, scenario: "plateau",       syntropy: 0 },
  { dept: "Product",     team: "Core Product",    size: 14, scenario: "healthy",       syntropy: 1 },
  { dept: "Product",     team: "Growth Product",  size: 16, scenario: "manager_drift", syntropy: 0 },
  { dept: "Product",     team: "Platform PM",     size: 10, scenario: "healthy",       syntropy: 0 },
  { dept: "Design",      team: "Product Design",  size: 12, scenario: "healthy",       syntropy: 1 },
  { dept: "Design",      team: "Brand & Motion",  size: 8,  scenario: "ecg",           syntropy: 0 },
  { dept: "Operations",  team: "BizOps",          size: 14, scenario: "systemic",      syntropy: 0 },
  { dept: "Operations",  team: "Workflow Ops",    size: 16, scenario: "systemic",      syntropy: 0 },
  { dept: "Operations",  team: "Program Mgmt",    size: 14, scenario: "systemic",      syntropy: 0 },
  { dept: "Customer",    team: "Enterprise CS",   size: 18, scenario: "healthy",       syntropy: 2 },
  { dept: "Customer",    team: "SMB CS",          size: 16, scenario: "plateau",       syntropy: 0 },
  { dept: "Customer",    team: "Solutions",       size: 12, scenario: "healthy",       syntropy: 0 }
];

// ---------- Fingerprint generation per scenario ----------
function fingerprintForScenario(scenario, isSyntropy) {
  let thermal, orbital, resonance, transfer, dvel;
  switch (scenario) {
    case "healthy":
      thermal = clamp(rNorm(0.74, 0.10), 0.4, 1);
      orbital = clamp(rNorm(0.72, 0.12), 0.35, 1);
      resonance = clamp(rNorm(0.78, 0.10), 0.4, 1);
      transfer = clamp(rNorm(0.70, 0.14), 0.3, 1);
      dvel = rNorm(0.05, 0.10);
      break;
    case "manager_drift":
      thermal = clamp(rNorm(0.50, 0.08), 0.2, 0.8);
      orbital = clamp(rNorm(0.42, 0.08), 0.15, 0.7);
      resonance = clamp(rNorm(0.55, 0.10), 0.3, 0.85);
      transfer = clamp(rNorm(0.40, 0.10), 0.1, 0.7);
      dvel = rNorm(-0.45, 0.08);
      break;
    case "systemic":
      thermal = clamp(rNorm(0.55, 0.14), 0.2, 0.85);
      orbital = clamp(rNorm(0.50, 0.14), 0.2, 0.85);
      resonance = clamp(rNorm(0.45, 0.16), 0.15, 0.85);
      transfer = clamp(rNorm(0.48, 0.16), 0.15, 0.85);
      dvel = rNorm(-0.30, 0.14);
      break;
    case "ecg":
      thermal = clamp(rNorm(0.62, 0.18), 0.25, 0.95);
      orbital = clamp(rNorm(0.65, 0.16), 0.3, 0.95);
      resonance = clamp(rNorm(0.70, 0.16), 0.3, 0.95);
      transfer = clamp(rNorm(0.55, 0.18), 0.2, 0.95);
      dvel = rNorm(0.0, 0.30);
      break;
    default: // plateau
      thermal = clamp(rNorm(0.58, 0.06), 0.4, 0.75);
      orbital = clamp(rNorm(0.55, 0.06), 0.4, 0.7);
      resonance = clamp(rNorm(0.52, 0.08), 0.3, 0.7);
      transfer = clamp(rNorm(0.50, 0.08), 0.3, 0.7);
      dvel = rNorm(-0.10, 0.08);
      break;
  }
  if (isSyntropy) {
    transfer = clamp(transfer + 0.25, 0, 1);
    orbital = clamp(orbital + 0.20, 0, 1);
    thermal = clamp(thermal + 0.10, 0, 1);
    dvel = Math.max(dvel, rNorm(0.10, 0.08));
  }
  return { thermal, orbital, resonance, transfer, dvel };
}

// ---------- Manager Relationship Entropy ----------
// Returns 0.00 – 1.00. Low = healthy dynamic, High = high friction.
// Tied to scenario; Syntropy Triggers naturally have lower MRE.
function mreForScenario(scenario, isSyntropy) {
  let mean, sd;
  switch (scenario) {
    case "healthy":       mean = 0.22; sd = 0.10; break;
    case "manager_drift": mean = 0.78; sd = 0.09; break; // friction IS the manager
    case "systemic":      mean = 0.55; sd = 0.14; break; // moderate, varies
    case "ecg":           mean = 0.45; sd = 0.18; break; // mixed
    default:              mean = 0.40; sd = 0.12; break; // plateau
  }
  if (isSyntropy) mean = Math.max(0.10, mean - 0.18);
  return clamp(rNorm(mean, sd), 0, 1);
}

// ---------- Archetype ----------
function archetypeFromFp(fp, scenario) {
  const avg = (fp.thermal + fp.orbital + fp.resonance + fp.transfer) / 4;
  const variance =
    Math.abs(fp.thermal - avg) +
    Math.abs(fp.orbital - avg) +
    Math.abs(fp.resonance - avg) +
    Math.abs(fp.transfer - avg);
  if (avg > 0.68 && fp.dvel >= 0) return "Climber";
  if (variance > 0.45 || scenario === "ecg") return "ECG";
  return "Plateauer";
}

// ---------- Build people + teams ----------
const people = [];
const teams = [];
let pid = 0;

TEAM_PLAN.forEach((plan, ti) => {
  const teamId = "T" + ti;

  // Manager
  const mgrScenario =
    plan.scenario === "manager_drift" ? "manager_drift" :
    plan.scenario === "systemic"      ? "systemic"      : "healthy";
  const managerFp = fingerprintForScenario(mgrScenario, false);
  const manager = {
    id: "P" + (pid++),
    name: pickName(),
    role: "Manager · " + plan.team,
    dept: plan.dept,
    team: plan.team,
    teamId,
    isManager: true,
    isSyntropy: false,
    scenario: plan.scenario,
    fp: managerFp,
    mre: null // managers don't have a manager-relationship score
  };
  manager.archetype = archetypeFromFp(managerFp, mgrScenario);
  people.push(manager);

  // Team members
  let syntropyAssigned = 0;
  for (let i = 0; i < plan.size; i++) {
    const role = ROLES[plan.dept][Math.floor(r() * ROLES[plan.dept].length)];
    const isSyn = syntropyAssigned < plan.syntropy && r() < 0.4;
    if (isSyn) syntropyAssigned++;
    const fp = fingerprintForScenario(plan.scenario, isSyn);
    const mre = mreForScenario(plan.scenario, isSyn);
    const person = {
      id: "P" + (pid++),
      name: pickName(),
      role,
      dept: plan.dept,
      team: plan.team,
      teamId,
      isManager: false,
      isSyntropy: isSyn,
      scenario: plan.scenario,
      fp,
      mre
    };
    person.archetype = archetypeFromFp(fp, plan.scenario);
    people.push(person);
  }

  teams.push({
    id: teamId,
    name: plan.team,
    dept: plan.dept,
    scenario: plan.scenario,
    size: plan.size + 1,
    managerId: manager.id
  });
});

// ---------- Derived computations per person ----------
function compute(person) {
  const fp = person.fp;
  const energy = clamp(0.55 * fp.thermal + 0.45 * fp.transfer, 0, 1);
  const alignment = clamp(0.55 * fp.resonance + 0.45 * fp.orbital, 0, 1);

  // Composite score: T 0.25 · O 0.35 · R 0.25 · Tr 0.15
  const composite = clamp(
    0.25 * fp.thermal +
    0.35 * fp.orbital +
    0.25 * fp.resonance +
    0.15 * fp.transfer,
    0, 1
  );

  // 90-day trail
  const dx = fp.dvel * 0.35, dy = fp.dvel * 0.30;
  const startE = clamp(energy - dx, 0.02, 0.98);
  const startA = clamp(alignment - dy, 0.02, 0.98);
  const trail = [];
  for (let i = 0; i <= 5; i++) {
    const t = i / 5;
    const jx = (rng() - 0.5) * 0.015;
    const jy = (rng() - 0.5) * 0.015;
    trail.push({
      e: startE + (energy - startE) * t + jx * (1 - Math.abs(0.5 - t) * 2),
      a: startA + (alignment - startA) * t + jy * (1 - Math.abs(0.5 - t) * 2)
    });
  }

  // State (green / yellow / red)
  let state;
  if (energy < 0.35 && alignment < 0.35) state = "red";
  else if (fp.dvel < -0.20 && (energy < 0.55 || alignment < 0.55)) state = "red";
  else if (fp.dvel < -0.10 || energy < 0.5 || alignment < 0.5) state = "yellow";
  else state = "green";

  const preAttrition = fp.dvel < -0.18 && trail[5].e < trail[0].e && trail[5].a < trail[0].a;
  if (preAttrition) state = "red";

  // Entropy source = weakest fingerprint
  const fps = [
    { name: "Thermal",   val: fp.thermal },
    { name: "Orbital",   val: fp.orbital },
    { name: "Resonance", val: fp.resonance },
    { name: "Transfer",  val: fp.transfer }
  ];
  fps.sort((a, b) => a.val - b.val);
  const source = fps[0].name;

  // Minimum Effective Dose
  const doses = {
    "Thermal":   { source: "Thermal · Energy Cooling",     action: "A 15-minute energy conversation. Ask what they used to volunteer for that they no longer do — and why." },
    "Orbital":   { source: "Orbital · Connection Loss",    action: "A small connection intervention. Pair them on a cross-team initiative within the next two weeks." },
    "Resonance": { source: "Resonance · Skill Mismatch",   action: "A role-redesign conversation. Their top skill is no longer their top task. Realign before they realign themselves." },
    "Transfer":  { source: "Transfer · Recognition Gap",   action: "A recognition moment. They have stopped giving energy because they have stopped receiving acknowledgement." }
  };

  return { energy, alignment, composite, trail, state, source, dose: doses[source], preAttrition };
}

people.forEach(p => { p.derived = compute(p); });

// ---------- Aggregate stats helper ----------
function getStats(filtered) {
  const s = { red: 0, yellow: 0, green: 0, syn: 0, total: filtered.length, avgDvel: 0, avgMre: 0 };
  let mreCount = 0;
  filtered.forEach(p => {
    s[p.derived.state]++;
    if (p.isSyntropy) s.syn++;
    s.avgDvel += p.fp.dvel;
    if (p.mre !== null && p.mre !== undefined) { s.avgMre += p.mre; mreCount++; }
  });
  s.avgDvel /= Math.max(filtered.length, 1);
  s.avgMre  /= Math.max(mreCount, 1);
  const redPct = s.red / Math.max(s.total, 1);
  s.health =
    (redPct > 0.18 || s.avgDvel < -0.15) ? "red"
    : (redPct > 0.08 || s.avgDvel < -0.05) ? "yellow"
    : "green";
  return s;
}

// ---------- Manager Relationship Entropy aggregation per team ----------
// Used by Systemic Fault Isolation: a high team-average MRE points to
// the manager as the entropy source, not the individual.
function teamMreStats(teamId) {
  const members = people.filter(p => p.teamId === teamId && !p.isManager);
  if (!members.length) return { avg: 0, high: 0, count: 0 };
  const avg = members.reduce((s, p) => s + (p.mre || 0), 0) / members.length;
  const high = members.filter(p => (p.mre || 0) > 0.65).length;
  return { avg, high, count: members.length };
}

// ---------- Expose to window for multi-page use ----------
// (Each page loads data.js, then reads window.SIGNAL.*)
window.SIGNAL = {
  people,
  teams,
  DEPTS,
  ROLES,
  TEAM_PLAN,
  getStats,
  teamMreStats,
  compute,
  clamp
};
