/* Overall Tax Estimator (tool-003) — rate dataset and calculation engine.
   ==========================================================================
   Front-end only, no backend, no database, and NO PERSISTENCE of any kind —
   no localStorage, no sessionStorage, no cookies (TOOLS.md §7). Everything
   below lives and dies with the page.

   No user-facing copy is restated in this file except the labels the DATA
   supplies (state names, entity fee names, source rows). The title, the intro
   and the legal block are read from the DOM when the PDF is built, so the
   markup stays the single source and the two cannot drift.

   WHAT THIS FILE IS NOT. It is not a tax computation. It models the taxes
   that vary most by location for an owner-operated household and business,
   holds rates flat across five years, and ignores everything Step 5 lists.
   Several rates are estimates rather than confirmed figures; every one of
   them is flagged in the dataset and Step 5 is GENERATED from those flags, so
   the page can never claim more confidence than the data carries.

   VERIFICATION FLAGS. `v: 1` means the field was verified against a cited
   source by whoever compiled it; `v: 0` means it was carried from model
   knowledge and NOT verified. The flags are ported from the source material
   as found. A field the source left unannotated is recorded here as
   UNVERIFIED, because an absent annotation is not a claim of verification.
   No field's status is ever upgraded.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.querySelector('[data-tool-id="tool-003"]');
  if (!root) return;

  /* ========================================================================
     1. FEDERAL CONSTANTS — tax year 2026
     ======================================================================== */

  var FED = {
    /* v — IRS Rev. Proc. 2025-32 */
    bracketsMFJ: [[0, .10], [24800, .12], [100800, .22], [211400, .24], [403550, .32], [512450, .35], [768700, .37]],
    bracketsSGL: [[0, .10], [12400, .12], [50400, .22], [105700, .24], [201775, .32], [256225, .35], [640600, .37]],
    /* v — head of household, Rev. Proc. 2025-32 Table 2. HoH is NOT a blend of
       the other two: it carries wider 10% and 12% bands than single and then
       converges with single from 22% up. The 35% threshold is the one figure
       where published tables disagree — $256,200 here against $256,225 in
       some secondary tables, which is the single amount. The HoH-specific
       figure is used, matching the $25 HoH/single divergence the schedules
       have carried in prior years; the conflict is disclosed in Step 5 rather
       than settled silently. At the top rate it is worth under a dollar. */
    bracketsHOH: [[0, .10], [17700, .12], [67450, .22], [105700, .24], [201775, .32], [256200, .35], [640600, .37]],
    stdMFJ: 32200,
    stdSGL: 16100,
    stdHOH: 24150,

    /* u — the 2026 Social Security wage base was not verified (2025 was
       $176,100). The source annotates this LINE as unverified; the rates sit
       on the same line, so they are carried as unverified too rather than
       promoted on the reasoning that they happen to be statutory. Preserving
       an unverified flag costs a row in Step 5; inventing a verified one
       costs the page its credibility. */
    ssWageBase: 184500,
    ssRate: .062,
    medRate: .0145,

    /* v — statutory, unindexed */
    /* HoH takes the SINGLE threshold in all three of these — statutory, not an
       approximation: the additional Medicare threshold, the QBI threshold and
       phase-in range, and the child tax credit phase-out all read $200,000 for
       every status except married filing jointly. */
    addMedThresh: { mfj: 250000, sgl: 200000, hoh: 200000 },
    addMedRate: .009,

    /* u — carried unannotated by the source, so recorded unverified */
    qbiRate: .20,
    /* v */
    qbiThresh: { mfj: 403500, sgl: 201775, hoh: 201775 },
    qbiPhase: { mfj: 150000, sgl: 75000, hoh: 75000 },
    qbiFloor: 400,

    /* u — $40,000 for 2025, indexed roughly 1%/yr */
    saltCap: 40400,

    /* u — NOT carried by the source material at all; added here because the
       page collects dependents and the credit is usually worth more than the
       gap between two states. OBBBA set $2,200 from 2025, phasing out at 5%
       of AGI above the thresholds. */
    ctcPerChild: 2200,
    ctcPhaseStart: { mfj: 400000, sgl: 200000, hoh: 200000 },
    ctcPhaseRate: .05,

    /* u — NOT carried by the source material. Federal unemployment tax is
       6.0% on the first $7,000 of each employee's wages, against which a
       5.4% credit for state unemployment contributions is normally available,
       leaving 0.6% net. The net figure is what an employer paying its state
       tax on time actually bears. */
    futaRate: .006,
    futaWageBase: 7000
  };

  /* Filing status: the page's own option text mapped to the code the rate
     tables are keyed by. The MARKUP is the source of the labels; this is the
     only place they are matched, and an unrecognized label falls back to
     married filing jointly with the fallback stated rather than implied. */
  var FILING_BY_LABEL = {
    'Married filing jointly': 'mfj',
    'Single': 'sgl',
    'Head of household': 'hoh'
  };

  /* ========================================================================
     2. SPEND BUCKETS AND SALES-TAX EXPOSURE

     The eight household buckets, and how much of each is exposed to sales
     tax. Three buckets are not sales-taxed at all, two follow the state's own
     rules, and three carry a FIXED taxable fraction that is the same in every
     state.
     ======================================================================== */

  /* u — NO PUBLISHED SPLIT EXISTS for how much of a household's Transport or
     miscellaneous spending is a taxable good rather than an untaxed service,
     registration or fee. This is a single assumption applied uniformly, named
     here so it is visible rather than buried in the arithmetic, and it is one
     of the larger sources of error in the sales-tax line. Same value in every
     state, so it never changes a state COMPARISON — only the absolute level. */
  var MIXED_BUCKET_TAXABLE_FRACTION = 0.45;

  /* u — the share of the Retail & general bucket that is clothing, and so
     subject to a state's clothing rule rather than its general rate. Same
     value in every state; it changes the comparison only between states that
     exempt clothing and states that do not, which is the distinction it
     exists to carry. */
  var CLOTHING_SHARE_OF_RETAIL = 0.35;

  /* The bucket table. `rule` decides which rate applies to the taxable part:
       none     — not sales-taxed at all
       grocery  — the state's grocery treatment
       general  — the state's general combined rate
       retail   — general rate, with the clothing share following the state's
                  clothing rule
       mixed    — general rate on MIXED_BUCKET_TAXABLE_FRACTION only
     `id` matches the markup's input id suffix. */
  var BUCKETS = [
    { id: 'housing',    label: 'Housing',                rule: 'none' },
    { id: 'groceries',  label: 'Groceries',              rule: 'grocery' },
    { id: 'dining',     label: 'Dining & entertainment', rule: 'general' },
    { id: 'transport',  label: 'Transport',              rule: 'mixed' },
    { id: 'insurance',  label: 'Insurance',              rule: 'none' },
    { id: 'healthcare', label: 'Healthcare',             rule: 'none' },
    { id: 'retail',     label: 'Retail & general',       rule: 'retail' },
    { id: 'other',      label: 'Everything else',        rule: 'mixed' }
  ];

  /* ========================================================================
     3. SALES-TAX EXEMPTIONS — all 51 jurisdictions

     NEW DATASET. The source material carries a single combined rate per state
     and nothing about what that rate applies to, which is the difference
     between a grocery-heavy household in a state that exempts food and one
     that does not.

     EVERY ROW IS UNVERIFIED (v: 0). These were compiled from model knowledge
     of the Federation of Tax Administrators sales tax matrix and state
     revenue department publications; they were NOT read back against those
     publications in this pass. Marking them unverified is the honest record,
     and BACKLOG.md carries the row for verifying them before this tool ships.

       groc  : 'exempt' | 'reduced' | 'taxable'
       gRate : the combined rate that applies to food when 'reduced', as a
               PERCENT. Several states exempt groceries from the STATE rate
               while local rates still apply — those are recorded as 'reduced'
               at the local-only rate, because "exempt" would overstate the
               saving. The state/local split is itself an estimate, since the
               source carries only a combined rate; error compounds here.
       cloth : 'exempt' | 'threshold' | 'taxable'
       cCap  : the per-item threshold in dollars when 'threshold'
       svc   : general treatment of services — 'few' | 'enumerated' | 'broad'.
               DOCUMENTATION ONLY: the bucket map assigns service exposure by
               bucket, uniformly across states, so this field is reported in
               Step 5 but does not enter the arithmetic.
     ======================================================================== */

  /* PER-FIELD verification flags, not one flag for the row. A single `v` per
     state forced grocery, clothing and services to share a verdict, so the
     whole table had to sit at the weakest of the three. They verify from
     different sources and at different times, and the clothing rules turned
     out to be confirmable in full while several grocery rates are still ours.

       vGroc  — the grocery figure THIS TOOL USES is confirmed. Exempt and
                full-rate states qualify: the rate is 0 or the state's general
                rate, both already verified. Reduced-rate states mostly do NOT,
                because no source publishes the combined state-plus-local rate
                on food that the model needs — that number is still ours, even
                where the treatment behind it is confirmed.
       vCloth — the clothing treatment and any per-item threshold.
       vSvc   — the general services treatment. Not checked, and it does not
                enter the arithmetic; it is reported for reference only. */
  var X = function (groc, gRate, cloth, cCap, svc, vGroc, vCloth, vSvc) {
    return {
      groc: groc, gRate: gRate, cloth: cloth, cCap: cCap, svc: svc,
      vGroc: vGroc || 0, vCloth: vCloth || 0, vSvc: vSvc || 0
    };
  };
  var FTA = 'Federation of Tax Administrators sales tax matrix; state revenue department publications';

  var SALES = {
    AL: X('reduced', 7.46, 'taxable', 0, 'few', 0, 1, 0),
    AK: X('exempt', 0, 'taxable', 0, 'few', 1, 1, 0),
    AZ: X('exempt', 0, 'taxable', 0, 'few', 1, 1, 0),
    AR: X('reduced', 3.11, 'taxable', 0, 'enumerated', 0, 1, 0),
    CA: X('exempt', 0, 'taxable', 0, 'few', 1, 1, 0),
    CO: X('exempt', 0, 'taxable', 0, 'few', 1, 1, 0),
    CT: X('exempt', 0, 'taxable', 0, 'enumerated', 1, 1, 0),
    DE: X('exempt', 0, 'exempt', 0, 'few', 1, 1, 0),
    FL: X('exempt', 0, 'taxable', 0, 'enumerated', 1, 1, 0),
    GA: X('reduced', 3.56, 'taxable', 0, 'few', 0, 1, 0),
    HI: X('taxable', 0, 'taxable', 0, 'broad', 1, 1, 0),
    ID: X('taxable', 0, 'taxable', 0, 'few', 1, 1, 0),
    IL: X('reduced', 1.00, 'taxable', 0, 'few', 0, 1, 0),
    IN: X('exempt', 0, 'taxable', 0, 'few', 1, 1, 0),
    IA: X('exempt', 0, 'taxable', 0, 'enumerated', 1, 1, 0),
    KS: X('reduced', 2.21, 'taxable', 0, 'few', 0, 1, 0),
    KY: X('exempt', 0, 'taxable', 0, 'enumerated', 1, 1, 0),
    LA: X('reduced', 5.13, 'taxable', 0, 'few', 0, 1, 0),
    ME: X('exempt', 0, 'taxable', 0, 'enumerated', 1, 1, 0),
    MD: X('exempt', 0, 'taxable', 0, 'enumerated', 1, 1, 0),
    MA: X('exempt', 0, 'threshold', 175, 'few', 1, 1, 0),
    MI: X('exempt', 0, 'taxable', 0, 'few', 1, 1, 0),
    MN: X('exempt', 0, 'exempt', 0, 'enumerated', 1, 1, 0),
    MS: X('taxable', 0, 'taxable', 0, 'enumerated', 1, 1, 0),
    MO: X('reduced', 5.44, 'taxable', 0, 'few', 0, 1, 0),
    MT: X('exempt', 0, 'exempt', 0, 'few', 1, 1, 0),
    NE: X('exempt', 0, 'taxable', 0, 'enumerated', 1, 1, 0),
    NV: X('exempt', 0, 'taxable', 0, 'few', 1, 1, 0),
    NH: X('exempt', 0, 'exempt', 0, 'few', 1, 1, 0),
    NJ: X('exempt', 0, 'exempt', 0, 'enumerated', 1, 1, 0),
    NM: X('exempt', 0, 'taxable', 0, 'broad', 1, 1, 0),
    NY: X('exempt', 0, 'threshold', 110, 'enumerated', 1, 1, 0),
    NC: X('reduced', 2.35, 'taxable', 0, 'few', 0, 1, 0),
    ND: X('exempt', 0, 'taxable', 0, 'few', 1, 1, 0),
    OH: X('exempt', 0, 'taxable', 0, 'enumerated', 1, 1, 0),
    OK: X('reduced', 4.56, 'taxable', 0, 'few', 0, 1, 0),
    OR: X('exempt', 0, 'exempt', 0, 'few', 1, 1, 0),
    PA: X('exempt', 0, 'exempt', 0, 'enumerated', 1, 1, 0),
    RI: X('exempt', 0, 'threshold', 250, 'enumerated', 1, 1, 0),
    SC: X('reduced', 1.49, 'taxable', 0, 'few', 0, 1, 0),
    SD: X('taxable', 0, 'taxable', 0, 'broad', 1, 1, 0),
    TN: X('reduced', 6.61, 'taxable', 0, 'enumerated', 0, 1, 0),
    TX: X('exempt', 0, 'taxable', 0, 'enumerated', 1, 1, 0),
    UT: X('reduced', 3.00, 'taxable', 0, 'enumerated', 1, 1, 0),
    VT: X('exempt', 0, 'exempt', 0, 'few', 1, 1, 0),
    VA: X('reduced', 1.00, 'taxable', 0, 'few', 1, 1, 0),
    WA: X('exempt', 0, 'taxable', 0, 'enumerated', 1, 1, 0),
    WV: X('exempt', 0, 'taxable', 0, 'broad', 1, 1, 0),
    WI: X('exempt', 0, 'taxable', 0, 'enumerated', 1, 1, 0),
    WY: X('exempt', 0, 'taxable', 0, 'few', 1, 1, 0),
    DC: X('exempt', 0, 'taxable', 0, 'broad', 1, 1, 0)
  };

  /* ========================================================================
     4. ENTITY FEES AND GROSS RECEIPTS TAXES

     The source material folded these into one object. They are SPLIT here
     because the page prints them as two different lines with two different
     rules: the entity line always shows where a fee exists and takes its name
     and value per state AND per election, while the gross receipts line
     appears ONLY where such a tax exists.

     All entries are u — documented simplifications, not full statutes, and
     the source says so of its own.

       label : the fee's real name in that state, printed by the page
       sp/sc : the amount under a sole-proprietor / S-corp election. A state
               that charges nothing under an election records 0, and the page
               omits the line entirely rather than printing $0.
     ======================================================================== */

  var ENTITY = {
    CA: { label: 'Franchise tax minimum', sp: 800, sc: 800 },
    DE: { label: 'Annual franchise tax', sp: 300, sc: 300 },
    NY: { label: 'Filing fee', sp: 25, sc: 25 },
    IL: { label: 'Annual report fee', sp: 75, sc: 75 },
    TN: { label: 'Franchise tax minimum', sp: 100, sc: 100 },
    MA: { label: 'Corporate excise minimum', sp: 0, sc: 456 },
    DEFAULT: { label: 'State entity tax or fee', sp: 0, sc: 0 }
  };

  /* Revenue-based taxes only. A state absent from this table has none, and
     the page omits the line rather than printing a zero. */
  var GROSS = {
    /* California's LLC fee is revenue-TIERED, so it belongs here rather than
       with the flat $800 franchise minimum above. */
    CA: { label: 'LLC gross receipts fee', f: function (rev) {
      return rev < 250000 ? 0 : rev < 500000 ? 900 : rev < 1000000 ? 2500
           : rev < 5000000 ? 6000 : 11790;
    } },
    TX: { label: 'Franchise (margin) tax', f: function (rev) {
      return rev <= 2470000 ? 0 : rev * 0.00375 * 0.70;    // EZ-computation approximation
    } },
    WA: { label: 'Business & occupation tax', f: function (rev) {
      return rev * 0.0175;                                  // service classification
    } },
    OR: { label: 'Corporate activity tax', f: function (rev) {
      return rev > 1000000 ? 250 + (rev - 1000000) * 0.0057 : 0;
    } },
    OH: { label: 'Commercial activity tax', f: function (rev) {
      return rev > 6000000 ? (rev - 6000000) * 0.0026 : 0;
    } },
    NV: { label: 'Commerce tax', f: function (rev) {
      return rev > 4000000 ? (rev - 4000000) * 0.00331 : 0;
    } }
    /* New Mexico's gross receipts tax is deliberately absent: it behaves as a
       sales tax on the buyer and is already carried by the sales line, so
       charging it here as well would count it twice. */
  };

  /* ========================================================================
     5. STATE DATASET — 51 jurisdictions

     PORTED from the source material. Per its own header:
       pit/pitS : MFJ bracket array [[threshold, rate], ...]; pitS if single
                  differs. null means the state levies no individual income
                  tax, and the page then omits that line ENTIRELY rather than
                  printing $0 — a $0 line asserts the tax exists and happened
                  to come to nothing, which is a different and false claim.
       ded/dedS : standard deduction plus personal exemption
       sales    : combined state + average local rate, July 2026   (v)
       prop     : effective residential rate on market value       (u)
       suta     : state unemployment insurance {rate, base}        (u)
       pfml     : employer paid-family-leave payroll rate          (u)
       ptet     : state offers a pass-through entity tax election  (u)

     pit, pitS, ded and dedS carry NO annotation in the source. They are
     recorded here as UNVERIFIED for that reason — see the note at the top of
     this file.

     DROPPED as out of scope for this tool, per the build brief: capital gains
     in every form (ltcg, stcg, cgDed, cgExempt, cgOnly, cgStdDed, cgSur,
     NIIT), estate and inheritance tax (est, inh), city income and business
     taxes (city), corporate income tax rates (cit, and federal corp), and
     business personal property (bpp).
     ======================================================================== */

  var S = function (n, o) { return Object.assign({ n: n }, o); };

  var ST = {
AL: S('Alabama',{pit:[[0,.02],[1000,.04],[6000,.05]],pitS:[[0,.02],[500,.04],[3000,.05]],ded:11500,dedS:4500,sales:9.46,prop:0.38,suta:{rate:.027,base:8000},ptet:1}),
AK: S('Alaska',{pit:null,ded:0,sales:1.82,prop:1.04,suta:{rate:.023,base:51700}}),
AZ: S('Arizona',{pit:[[0,.025]],ded:16700,dedS:8350,sales:8.54,prop:0.60,suta:{rate:.020,base:8000},ptet:1}),
AR: S('Arkansas',{pit:[[0,.02],[4600,.039]],ded:4940,dedS:2470,sales:9.48,prop:0.61,suta:{rate:.021,base:7000},ptet:1}),
CA: S('California',{pit:[[0,.01],[22158,.02],[52528,.04],[82904,.06],[115084,.08],[145448,.093],[742958,.103],[891542,.113],[1000000,.123],[1485906,.133]],pitS:[[0,.01],[11079,.02],[26264,.04],[41452,.06],[57542,.08],[72724,.093],[371479,.103],[445771,.113],[742953,.123],[1000000,.133]],ded:11080,dedS:5540,sales:9.03,prop:0.70,suta:{rate:.034,base:7000},pfml:.013,ptet:1}),
CO: S('Colorado',{pit:[[0,.044]],ded:32200,dedS:16100,sales:7.89,prop:0.48,suta:{rate:.017,base:30600},pfml:.0045,ptet:1}),
CT: S('Connecticut',{pit:[[0,.02],[20000,.045],[100000,.055],[200000,.06],[400000,.065],[500000,.069],[1000000,.0699]],pitS:[[0,.02],[10000,.045],[50000,.055],[100000,.06],[200000,.065],[250000,.069],[500000,.0699]],ded:24000,dedS:15000,sales:6.35,prop:1.78,suta:{rate:.030,base:26100},pfml:.005,ptet:1}),
DE: S('Delaware',{pit:[[0,0],[2000,.022],[5000,.039],[10000,.048],[20000,.052],[25000,.0555],[60000,.066]],ded:6500,dedS:3250,sales:0,prop:0.55,suta:{rate:.013,base:12500},pfml:.008,ptet:1}),
FL: S('Florida',{pit:null,ded:0,sales:6.98,prop:0.79,suta:{rate:.027,base:7000}}),
GA: S('Georgia',{pit:[[0,.0519]],ded:24000,dedS:12000,sales:7.56,prop:0.81,suta:{rate:.026,base:9500},ptet:1}),
HI: S('Hawaii',{pit:[[0,.014],[19200,.032],[28800,.055],[38400,.064],[48000,.068],[72000,.072],[96000,.076],[250000,.079],[350000,.0825],[450000,.09],[550000,.10],[650000,.11]],pitS:[[0,.014],[9600,.032],[14400,.055],[19200,.064],[24000,.068],[36000,.072],[48000,.076],[125000,.079],[175000,.0825],[225000,.09],[275000,.10],[325000,.11]],ded:11088,dedS:5544,sales:4.50,prop:0.28,suta:{rate:.030,base:62000},pfml:.005,ptet:1}),
ID: S('Idaho',{pit:[[0,0],[9622,.053]],pitS:[[0,0],[4811,.053]],ded:32200,dedS:16100,sales:6.03,prop:0.62,suta:{rate:.010,base:55300},ptet:1}),
IL: S('Illinois',{pit:[[0,.0495]],ded:5850,dedS:2925,sales:8.98,prop:2.05,suta:{rate:.035,base:13916},ptet:1}),
IN: S('Indiana',{pit:[[0,.0295]],ded:2000,dedS:1000,sales:7.00,prop:0.75,suta:{rate:.025,base:9500},ptet:1}),
IA: S('Iowa',{pit:[[0,.038]],ded:32200,dedS:16100,sales:6.94,prop:1.49,suta:{rate:.020,base:39500},ptet:1}),
KS: S('Kansas',{pit:[[0,.052],[46000,.0558]],pitS:[[0,.052],[23000,.0558]],ded:26560,dedS:12765,sales:8.71,prop:1.32,suta:{rate:.027,base:14000},ptet:1}),
KY: S('Kentucky',{pit:[[0,.035]],ded:3360,dedS:3360,sales:6.00,prop:0.82,suta:{rate:.027,base:11700},ptet:1}),
LA: S('Louisiana',{pit:[[0,.03]],ded:25750,dedS:12875,sales:10.13,prop:0.55,suta:{rate:.021,base:7700},ptet:1}),
ME: S('Maine',{pit:[[0,.058],[54849,.0675],[129749,.0715]],pitS:[[0,.058],[27399,.0675],[64849,.0715]],ded:27300,dedS:13650,sales:5.50,prop:1.22,suta:{rate:.019,base:12000},pfml:.005,ptet:1}),
MD: S('Maryland',{pit:[[0,.02],[1000,.03],[2000,.04],[3000,.0475],[150000,.05],[175000,.0525],[225000,.055],[300000,.0575],[600000,.0625],[1200000,.065]],pitS:[[0,.02],[1000,.03],[2000,.04],[3000,.0475],[100000,.05],[125000,.0525],[150000,.055],[250000,.0575],[500000,.0625],[1000000,.065]],ded:13100,dedS:6550,sales:6.00,prop:1.02,suta:{rate:.026,base:8500},pfml:.005,ptet:1}),
MA: S('Massachusetts',{pit:[[0,.05],[1083150,.09]],ded:8800,dedS:4400,sales:6.25,prop:1.14,suta:{rate:.030,base:15000},pfml:.0088,ptet:1}),
MI: S('Michigan',{pit:[[0,.0425]],ded:11800,dedS:5900,sales:6.00,prop:1.33,suta:{rate:.027,base:9500},ptet:1}),
MN: S('Minnesota',{pit:[[0,.0535],[48700,.068],[193480,.0785],[337930,.0985]],pitS:[[0,.0535],[33310,.068],[109430,.0785],[203150,.0985]],ded:30600,dedS:15300,sales:8.14,prop:1.09,suta:{rate:.025,base:44000},pfml:.0044,ptet:1}),
MS: S('Mississippi',{pit:[[0,0],[10000,.04]],ded:16600,dedS:8300,sales:7.06,prop:0.75,suta:{rate:.021,base:14000},ptet:1}),
MO: S('Missouri',{pit:[[0,0],[1348,.02],[2696,.025],[4044,.03],[5392,.035],[6740,.04],[8088,.045],[9436,.047]],ded:32200,dedS:16100,sales:8.44,prop:0.93,suta:{rate:.024,base:9500},ptet:1}),
MT: S('Montana',{pit:[[0,.047],[95000,.0565]],pitS:[[0,.047],[47500,.0565]],ded:32200,dedS:16100,sales:0,prop:0.73,suta:{rate:.014,base:45100},ptet:1}),
NE: S('Nebraska',{pit:[[0,.0246],[8250,.0351],[49530,.0455]],pitS:[[0,.0246],[4130,.0351],[24760,.0455]],ded:17700,dedS:8850,sales:6.98,prop:1.51,suta:{rate:.013,base:9000},ptet:1}),
NV: S('Nevada',{pit:null,ded:0,sales:8.24,prop:0.49,suta:{rate:.030,base:41800}}),
NH: S('New Hampshire',{pit:null,ded:0,sales:0,prop:1.86,suta:{rate:.017,base:14000}}),
NJ: S('New Jersey',{pit:[[0,.014],[20000,.0175],[50000,.0245],[70000,.035],[80000,.0553],[150000,.0637],[500000,.0897],[1000000,.1075]],pitS:[[0,.014],[20000,.0175],[35000,.035],[40000,.0553],[75000,.0637],[500000,.0897],[1000000,.1075]],ded:2000,dedS:1000,sales:6.60,prop:2.21,suta:{rate:.028,base:43300},pfml:.005,ptet:1}),
NM: S('New Mexico',{pit:[[0,.015],[8000,.032],[25000,.043],[50000,.047],[100000,.049],[315000,.059]],pitS:[[0,.015],[5500,.032],[16500,.043],[33500,.047],[66500,.049],[210000,.059]],ded:32200,dedS:16100,sales:7.68,prop:0.67,suta:{rate:.020,base:33200},pfml:.004,ptet:1}),
NY: S('New York',{pit:[[0,.039],[17150,.044],[23600,.0515],[27900,.054],[161550,.059],[323200,.0685],[2155350,.0965],[5000000,.103],[25000000,.109]],pitS:[[0,.039],[8500,.044],[11700,.0515],[13900,.054],[80650,.059],[215400,.0685],[1077550,.0965],[5000000,.103],[25000000,.109]],ded:16050,dedS:8000,sales:8.54,prop:1.64,suta:{rate:.041,base:12800},pfml:.005,ptet:1}),
NC: S('North Carolina',{pit:[[0,.0399]],ded:25500,dedS:12750,sales:7.10,prop:0.78,suta:{rate:.010,base:32600},ptet:1}),
ND: S('North Dakota',{pit:[[0,0],[80975,.0195],[298075,.025]],pitS:[[0,0],[48475,.0195],[244825,.025]],ded:32200,dedS:16100,sales:7.09,prop:0.96,suta:{rate:.010,base:45100},ptet:1}),
OH: S('Ohio',{pit:[[0,0],[26050,.0275]],ded:4800,dedS:2400,sales:7.29,prop:1.53,suta:{rate:.027,base:9000},ptet:1}),
OK: S('Oklahoma',{pit:[[0,0],[7500,.025],[9800,.035],[14400,.045]],pitS:[[0,0],[3750,.025],[4900,.035],[7200,.045]],ded:14700,dedS:7350,sales:9.06,prop:0.85,suta:{rate:.015,base:28200},ptet:1}),
OR: S('Oregon',{pit:[[0,.0475],[9100,.0675],[22800,.0875],[250000,.099]],pitS:[[0,.0475],[4550,.0675],[11400,.0875],[125000,.099]],ded:5820,dedS:2910,sales:0,prop:0.91,suta:{rate:.024,base:54300},pfml:.004,ptet:1}),
PA: S('Pennsylvania',{pit:[[0,.0307]],ded:0,dedS:0,sales:6.34,prop:1.41,suta:{rate:.036,base:10000},ptet:0}),
RI: S('Rhode Island',{pit:[[0,.0375],[82050,.0475],[186450,.0599]],ded:32900,dedS:16450,sales:7.00,prop:1.34,suta:{rate:.030,base:29800},pfml:.011,ptet:1}),
SC: S('South Carolina',{pit:[[0,0],[3640,.03],[18230,.06]],ded:16700,dedS:8350,sales:7.49,prop:0.53,suta:{rate:.010,base:14000},ptet:1}),
SD: S('South Dakota',{pit:null,ded:0,sales:6.11,prop:1.14,suta:{rate:.012,base:15000}}),
TN: S('Tennessee',{pit:null,ded:0,sales:9.61,prop:0.56,suta:{rate:.027,base:7000}}),
TX: S('Texas',{pit:null,ded:0,sales:8.20,prop:1.63,suta:{rate:.027,base:9000}}),
UT: S('Utah',{pit:[[0,.045]],ded:0,dedS:0,sales:7.42,prop:0.55,suta:{rate:.014,base:48900},ptet:1}),
VT: S('Vermont',{pit:[[0,.0335],[82500,.066],[199450,.076],[304000,.0875]],pitS:[[0,.0335],[49400,.066],[119700,.076],[249700,.0875]],ded:25900,dedS:12950,sales:6.43,prop:1.78,suta:{rate:.019,base:14800},ptet:1}),
VA: S('Virginia',{pit:[[0,.02],[3000,.03],[5000,.05],[17000,.0575]],ded:19360,dedS:9680,sales:5.77,prop:0.78,suta:{rate:.025,base:8000},ptet:1}),
WA: S('Washington',{pit:null,ded:0,sales:9.57,prop:0.84,suta:{rate:.013,base:72800},pfml:.0092,ptet:0}),
WV: S('West Virginia',{pit:[[0,.0222],[10000,.0296],[25000,.0333],[40000,.0444],[60000,.0482]],ded:4000,dedS:2000,sales:6.60,prop:0.55,suta:{rate:.025,base:9500},ptet:1}),
WI: S('Wisconsin',{pit:[[0,.035],[20150,.044],[69260,.053],[443630,.0765]],pitS:[[0,.035],[15110,.044],[51950,.053],[332720,.0765]],ded:27240,dedS:14660,sales:5.72,prop:1.51,suta:{rate:.026,base:14000},ptet:1}),
WY: S('Wyoming',{pit:null,ded:0,sales:5.39,prop:0.55,suta:{rate:.015,base:32400}}),
DC: S('District of Columbia',{pit:[[0,.04],[10000,.06],[40000,.065],[60000,.085],[250000,.0925],[500000,.0975],[1000000,.1075]],ded:32200,dedS:16100,sales:6.00,prop:0.57,suta:{rate:.027,base:9000},pfml:.0075,ptet:1})
  };

  var STATE_KEYS = Object.keys(ST).sort(function (a, b) {
    return ST[a].n < ST[b].n ? -1 : 1;
  });

  /* ========================================================================
     6. ENGINE — primitives
     ======================================================================== */

  function bracketTax(income, brackets) {
    if (!brackets || income <= 0) return 0;
    var t = 0;
    for (var i = 0; i < brackets.length; i++) {
      var lo = brackets[i][0];
      var hi = (i + 1 < brackets.length) ? brackets[i + 1][0] : Infinity;
      if (income > lo) t += (Math.min(income, hi) - lo) * brackets[i][1];
    }
    return t;
  }

  /* Every figure entering the engine passes through here, which is why the
     comma-stripping lives at this one point: the entry fields render
     thousands separators, so a raw parseFloat would read "42,000" as 42. */
  var num = function (v) {
    if (typeof v === 'string') v = v.replace(/,/g, '').replace(/\s/g, '');
    var n = parseFloat(v);
    return isFinite(n) ? n : 0;
  };

  /* Group digits for display in an entry field. Kept separate from money()
     because a field carries no currency symbol — the $ sits beside it in its
     own .tf-uom-pre slot. */
  function grouped(v) {
    var n = num(v);
    if (!isFinite(n)) return '';
    return Math.round(n).toLocaleString('en-US');
  }

  function money(n) {
    var r = Math.round(Math.abs(n));
    return (n < 0 ? '−' : '') + '$' + r.toLocaleString('en-US');
  }
  function moneyPlain(n) {                      // for the PDF, which has no minus glyph issue
    return (n < 0 ? '-' : '') + '$' + Math.round(Math.abs(n)).toLocaleString('en-US');
  }
  function pct(n) { return (n * 100).toFixed(1) + '%'; }

  /* Self-employment tax. The Social Security wage base is shared across W-2
     wages and self-employment income: wages consume it FIRST, and only the
     remainder is available to the SE computation. Getting this wrong
     overstates the tax for anyone with both a job and a business, which is
     the entire population this tool is for. */
  function seTax(seIncome, w2WagesAlreadyPaid) {
    if (seIncome <= 0) return { total: 0, half: 0 };
    var base = seIncome * 0.9235;
    var ssRoom = Math.max(0, FED.ssWageBase - w2WagesAlreadyPaid);
    var ss = Math.min(base, ssRoom) * (FED.ssRate * 2);
    var med = base * (FED.medRate * 2);
    var total = ss + med;
    return { total: total, half: total / 2 };
  }

  /* Employee-side payroll tax on W-2 wages, including the additional Medicare
     surcharge above the filing-status threshold. */
  function employeePayroll(wages, filing) {
    if (wages <= 0) return 0;
    var ss = Math.min(wages, FED.ssWageBase) * FED.ssRate;
    var med = wages * FED.medRate;
    var addl = Math.max(0, wages - FED.addMedThresh[filing]) * FED.addMedRate;
    return ss + med + addl;
  }

  /* Employer-side payroll tax on wages the BUSINESS pays — its own employees,
     and the owner's W-2 salary under an S-corp. Computed by the engine at the
     state's rate; never entered by the user. */
  function employerPayroll(wages, st) {
    if (wages <= 0) return 0;
    var fica = Math.min(wages, FED.ssWageBase) * FED.ssRate + wages * FED.medRate;
    var futa = Math.min(wages, FED.futaWageBase) * FED.futaRate;
    var suta = st.suta ? Math.min(wages, st.suta.base) * st.suta.rate : 0;
    var pfml = st.pfml ? wages * st.pfml : 0;
    return fica + futa + suta + pfml;
  }

  /* QBI deduction on pass-through business income. Non-SSTB treatment: above
     the threshold the deduction is limited by 50% of W-2 wages paid, phased
     in across the statutory range. */
  function qbiDeduction(qbiIncome, w2Paid, taxableBefore, filing) {
    if (qbiIncome <= 0) return 0;
    var full = qbiIncome * FED.qbiRate;
    var excess = taxableBefore - FED.qbiThresh[filing];
    if (excess <= 0) return full;
    var p = Math.min(1, excess / FED.qbiPhase[filing]);
    var wageLimit = w2Paid * 0.50;
    var cut = Math.max(0, full - wageLimit) * p;
    return Math.max(0, full - cut);
  }

  function childTaxCredit(dependents, agi, filing) {
    if (dependents <= 0) return 0;
    var full = dependents * FED.ctcPerChild;
    var over = Math.max(0, agi - FED.ctcPhaseStart[filing]);
    return Math.max(0, full - over * FED.ctcPhaseRate);
  }

  /* ========================================================================
     7. ENGINE — sales tax on the household basket

     TAX-INCLUSIVE ENTRY. The user enters what they actually pay, so the sales
     tax is already inside the figure. Stripping it out is what makes a state
     comparison mean anything:

       1. `stripBasket` runs ONCE, against the HOME state's rates, and turns
          the entered receipts into a PRE-TAX basket — the goods and services
          themselves, with no tax on them.
       2. `salesTaxOn` then reprices that same basket under any state's rules.

     Pre-tax spend is therefore identical in every state BY CONSTRUCTION, and
     only the sales tax on top of it moves. That is the claim the page makes
     ("the same basket costs the same anywhere"), and it is true here because
     the basket is computed once and reused, not recomputed per state.
     ======================================================================== */

  /* The rate that applies to a bucket in a given state, as a decimal, plus
     the fraction of the bucket that rate reaches. */
  function bucketExposure(bucket, key) {
    var st = ST[key], sx = SALES[key];
    var general = st.sales / 100;

    switch (bucket.rule) {
      case 'none':
        return [{ frac: 1, rate: 0 }];

      case 'grocery':
        if (sx.groc === 'exempt') return [{ frac: 1, rate: 0 }];
        if (sx.groc === 'reduced') return [{ frac: 1, rate: sx.gRate / 100 }];
        return [{ frac: 1, rate: general }];

      case 'general':
        return [{ frac: 1, rate: general }];

      case 'mixed':
        /* Only part of the bucket is a taxable good; the rest is service,
           registration and fee. One fraction, every state — see the constant. */
        return [
          { frac: MIXED_BUCKET_TAXABLE_FRACTION, rate: general },
          { frac: 1 - MIXED_BUCKET_TAXABLE_FRACTION, rate: 0 }
        ];

      case 'retail':
        /* The clothing share follows the state's clothing rule; the rest
           takes the general rate. A THRESHOLD exemption is treated as a full
           exemption: the thresholds are per-item and ordinary clothing sits
           below all three of them, so an average household basket clears very
           little of it. This overstates the exemption for anyone buying an
           expensive coat and is recorded as a simplification. */
        var clothRate = (sx.cloth === 'taxable') ? general : 0;
        return [
          { frac: CLOTHING_SHARE_OF_RETAIL, rate: clothRate },
          { frac: 1 - CLOTHING_SHARE_OF_RETAIL, rate: general }
        ];
    }
    return [{ frac: 1, rate: general }];
  }

  /* Entered receipts -> pre-tax basket, using the HOME state's rules. */
  function stripBasket(entered, homeKey) {
    var basket = {};
    BUCKETS.forEach(function (b) {
      var gross = num(entered[b.id]);
      var pre = 0;
      bucketExposure(b, homeKey).forEach(function (part) {
        var slice = gross * part.frac;
        pre += part.rate > 0 ? slice / (1 + part.rate) : slice;
      });
      basket[b.id] = pre;
    });
    return basket;
  }

  /* Pre-tax basket -> the sales tax a given state would charge on it. */
  function salesTaxOn(basket, key) {
    var tax = 0;
    BUCKETS.forEach(function (b) {
      var pre = basket[b.id] || 0;
      bucketExposure(b, key).forEach(function (part) {
        tax += pre * part.frac * part.rate;
      });
    });
    return tax;
  }

  function basketTotal(basket) {
    var t = 0;
    BUCKETS.forEach(function (b) { t += basket[b.id] || 0; });
    return t;
  }

  /* ========================================================================
     8. ENGINE — one year, one state, one scenario

     `run` computes a complete year. Business tax is NOT computed here: it is
     the DIFFERENCE between a run with the business and a run without it, which
     `scenario` below takes. Attempting to compute a business's tax standalone
     is what produces the classic error of taxing the first business dollar at
     the household's lowest bracket instead of its highest.
     ======================================================================== */

  function businessProfit(biz, election, st) {
    var revenue = num(biz.revenue);
    var ownerW2 = (election === 's-corp') ? num(biz.ownerSalary) : 0;
    var staffWages = num(biz.wages);
    var payroll = employerPayroll(staffWages + ownerW2, st);
    var ebitda = revenue - num(biz.cogs) - staffWages - ownerW2 - payroll - num(biz.opex);
    return {
      revenue: revenue,
      ownerW2: ownerW2,
      staffWages: staffWages,
      employerPayroll: payroll,
      costsBeforeDep: num(biz.cogs) + staffWages + ownerW2 + payroll + num(biz.opex),
      ebitda: ebitda,
      depreciation: num(biz.dep),
      net: ebitda - num(biz.dep)
    };
  }

  /* year: { wages, contract, dependents, homeValue, basket, biz, election }
     opts: { withBusiness: bool } */
  function run(year, key, opts) {
    var st = ST[key];
    var filing = year.filing;
    var withBiz = !!opts.withBusiness;

    var P = withBiz ? businessProfit(year.biz, year.election, st)
                    : { revenue: 0, ownerW2: 0, staffWages: 0, employerPayroll: 0,
                        costsBeforeDep: 0, ebitda: 0, depreciation: 0, net: 0 };

    /* --- earned income ---------------------------------------------------
       W-2 wages from a job, plus the owner's own W-2 salary under an S-corp,
       are wage income. 1099 contract income and (when the business is owner-run)
       business profit are self-employment income. This is the split the page
       insists on keeping: the two are taxed differently. */
    var w2 = num(year.wages) + P.ownerW2;
    var seIncome = num(year.contract) + (year.election === 'sole-proprietor' ? Math.max(0, P.net) : 0);

    var empPayroll = employeePayroll(w2, filing);
    var se = seTax(seIncome, w2);

    /* Pass-through income reaching the return. Under an S-corp the owner's
       salary is already counted in w2 above, and the REMAINING profit passes
       through free of payroll tax — which is the whole point of the election. */
    var passthrough = (year.election === 's-corp') ? P.net : Math.max(0, P.net);
    if (year.election === 'sole-proprietor') passthrough = P.net;

    var agi = w2 + num(year.contract) + passthrough - se.half;

    /* --- state income tax ------------------------------------------------
       SIMPLIFICATION: the state base is federal AGI less the state's own
       standard deduction. Real state bases add and subtract dozens of items;
       modeling them would need a second dataset per state and would not
       change the shape of the decision this tool exists to show. */
    var stateTax = 0;
    if (st.pit) {
      /* HEAD OF HOUSEHOLD MAPS TO THE STATE'S SINGLE SCHEDULE. Many states run
         a distinct HoH schedule, and a few (California most notably) make it
         materially more generous than single. Modeling that honestly would
         mean 51 more bracket arrays and 51 more deduction figures, none of
         which the source dataset carries — so the mapping is an ASSUMPTION,
         and it is a conservative one: where a state does have its own HoH
         schedule, this overstates that state's tax rather than understating
         it. Disclosed as its own row in Step 5. */
      var single = (filing !== 'mfj');
      var stDed = single ? (st.dedS != null ? st.dedS : st.ded) : st.ded;
      var stBrackets = single ? (st.pitS || st.pit) : st.pit;
      stateTax = bracketTax(Math.max(0, agi - stDed), stBrackets);
    }

    /* --- property and sales tax ------------------------------------------
       Both apply in EVERY scenario, including business only: leaving a job
       does not sell the house or empty the shopping basket. */
    var propertyTax = num(year.homeValue) * (st.prop / 100);
    var salesTax = salesTaxOn(year.basket, key);

    /* --- federal income tax ---------------------------------------------- */
    var salt = Math.min(stateTax + propertyTax, FED.saltCap);
    var stdDed = filing === 'mfj' ? FED.stdMFJ : filing === 'hoh' ? FED.stdHOH : FED.stdSGL;
    var deduction = Math.max(stdDed, salt);

    var taxableBefore = Math.max(0, agi - deduction);
    var qbi = withBiz ? qbiDeduction(Math.max(0, P.net), P.staffWages + P.ownerW2, taxableBefore, filing) : 0;
    if (qbi > 0 && qbi < FED.qbiFloor && P.net > 0) qbi = Math.min(FED.qbiFloor, Math.max(0, P.net));

    var taxable = Math.max(0, taxableBefore - qbi);
    var fedBrackets = filing === 'mfj' ? FED.bracketsMFJ
                    : filing === 'hoh' ? FED.bracketsHOH : FED.bracketsSGL;
    var fedBefore = bracketTax(taxable, fedBrackets);
    var ctc = childTaxCredit(num(year.dependents), agi, filing);
    var fedTax = Math.max(0, fedBefore - ctc);

    /* --- entity and gross receipts --------------------------------------- */
    var entity = 0, entityLabel = '', gross = 0, grossLabel = '';
    if (withBiz && P.revenue > 0) {
      var E = ENTITY[key] || ENTITY.DEFAULT;
      entity = (year.election === 's-corp') ? E.sc : E.sp;
      entityLabel = E.label;
      if (GROSS[key]) {
        gross = GROSS[key].f(P.revenue);
        grossLabel = GROSS[key].label;
      }
    }

    var totalTax = fedTax + empPayroll + se.total + stateTax + propertyTax + salesTax + entity + gross;

    return {
      profit: P,
      w2: w2,
      agi: agi,
      income: w2 + num(year.contract) + passthrough,
      fedTax: fedTax,
      fica: empPayroll + se.total,
      employeePayroll: empPayroll,
      seTax: se.total,
      stateTax: stateTax,
      propertyTax: propertyTax,
      salesTax: salesTax,
      entity: entity,
      entityLabel: entityLabel,
      gross: gross,
      grossLabel: grossLabel,
      qbi: qbi,
      totalTax: totalTax
    };
  }

  /* ========================================================================
     9. ENGINE — the three scenarios

     job      : wages + contract income, no business
     both     : wages + contract income + business
     business : business only — no wages, no contract income, but the SAME
                household spend and the SAME house

     Business tax is INCREMENTAL in the `both` scenario: the difference between
     the run with the business and the run without it. In the `business`
     scenario there is nothing to be incremental to, so the business carries
     everything the household does not.
     ======================================================================== */

  function scenario(year, key, which) {
    var y = Object.assign({}, year);
    if (which === 'business') { y.wages = 0; y.contract = 0; }

    var withBiz = (which !== 'job');
    var full = run(y, key, { withBusiness: withBiz });

    /* The counterfactual: the same household, same house, same basket, no
       business at all. */
    var without = run(Object.assign({}, y, { biz: {} }), key, { withBusiness: false });

    var businessTax = withBiz ? (full.totalTax - without.totalTax) : 0;
    var personalTax = full.totalTax - businessTax;

    var spend = basketTotal(year.basket);
    var remaining = full.income - spend - full.totalTax;

    return {
      which: which,
      key: key,
      income: full.income,
      spend: spend,
      tax: full.totalTax,
      remaining: remaining,
      businessTax: businessTax,
      personalTax: personalTax,
      businessIncome: withBiz ? Math.max(0, full.profit.net) : 0,
      full: full,
      without: without,
      /* The breakdown the page prints. Personal lines are the household's own;
         business lines are INCREMENTAL — what the total rises by when the
         business is included, not a separate bill. */
      personal: {
        fed: without.fedTax,
        fica: without.fica,
        state: without.stateTax,
        property: without.propertyTax,
        sales: without.salesTax
      },
      business: {
        se: full.seTax - without.seTax + (full.employeePayroll - without.employeePayroll),
        fed: full.fedTax - without.fedTax,
        state: full.stateTax - without.stateTax,
        entity: full.entity,
        entityLabel: full.entityLabel,
        gross: full.gross,
        grossLabel: full.grossLabel
      }
    };
  }

  /* ========================================================================
     10. ENGINE — the five-year projection

     Year 1 comes from Step 1. Years 2 to 5 are PREFILLED PLACEHOLDERS on a
     plain growth curve and are editable; the page marks them as placeholders
     so nobody mistakes them for a forecast. Rates are held flat across all
     five years — no bracket indexing, no rate changes — which is stated in
     Step 5 and in the legal block.
     ======================================================================== */

  var YEARS = 5;

  /* u — an arbitrary illustrative curve, not a forecast. Wages drift with
     ordinary raises; household spend holds flat; the business grows the way
     an owner-operated business is usually imagined to. Every one of these is
     meant to be overwritten. */
  /* u — OUR OWN ASSUMPTION, not a published forecast. Household spending was
     previously held flat across years 2-5, which quietly asserted that a
     basket costs the same in five years as today. Growing it at a stated rate
     is the more honest default. Flat is still the easier read for comparing
     one year against the next, and the copy says so — every cell is editable,
     so flattening it by hand is a deliberate choice the reader can make. */
  var HOUSEHOLD_SPEND_INFLATION = 0.025;

  var PLACEHOLDER_CURVE = {
    wages:    [1, 1.028, 1.056, 1.083, 1.111],
    contract: [1, 1.028, 1.056, 1.083, 1.111],
    spend:    [1, 1.025, 1.051, 1.077, 1.104],
    revenue:  [1, 2.667, 5.333, 8.667, 13.333],
    costs:    [1, 2.5, 5.5, 9.5, 15]
  };

  /* Years 2-5 enter business costs as ONE figure. The engine needs the split,
     so the Year 1 mix is held constant and scaled. Where Year 1 has no costs
     to take a mix from, the whole figure lands in operating expenses. */
  function splitCosts(total, base) {
    var parts = ['cogs', 'wages', 'opex', 'dep'];
    var baseTotal = 0;
    parts.forEach(function (p) { baseTotal += num(base[p]); });
    var out = {};
    if (baseTotal <= 0) {
      parts.forEach(function (p) { out[p] = 0; });
      out.opex = total;
    } else {
      parts.forEach(function (p) { out[p] = total * (num(base[p]) / baseTotal); });
    }
    out.ownerSalary = num(base.ownerSalary) * (baseTotal > 0 ? total / baseTotal : 1);
    out.revenue = 0;
    return out;
  }

  /* ========================================================================
     11. READING THE PAGE

     Every figure the engine uses comes from an input. Nothing is stored
     between visits — there is nowhere to store it, by rule.
     ======================================================================== */

  function el(sel) { return root.querySelector(sel); }
  function els(sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }
  /* A placeholder CLEARS when focused, so while the caret is in it the field
     is empty on screen. The suggestion it is standing in for is parked on the
     element, and read from there — otherwise every derived figure on the page
     would lurch to zero the moment the reader clicked into a box, and lurch
     back when they left without typing. What is displayed and what is
     computed stay the same number either way. */
  function fieldValue(e) {
    if (!e) return 0;
    if (e.value === '' && e.dataset.suggested !== undefined) return num(e.dataset.suggested);
    return num(e.value);
  }
  function val(id) { return fieldValue(el('#' + id)); }

  function readBase() {
    var stateSel = el('#b-state');
    var filingSel = el('#b-filing');
    var scorp = el('[data-election="s-corp"]');
    var entered = {};
    BUCKETS.forEach(function (b) { entered[b.id] = val('b-sp-' + b.id); });

    return {
      /* NULL until a state is chosen. Nothing downstream computes against a
         state the reader never picked — every rate on the page is
         state-specific, so a silent default would produce a complete,
         confident answer for somewhere they do not live. */
      key: (stateSel && ST[stateSel.value]) ? stateSel.value : null,
      /* THREE statuses, matched explicitly. This previously read
         `value === 'Single' ? 'sgl' : 'mfj'`, so "Head of household" fell
         through to MARRIED FILING JOINTLY and every HoH user silently got the
         most generous schedule in the system — MFJ brackets, the $32,200
         standard deduction, the $250,000 Medicare threshold and the MFJ QBI
         and child-credit thresholds. It understated a single parent's federal
         tax by thousands with nothing on screen to suggest anything was
         wrong. Matched by explicit value now, with 'mfj' reachable only from
         its own label. */
      filing: FILING_BY_LABEL[filingSel && filingSel.value] || 'mfj',
      filingLabel: filingSel ? filingSel.value : '',
      election: (scorp && scorp.checked) ? 's-corp' : 'sole-proprietor',
      dependents: val('b-dependents'),
      wages: val('b-wages'),
      contract: val('b-contract'),
      homeValue: val('b-home'),
      entered: entered,
      biz: {
        revenue: val('b-bz-revenue'),
        cogs: val('b-bz-cogs'),
        wages: val('b-bz-wages'),
        ownerSalary: val('b-bz-ownersalary'),
        opex: val('b-bz-opex'),
        dep: val('b-bz-dep')
      }
    };
  }

  /* The five-year input grid. Year 1 is derived from Step 1 and is not
     editable; years 2-5 are read from their own inputs, which are seeded from
     the curve the first time they are drawn. */
  var YEAR_INPUTS = null;          // null until Step 2 has been drawn once
  /* Year cells the reader has edited. A placeholder is a suggestion until it
     is overwritten; after that it is their figure and loses the grey. */
  var EDITED = {};

  function baseYearRow(base) {
    var enteredTotal = 0;
    BUCKETS.forEach(function (b) { enteredTotal += num(base.entered[b.id]); });
    var costs = num(base.biz.cogs) + num(base.biz.wages) + num(base.biz.opex) + num(base.biz.dep);
    return {
      wages: base.wages,
      contract: base.contract,
      spend: enteredTotal,
      revenue: base.biz.revenue,
      costs: costs
    };
  }

  function seedYearInputs(base) {
    var y1 = baseYearRow(base);
    var rows = [];
    for (var i = 0; i < YEARS; i++) {
      rows.push({
        wages: y1.wages * PLACEHOLDER_CURVE.wages[i],
        contract: y1.contract * PLACEHOLDER_CURVE.contract[i],
        spend: y1.spend * PLACEHOLDER_CURVE.spend[i],
        revenue: y1.revenue * PLACEHOLDER_CURVE.revenue[i],
        costs: y1.costs * PLACEHOLDER_CURVE.costs[i]
      });
    }
    rows[0] = y1;
    return rows;
  }

  /* Years 2-5 FOLLOW Year 1, except where the reader has taken a cell over.
     They were seeded once from the page's original defaults and then never
     re-derived: Year 1 tracked Step 1, but the four years after it stayed
     pinned to multiples of figures the reader had already replaced. Enter a
     $5,000 business and Year 2 still read $80,010 — 2.667 x the $30,000
     default — so the projection was a curve through someone else's business.
     A suggestion has to follow the number it is a suggestion ABOUT. An edited
     cell is the reader's own and is never overwritten, which is what EDITED
     is for. */
  function reseedUnedited() {
    if (!YEAR_INPUTS) return;
    var y1 = YEAR_INPUTS[0];
    var cols = ['wages', 'contract', 'spend', 'revenue', 'costs'];
    for (var i = 1; i < YEARS; i++) {
      cols.forEach(function (c) {
        if (EDITED[i + '.' + c]) return;
        YEAR_INPUTS[i][c] = num(y1[c]) * PLACEHOLDER_CURVE[c][i];
      });
    }
  }

  /* Build the five model years the engine runs on. The PRE-TAX basket is
     computed ONCE from Step 1's entries and the home state's rates, then
     scaled for later years by how their total spend compares to Year 1's. */
  function buildYears(base) {
    var y1 = baseYearRow(base);
    var rows = YEAR_INPUTS || seedYearInputs(base);
    rows[0] = y1;                                   // Year 1 always tracks Step 1

    var basket1 = stripBasket(base.entered, base.key);
    var spend1 = y1.spend || 1;

    return rows.map(function (r) {
      var scale = spend1 > 0 ? (r.spend / spend1) : 1;
      var basket = {};
      BUCKETS.forEach(function (b) { basket[b.id] = (basket1[b.id] || 0) * scale; });
      var costSplit = splitCosts(r.costs, base.biz);
      return {
        filing: base.filing,
        election: base.election,
        dependents: base.dependents,
        homeValue: base.homeValue,
        wages: r.wages,
        contract: r.contract,
        basket: basket,
        enteredSpend: r.spend,
        biz: {
          revenue: r.revenue,
          cogs: costSplit.cogs,
          wages: costSplit.wages,
          opex: costSplit.opex,
          dep: costSplit.dep,
          ownerSalary: costSplit.ownerSalary
        }
      };
    });
  }

  /* ========================================================================
     12. LABELS

     Every state-specific and entity-specific string the page prints is
     produced here, from the dataset. The markup contains no state name and no
     entity type, so adding a state or changing an election can never leave a
     printed label behind.
     ======================================================================== */

  var LABELS = {
    stateName: function (key) { return ST[key].n; },
    hasStateIncomeTax: function (key) { return !!ST[key].pit; },
    /* Same rule as the income tax line, for the same reason: five states levy
       no general sales tax at all, and printing "Sales tax $0" for them
       asserts the tax exists and merely came to nothing. Alaska is NOT one of
       them — it has no state rate but real local ones — so this tests the
       combined rate rather than a hand-kept list. */
    hasSalesTax: function (key) { return ST[key].sales > 0; },
    entity: function (key, election) {
      var E = ENTITY[key] || ENTITY.DEFAULT;
      var amount = (election === 's-corp') ? E.sc : E.sp;
      return { label: E.label, amount: amount, present: amount > 0 };
    },
    /* A gross receipts line appears only where such a tax EXISTS AND BITES.
       Several of these regimes have a revenue floor — California's LLC fee
       starts at $250,000, Texas's margin tax at $2.47M — so a small business
       in one of those states would otherwise read a line charging it $0. That
       is the same false claim the state-income-tax rule exists to prevent: it
       asserts a charge that is not being made. The line appears on its own the
       moment revenue clears the floor, which is the informative moment. */
    grossReceipts: function (key, revenue) {
      if (!GROSS[key]) return { label: '', amount: 0, present: false };
      var amount = GROSS[key].f(revenue || 0);
      return { label: GROSS[key].label, amount: amount, present: amount > 0 };
    }
  };

  /* ========================================================================
     13. DERIVED — the Step 4 shares

     Business % of income and business % of tax, per year, and the first year
     the second runs ahead of the first. That crossover is the moment each
     business dollar starts costing more tax than a wage dollar does, which is
     the point of the step.
     ======================================================================== */

  function shares(projection) {
    var rows = projection.map(function (s) {
      return {
        income: s.income,
        tax: s.tax,
        shareIncome: s.income > 0 ? s.businessIncome / s.income : 0,
        shareTax: s.tax !== 0 ? s.businessTax / s.tax : 0
      };
    });
    /* TWO crossovers, not one, because the relationship is not monotonic. A
       small business in Year 1 can carry a tax share above its income share
       — self-employment tax applies at full rate from the first dollar, with
       no bracket relief — then fall back below it as the business grows into
       the deduction, then rise above again for good. Naming only the FIRST
       year and saying "from there" is a claim the numbers may not support.
         first     : the first year the tax share exceeds the income share
         sustained : the first year from which it holds through Year 5
       Where they differ the copy says so instead of overclaiming. */
    var first = null, sustained = null;
    for (var i = 0; i < rows.length; i++) {
      var over = rows[i].shareTax > rows[i].shareIncome;
      if (over && first === null) first = i + 1;
      if (over) { if (sustained === null) sustained = i + 1; }
      else { sustained = null; }
    }
    return { rows: rows, crossover: first, sustained: sustained };
  }

  /* ========================================================================
     14. SOURCES — Step 5 is GENERATED from the dataset

     Every row names a field that is actually in use, its source, and its
     verification flag. Because the table is built from the same objects the
     arithmetic reads, it cannot drift from the rates the page is using: a
     rate that changes status changes this table in the same edit.
     ======================================================================== */

  /* Provenance codes. These say WHERE A FIGURE CAME FROM, not whether it is
     right — an unchecked figure from a reputable compilation is not an error,
     and the old ochre "Unverified" badge read like one across two thirds of
     the table.
       CHECKED  — read against a primary source this pass, citation shown
       CONFLICT — published sources disagree; the row says so and names both
                  readings rather than picking one silently
       PLAIN    — carried from a compilation and not independently checked */
  var CHECKED = 'checked', CONFLICT = 'conflict', PLAIN = 'plain';

  var FTA_SRC = 'Federation of Tax Administrators sales tax matrix, and state revenue department publications';

  /* Source links. A row either points at the document the figure came from or
     says plainly that it has no citable source — an approximate link is worse
     than none, because it lends a figure authority the figure does not have. */
  var LINKS = {
    irs:   { href: 'https://www.irs.gov/pub/irs-drop/rp-25-32.pdf', label: 'IRS Rev. Proc. 2025-32 (PDF)' },
    ssa:   { href: 'https://www.ssa.gov/oact/cola/cbb.html', label: 'SSA contribution and benefit base' },
    ctc:   { href: 'https://www.irs.gov/credits-deductions/individuals/child-tax-credit', label: 'IRS — Child Tax Credit' },
    medi:  { href: 'https://www.irs.gov/taxtopics/tc560', label: 'IRS Topic 560 — Additional Medicare Tax' },
    qbi:   { href: 'https://www.irs.gov/newsroom/qualified-business-income-deduction', label: 'IRS — Qualified Business Income Deduction' },
    salt:  { href: 'https://www.irs.gov/taxtopics/tc503', label: 'IRS Topic 503 — Deductible Taxes' },
    futa:  { href: 'https://www.irs.gov/taxtopics/tc759', label: 'IRS Topic 759 — FUTA' },
    tfSales: { href: 'https://taxfoundation.org/data/all/state/state-sales-tax-rates/', label: 'Tax Foundation — State and Local Sales Tax Rates' },
    tfInc:   { href: 'https://taxfoundation.org/data/all/state/state-income-tax-rates/', label: 'Tax Foundation — State Individual Income Tax Rates' },
    tfGroc:  { href: 'https://taxfoundation.org/data/all/state/2026-sales-tax-rates-midyear/', label: 'Tax Foundation — 2026 Sales Tax Rates, Midyear Update' },
    tfCloth: { href: 'https://taxfoundation.org/data/all/state/map-state-sales-taxes-and-clothing-exemptions/', label: 'Tax Foundation — State Sales Taxes and Clothing Exemptions' },
    fta:     { href: 'https://www.taxadmin.org/sales-taxation-of-services/', label: 'Federation of Tax Administrators — sales taxation of services' },
    census:  { href: 'https://www.census.gov/programs-surveys/acs', label: 'US Census Bureau — American Community Survey' },
    dol:     { href: 'https://oui.doleta.gov/unemploy/statelaws.asp', label: 'US DOL — significant provisions of state UI laws' }
  };
  var NO_SOURCE = { none: true, label: 'No published source — our own assumption' };

  /* row: [input, source, provenance, conflictNote] */
  function sourceRows(key) {
    var st = ST[key], sx = SALES[key], name = ST[key].n;

    var rows = [
      ['Federal income tax brackets and standard deduction',
       'IRS Rev. Proc. 2025-32. Standard deduction $32,200 married filing jointly, $16,100 single, $24,150 head of household. Married filing jointly runs 10% to $24,800 and 37% above $768,700; single runs 10% to $12,400 and 37% above $640,600.',
       CHECKED, null, LINKS.irs],

      ['Federal head of household bracket schedule',
       'IRS Rev. Proc. 2025-32, Table 2. 10% to $17,700, then 12% to $67,450, converging with the single schedule from 22% upward.',
       CONFLICT,
       'Published tables disagree on where the 35% bracket begins for this status — $256,200 against $256,225, the latter being the single-filer figure. The head-of-household figure is used here, matching the small divergence the two schedules have carried in prior years. At the top rate the difference is worth under a dollar.', LINKS.irs],

      ['Social Security wage base',
       'Social Security Administration, 2026: $184,500. Medicare has no wage cap, so the 1.45% applies to every dollar.',
       CHECKED, null, LINKS.ssa],

      ['Additional Medicare tax',
       '0.9% on wages and self-employment income above $200,000 single and head of household, $250,000 married filing jointly. Statutory, and deliberately not inflation-indexed, so the thresholds do not move with the brackets.',
       CHECKED, null, LINKS.medi],

      ['Child tax credit',
       '$2,200 per qualifying child, of which $1,700 is refundable.',
       CHECKED,
       'Applied here as a NON-refundable credit: it reduces tax to zero and no further. A household whose credit exceeds its liability would in reality receive part of the difference back, so this tool understates the benefit at low incomes.', LINKS.ctc],

      ['QBI deduction threshold and phase-in range',
       'Statutory, as amended by OBBBA: $403,500 married filing jointly, $201,775 otherwise, phasing in over $150,000 and $75,000 respectively.',
       CHECKED, null, LINKS.qbi],

      ['QBI deduction rate and minimum deduction',
       'Carried from the compiled dataset at 20% with a $400 floor.',
       PLAIN, null, LINKS.qbi],

      ['SALT deduction cap',
       'Carried at $40,400, indexed forward from the 2025 figure. The indexing assumption is ours, not a published number.',
       PLAIN, null, LINKS.salt],

      ['Federal unemployment tax',
       'Carried at 0.6% on the first $7,000 of each employee\'s wages — the 6.0% statutory rate net of the 5.4% state credit an employer paying its state tax on time normally receives.',
       PLAIN, null, LINKS.futa],

      [name + ' — combined state and average local sales tax rate',
       'Tax Foundation, July 2026 compilation: ' + st.sales.toFixed(2) + '%.',
       PLAIN, null, LINKS.tfSales]
    ];

    if (st.pit) {
      rows.push([name + ' — individual income tax brackets and standard deduction',
        'Carried from the compiled dataset; not read back against the state revenue department this pass.', PLAIN, null, LINKS.tfInc]);
      rows.push(['Head of household treatment in ' + name,
        'Mapped to this state\'s SINGLE schedule and single standard deduction.',
        CONFLICT,
        'An ASSUMPTION, not a published figure. Several states run their own head-of-household schedule, and a few — California most notably — make it materially more generous than single. Modeling that would need a separate bracket set and deduction for every state, which the source dataset does not carry. Where a state does have its own schedule this OVERSTATES the tax rather than understating it.', NO_SOURCE]);
    } else {
      rows.push([name + ' — no individual income tax',
        'This state levies none, so the line is omitted from the breakdown entirely rather than shown as $0.', CHECKED, null, LINKS.tfInc]);
    }

    rows.push([name + ' — effective property tax rate',
      'Census-derived statewide average of ' + st.prop.toFixed(2) + '% of market value. A statewide average hides wide county-level variation.', PLAIN, null, LINKS.census]);
    rows.push([name + ' — unemployment insurance rate and wage base',
      'Mid-range new-employer rate. An established employer\'s experience rating will differ.', PLAIN, null, LINKS.dol]);
    if (st.pfml) {
      rows.push([name + ' — employer paid family leave rate', 'Carried from the compiled dataset.', PLAIN, null, NO_SOURCE]);
    }

    /* The two exemption rows the build brief singles out. Both say plainly
       that the published sources do not agree with each other. */
    var groc = sx.groc === 'exempt' ? 'treated as exempt'
             : sx.groc === 'reduced' ? ('treated as taxed at a reduced ' + sx.gRate.toFixed(2) + '%')
             : 'treated as taxable at the general rate';
    if (sx.vGroc) {
      rows.push([name + ' — grocery sales tax treatment',
        'Groceries are ' + groc + ' here, checked against the Tax Foundation and Kiplinger 2026 compilations, which agree on it. ' +
        (sx.groc === 'reduced'
          ? 'The combined rate is itself published for this state, so no state-and-local split had to be estimated.'
          : 'The rate is either zero or the state\'s own general rate, both already confirmed above.'),
        CHECKED, null, LINKS.tfGroc]);
    } else {
      rows.push([name + ' — grocery sales tax treatment',
        'Groceries are ' + groc + ' here. The TREATMENT is confirmed against the 2026 compilations; the RATE is ours.',
        CONFLICT,
        'The published sources agree on which states tax food and at what STATE rate, but none of them publishes the combined state-and-local rate on food that this model needs — and they differ on whether local rates still apply where the state rate was removed. The ' + sx.gRate.toFixed(2) + '% in use is our own state-plus-local estimate. Arkansas is the sharpest example: one 2026 compilation lists it at 0.125% while another says the state grocery tax was eliminated on 1 January 2026.',
        LINKS.tfGroc]);
    }

    var cloth = sx.cloth === 'exempt' ? 'treated as exempt'
              : sx.cloth === 'threshold' ? ('treated as exempt below $' + sx.cCap + ' per item')
              : 'treated as taxable';
    rows.push([name + ' — clothing sales tax treatment',
      'Clothing is ' + cloth + ' here. Checked across all 51 jurisdictions against the Tax Foundation clothing-exemption map and a second 2026 compilation, which agree in full: Minnesota, New Jersey, Pennsylvania and Vermont exempt clothing outright, Massachusetts exempts below $175, New York below $110 and Rhode Island below $250, and every other state taxes it.',
      CHECKED,
      sx.cloth === 'threshold'
        ? 'One simplification remains, and it is ours rather than the sources\': a per-item threshold is modeled as a FULL exemption on the clothing share of the basket, which overstates the relief for anyone buying above it.'
        : null,
      LINKS.tfCloth]);

    rows.push([name + ' — general treatment of services (' + sx.svc + ')',
      FTA_SRC + '. NOT checked, and deliberately so: the bucket map assigns service exposure uniformly across every state, so this field is reported for reference and does not enter the arithmetic at all.', PLAIN, null, LINKS.fta]);

    var ent = LABELS.entity(key, 'sole-proprietor'), entSc = LABELS.entity(key, 's-corp');
    if (ent.present || entSc.present) {
      rows.push([name + ' — ' + ent.label.toLowerCase(),
        'Simplified to a flat amount. The full statute has conditions this does not model.', PLAIN, null, NO_SOURCE]);
    }
    if (GROSS[key]) {
      rows.push([name + ' — ' + GROSS[key].label.toLowerCase(),
        'A documented approximation of the regime, not the full statute.', PLAIN, null, NO_SOURCE]);
    }
    if (st.ptet) {
      rows.push([name + ' — pass-through entity tax election available',
        'Presence flagged only. The election can materially change the answer and its mechanics are NOT modeled here.', PLAIN, null, NO_SOURCE]);
    }

    rows.push(['Taxable share of the Transport and Everything else buckets',
      'Our own assumption, fixed at ' + Math.round(MIXED_BUCKET_TAXABLE_FRACTION * 100) + '% and identical in every state. No published split of these categories into taxable goods and untaxed services and fees exists.', PLAIN, null, NO_SOURCE]);
    rows.push(['Clothing share of the Retail & general bucket',
      'Our own assumption, fixed at ' + Math.round(CLOTHING_SHARE_OF_RETAIL * 100) + '% and identical in every state.', PLAIN, null, NO_SOURCE]);
    rows.push(['Household spending growth, years 2 to 5',
      'Our own assumption: household spend is grown at ' + (HOUSEHOLD_SPEND_INFLATION * 100).toFixed(1) +
      '% a year. Not a published inflation forecast, and not tied to any index — a single flat rate applied to the whole basket, when in reality the categories move at different speeds. Every cell is editable, and holding spend flat makes year-over-year changes easier to read.',
      PLAIN, null, NO_SOURCE]);
    rows.push(['Growth curve for years 2 to 5',
      'Illustrative placeholders on a plain curve, meant to be overwritten. Not a forecast.', PLAIN, null, NO_SOURCE]);
    rows.push(['Rates across the five-year horizon',
      'Held FLAT. No bracket indexing, no rate changes, no policy changes are modeled in years 2 to 5.', CHECKED, null, NO_SOURCE]);

    return rows;
  }

  /* ========================================================================
     15. CHARTS — hand-authored SVG, no charting library

     NEGATIVES DESCEND FROM A DRAWN ZERO LINE. A stacked bar whose parts are
     all positive is the easy case; this tool's whole point is the case where
     the household spends more than the business earns, so the zero line is a
     real axis and not a floor. Nothing is clamped.

     Colors are written as presentation attributes reading the --tf-* tokens,
     the same idiom .tf-byline uses, so the chart carries no color value of
     its own. For the PDF the SVG is rasterized, where an external stylesheet
     does not apply, so `resolveTokens` swaps the var() references for the
     computed values first — one source, resolved at the last moment.
     ======================================================================== */

  /* THE SEGMENT PALETTE — ONE DEFINITION, three consumers.
     This previously lived in two places: a set of .tf-seg-* CSS classes worn
     by the comparison bars and the legend swatches, and a second set of
     hardcoded fills inside the SVG builders. They drifted, exactly as two
     copies of anything do — the Step 4 chart went on drawing the pale washes
     after the classes were corrected to separable tones, so its legend keyed
     colors the chart was not drawing.
     Everything now reads from here. The .tf-seg-* classes are gone; the bars
     and swatches take an inline background from this object, which is a token
     reference and never a raw value. */
  var SEG = {
    spend:     'var(--tf-stone)',
    tax:       'var(--tf-ink-soft)',
    remaining: 'var(--tf-brick)',
    short:     'var(--tf-brick-dark)',   /* remaining, below zero */
    household: 'var(--tf-stone)',
    business:  'var(--tf-brick)',
    net:       'var(--tf-ink)'
  };

  /* A legend key. Built from SEG so a swatch cannot name a color the marks do
     not draw. */
  function key(role, label) {
    return '<span><i class="tf-chart-swatch" style="background:' + SEG[role] + '"></i>' + label + '</span>';
  }

  var CH = { w: 636, h: 320, left: 66, right: 598, top: 24, bottom: 258, barW: 56 };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;');
  }

  /* A nice round step for the axis, given the span it has to cover. */
  function axisStep(span, target) {
    var raw = span / (target || 4);
    var mag = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
    var norm = raw / mag;
    var step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
    return step * mag;
  }

  function kLabel(v) {
    var a = Math.abs(v);
    var s = a >= 1000 ? (a / 1000).toFixed(a % 1000 === 0 ? 0 : 1) + 'k' : String(Math.round(a));
    return (v < 0 ? '−' : '') + '$' + s;
  }

  /* Build a scale that always INCLUDES zero, so the zero line is real. */
  function makeScale(min, max) {
    var lo = Math.min(0, min), hi = Math.max(0, max);
    if (hi === lo) hi = lo + 1;
    var step = axisStep(hi - lo, 4);
    lo = Math.floor(lo / step) * step;
    hi = Math.ceil(hi / step) * step;
    var span = hi - lo || 1;
    var px = CH.bottom - CH.top;
    return {
      lo: lo, hi: hi, step: step,
      y: function (v) { return CH.bottom - ((v - lo) / span) * px; },
      zero: CH.bottom - ((0 - lo) / span) * px
    };
  }

  function gridAndAxis(sc, labels) {
    var out = '', v;
    out += '<g stroke="var(--tf-stone-light)" stroke-width="1">';
    for (v = sc.lo; v <= sc.hi + 1e-6; v += sc.step) {
      out += '<line x1="' + CH.left + '" y1="' + sc.y(v).toFixed(1) + '" x2="' + CH.right + '" y2="' + sc.y(v).toFixed(1) + '"/>';
    }
    out += '</g>';
    out += '<g font-family="var(--tf-font-body)" font-size="11" fill="var(--tf-ink-soft)" text-anchor="end">';
    for (v = sc.lo; v <= sc.hi + 1e-6; v += sc.step) {
      out += '<text x="' + (CH.left - 8) + '" y="' + (sc.y(v) + 4).toFixed(1) + '">' + kLabel(v) + '</text>';
    }
    out += '</g>';
    /* The zero line, drawn last and heavier, because negatives hang from it. */
    out += '<line x1="' + CH.left + '" y1="' + sc.zero.toFixed(1) + '" x2="' + CH.right + '" y2="' + sc.zero.toFixed(1) + '" stroke="var(--tf-ink)" stroke-width="2"/>';
    out += '<g font-family="var(--tf-font-body)" font-size="11" fill="var(--tf-ink-soft)" text-anchor="middle">';
    labels.forEach(function (t, i) {
      out += '<text x="' + barCenter(i) + '" y="' + (CH.bottom + 22) + '">' + esc(t) + '</text>';
    });
    out += '</g>';
    return out;
  }

  function barCenter(i) {
    var slot = (CH.right - CH.left) / YEARS;
    return CH.left + slot * i + slot / 2;
  }
  function barX(i) { return barCenter(i) - CH.barW / 2; }

  /* Stack a list of {value, fill} upward from zero for positives and downward
     for negatives, each direction accumulating separately. */
  function stack(parts, sc, i) {
    var up = 0, down = 0, out = '';
    parts.forEach(function (p) {
      if (!p.value) return;
      var y0, y1;
      if (p.value > 0) { y0 = sc.y(up + p.value); y1 = sc.y(up); up += p.value; }
      else { y0 = sc.y(down); y1 = sc.y(down + p.value); down += p.value; }
      var h = Math.abs(y1 - y0);
      if (h < 0.4) return;
      out += '<rect x="' + barX(i) + '" y="' + Math.min(y0, y1).toFixed(1) +
             '" width="' + CH.barW + '" height="' + h.toFixed(1) + '" fill="' + p.fill + '"/>';
    });
    return { svg: out, top: sc.y(up), bottom: sc.y(down) };
  }

  /* xmlns IS REQUIRED, even though this SVG is written into the page inline
     where the HTML parser would supply it. The same markup is rasterized
     through an <img src="data:image/svg+xml,..."> for the PDF, and as a
     STANDALONE document it is parsed as XML — without the namespace the image
     fails to load, the chart silently drops out of the PDF, and nothing on
     screen ever looks wrong. */
  function svgOpen(aria, h) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + CH.w + ' ' + (h || CH.h) +
           '" width="' + CH.w + '" height="' + (h || CH.h) +
           '" role="img" aria-label="' + esc(aria) + '">';
  }

  /* --- Step 2: pre-tax surplus, household and business --------------------- */
  function surplusChart(projection, which) {
    var house = [], biz = [], nets = [], mn = 0, mx = 0;
    projection.forEach(function (s) {
      /* Household surplus BEFORE tax: what the job leaves after the basket.
         With no job it is the basket alone, and so negative. */
      var h = (s.income - s.businessIncome) - s.spend;
      var b = s.businessIncome;
      house.push(h); biz.push(b); nets.push(h + b);
      mn = Math.min(mn, h, h + b); mx = Math.max(mx, h + b, b);
    });
    var sc = makeScale(mn, mx);

    var aria = 'Pre-tax surplus across five years, ' + scenarioWords(which) +
      '. Household surplus ' + describeSeries(house) + ' Business profit ' + describeSeries(biz) +
      ' The net for each year runs ' + describeSeries(nets);

    var s = svgOpen(aria);
    s += gridAndAxis(sc, ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5']);
    var marks = '';
    projection.forEach(function (_, i) {
      var st = stack([
        { value: house[i], fill: SEG.household },
        { value: biz[i], fill: SEG.business }
      ], sc, i);
      s += st.svg;
      var net = nets[i];
      var ny = sc.y(net);
      marks += '<line x1="' + barX(i) + '" y1="' + ny.toFixed(1) + '" x2="' + (barX(i) + CH.barW) +
               '" y2="' + ny.toFixed(1) + '" stroke="' + SEG.net + '" stroke-width="2.5"/>';
      marks += '<text x="' + barCenter(i) + '" y="' + (net < 0 ? ny + 14 : ny - 6).toFixed(1) +
               '" font-family="var(--tf-font-body)" font-size="11" font-weight="700" text-anchor="middle" fill="' +
               (net < 0 ? 'var(--tf-brick)' : 'var(--tf-ink)') + '">' + esc(money(net)) + '</text>';
    });
    s += marks + '</svg>';
    return { svg: s, width: CH.w, height: CH.h };
  }

  /* --- Step 4: income split into spend, tax and what is left --------------- */
  function outlookChart(projection, which) {
    var mn = 0, mx = 0;
    projection.forEach(function (s) {
      var up = s.spend + Math.max(0, s.tax);
      mx = Math.max(mx, up + Math.max(0, s.remaining));
      mn = Math.min(mn, Math.min(0, s.remaining));
    });
    var sc = makeScale(mn, mx);

    var aria = 'Stacked bars per year, ' + scenarioWords(which) +
      ', showing income split into spend, tax and what remains. Spend and tax rise from the zero line; what remains ' +
      describeSeries(projection.map(function (s) { return s.remaining; }));

    var s = svgOpen(aria);
    s += gridAndAxis(sc, ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5']);
    var marks = '';
    projection.forEach(function (row, i) {
      var st = stack([
        { value: row.spend, fill: SEG.spend },
        { value: row.tax, fill: SEG.tax },
        { value: row.remaining, fill: row.remaining < 0 ? SEG.short : SEG.remaining }
      ], sc, i);
      s += st.svg;
      var neg = row.remaining < 0;
      var y = neg ? st.bottom + 14 : st.top - 6;
      marks += '<text x="' + barCenter(i) + '" y="' + y.toFixed(1) +
               '" font-family="var(--tf-font-body)" font-size="11" font-weight="700" text-anchor="middle" fill="' +
               (neg ? 'var(--tf-brick)' : 'var(--tf-ink)') + '">' + esc(money(row.remaining)) + '</text>';
    });
    s += marks + '</svg>';
    return { svg: s, width: CH.w, height: CH.h };
  }

  function scenarioWords(which) {
    return which === 'job' ? 'from the job alone'
         : which === 'business' ? 'from the business alone, with no job'
         : 'job and business together';
  }

  /* A short spoken description of a series, for the chart's aria-label — the
     shape of the line, not a reading of every value. */
  function describeSeries(vals) {
    var first = vals[0], last = vals[vals.length - 1];
    var anyNeg = vals.some(function (v) { return v < 0; });
    var dir = last > first ? 'rises' : last < first ? 'falls' : 'holds flat';
    var s = dir + ' from ' + spoken(first) + ' to ' + spoken(last) + '.';
    if (anyNeg) {
      var lastNeg = -1;
      vals.forEach(function (v, i) { if (v < 0) lastNeg = i; });
      s += ' It sits below zero ' + (lastNeg === vals.length - 1 ? 'in every year through Year 5.'
        : 'through Year ' + (lastNeg + 1) + ', turning positive in Year ' + (lastNeg + 2) + '.');
    }
    return s;
  }
  function spoken(v) {
    var a = Math.abs(Math.round(v));
    return (v < 0 ? 'minus ' : '') + '$' + a.toLocaleString('en-US');
  }

  /* Swap var(--tf-*) references for their computed values. Used only when the
     SVG is rasterized for the PDF, where the stylesheet does not reach. */
  function resolveTokens(svgMarkup) {
    var cs = getComputedStyle(document.documentElement);
    return svgMarkup.replace(/var\(--tf-[a-z0-9-]+\)/g, function (m) {
      var name = m.slice(4, -1);
      return (cs.getPropertyValue(name) || '#26221F').trim();
    });
  }

  /* ========================================================================
     16. RENDERING

     The markup owns structure; this owns every figure and every
     state-specific or entity-specific label in it.
     ======================================================================== */

  var STATE = {                       // page-level view state, never persisted
    year3: 0,                         // Step 3 year index
    /* Step 4's state DEFAULTS to the Step 1 home state and follows it, until
       the reader changes it themselves — from then on it is theirs and no
       longer tracks Step 1. That is why the control is not labeled "from
       Step 1": the label would stop being true on first use. It previously
       defaulted to whatever sorted first alphabetically, which was Alabama. */
    outlookStateTouched: false,
    scenarioIncome: 'both',
    scenarioCompare: 'both',
    scenarioOutlook: 'both',
    compare: {}                       // key -> bool, the Step 3 state picker
  };

  function setVar(name, text) {
    els('[data-var="' + name + '"]').forEach(function (e) {
      if (e.tagName === 'SELECT' || e.tagName === 'INPUT' || e.tagName === 'TEXTAREA') return;
      e.textContent = text;
    });
  }
  function showRow(name, on) {
    els('[data-row="' + name + '"]').forEach(function (e) { e.hidden = !on; });
  }

  function fillStateSelects() {
    els('select[data-state-select]').forEach(function (sel) {
      var current = sel.value;
      var isHome = sel.getAttribute('data-state-select') === 'home';
      /* The HOME select keeps an empty first option, and it is the default.
         This rebuilds the option list, so the placeholder has to be re-emitted
         here rather than left in the markup — writing it in the markup alone
         is how it came to be overwritten with California on boot. */
      var opts = isHome ? ['<option value="">Select one</option>'] : [];
      sel.innerHTML = opts.concat(STATE_KEYS.map(function (k) {
        return '<option value="' + k + '">' + esc(ST[k].n) + '</option>';
      })).join('');
      if (current && ST[current]) sel.value = current;
      else if (isHome) sel.value = '';
      /* "Select one" is a prompt, not a value — the least like real data of
         anything on the step — so it wears the same muted treatment as every
         other unanswered field, and takes ink only once a state is chosen. */
      if (isHome) sel.classList.toggle('is-placeholder', !ST[sel.value]);
    });
  }

  /* The picker. Rendered against the current filter, so typing narrows the
     list rather than scrolling it. Selection lives in STATE.compare and is
     never read back off the DOM, which is what lets a filtered-out state stay
     selected: hiding a row must not silently deselect it. */
  var pickerFilter = '';

  /* Kept in step with the grid-template-columns count in the page's own style
     block. If one changes the other must change with it — they are two halves
     of one layout decision, and the comment says so in both places. */
  var PICKER_COLUMNS = 3;

  /* [a,b,c,d,e,f,g] over 3 columns becomes the order a row-major grid needs in
     order to LOOK column-major:
        a d f      read down: a b c | d e f | g
        b e g
        c
     Columns absorb the remainder from the left, so the left columns are the
     long ones and no column is more than one item taller than the next. */
  function columnMajor(list, cols) {
    var n = list.length;
    if (n === 0) return list;
    var rows = Math.ceil(n / cols);
    var tall = n % cols;                    // this many columns get the extra row
    if (tall === 0) tall = cols;

    var colOf = [], start = 0, i, c;
    for (c = 0; c < cols; c++) {
      var len = (c < tall) ? rows : rows - 1;
      colOf.push(list.slice(start, start + len));
      start += len;
    }
    var out = [];
    for (i = 0; i < rows; i++) {
      for (c = 0; c < cols; c++) {
        if (colOf[c][i] !== undefined) out.push(colOf[c][i]);
      }
    }
    return out;
  }

  function fillStatePicker() {
    var host = el('#state-picker');
    if (!host) return;
    var home = el('#b-state') ? el('#b-state').value : null;
    var q = pickerFilter.trim().toLowerCase();
    var keys = STATE_KEYS.filter(function (k) {
      return !q || ST[k].n.toLowerCase().indexOf(q) !== -1 || k.toLowerCase() === q;
    });

    /* COLUMN-MAJOR. A CSS grid fills row by row, which puts Alaska to the
       RIGHT of Alabama and breaks the one thing an alphabetical list is for —
       running your eye down it. Reordering the array into column order before
       the grid lays it out restores the reading order without giving up the
       grid, and it re-derives on every filter, so a narrowed list is still
       alphabetical down each column. */
    keys = columnMajor(keys, PICKER_COLUMNS);

    host.innerHTML = keys.length
      ? keys.map(function (k) {
          var on = STATE.compare[k] ? ' checked' : '';
          return '<label class="tf-picker-item' + (k === home ? ' is-home' : '') + '" title="' + esc(ST[k].n) + '">' +
                 '<input type="checkbox" value="' + k + '"' + on + '>' +
                 '<span>' + esc(ST[k].n) + '</span></label>';
        }).join('')
      : '<p class="tf-picker-empty">No state matches that.</p>';

    var count = el('[data-picker-count]');
    if (count) {
      var n = STATE_KEYS.filter(function (k) { return STATE.compare[k]; }).length;
      count.textContent = n + ' of ' + STATE_KEYS.length + ' selected';
    }
  }

  /* --- Step 1 ------------------------------------------------------------- */
  function renderInflationRate() {
    els('[data-inflation-rate]').forEach(function (e) {
      e.textContent = (HOUSEHOLD_SPEND_INFLATION * 100).toFixed(1) + '%';
    });
  }

  function renderBase(base, years) {
    var y1 = years[0];
    var enteredTotal = 0;
    BUCKETS.forEach(function (b) { enteredTotal += num(base.entered[b.id]); });
    var preTax = basketTotal(y1.basket);
    var salesInside = enteredTotal - preTax;
    var income = base.wages + base.contract;

    setVar('spendAsEntered', money(enteredTotal));
    setVar('salesTaxInsideSpend', '−' + money(salesInside).replace('−', ''));
    setVar('spendPreTax', money(preTax));
    setVar('householdIncome', money(income));
    setVar('spendPreTaxDeduction', '−' + money(preTax).replace('−', ''));
    setVar('householdSurplus', money(income - preTax));

    var P = businessProfit(y1.biz, base.election, ST[base.key]);
    setVar('businessRevenue', money(P.revenue));
    setVar('businessCosts', '−' + money(P.costsBeforeDep).replace('−', ''));
    setVar('businessEbitda', money(P.ebitda));
    setVar('businessDepreciation', '−' + money(P.depreciation).replace('−', ''));
    setVar('businessNetProfit', money(P.net));
  }

  /* --- Step 2 ------------------------------------------------------------- */
  function renderYearTable(base) {
    var host = el('[data-year-table]');
    if (!host) return;
    if (!YEAR_INPUTS) YEAR_INPUTS = seedYearInputs(base);
    YEAR_INPUTS[0] = baseYearRow(base);
    reseedUnedited();

    var cols = ['wages', 'contract', 'spend', 'revenue', 'costs'];
    /* Years 2-5 are SUGGESTIONS, and are greyed to say so. The words
       "from Step 1" and "placeholder" used to carry that, at the cost of a
       wide first column and a table that read as annotated rather than
       editable; the styling carries it now and the year column is just the
       number. A field the reader edits stops being grey the moment it holds
       their own figure. */
    var rows = YEAR_INPUTS.map(function (r, i) {
      var cells = cols.map(function (c) {
        if (i === 0) return '<td class="tf-num">' + grouped(r[c]) + '</td>';
        var isPlaceholder = !EDITED[i + '.' + c];
        return '<td class="tf-num"><input class="tf-input tf-year-input' +
               (isPlaceholder ? ' is-placeholder' : '') + '" type="text" inputmode="numeric" ' +
               'data-year="' + i + '" data-col="' + c + '" value="' + grouped(r[c]) + '"></td>';
      }).join('');
      return '<tr' + (i === 0 ? ' class="tf-hilite-base"' : '') + '><td>' + (i + 1) + '</td>' + cells + '</tr>';
    }).join('');
    host.innerHTML = rows;
  }

  function renderIncomeStep(base, projections) {
    var which = STATE.scenarioIncome;
    var proj = projections[which];
    var chart = surplusChart(proj, which);
    var host = el('[data-surplus-chart]');
    if (host) host.innerHTML = chart.svg;

    /* Keys only the marks this variant actually draws, from the same palette
       the chart drew them with. */
    var sLeg = el('[data-surplus-legend]');
    if (sLeg) {
      /* Job-only draws no business bar at all, so keying one described a mark
         that was not on the chart. */
      var anyBiz = proj.some(function (r) { return r.businessIncome > 0; });
      var anyHouse = proj.some(function (r) { return (r.income - r.businessIncome) - r.spend !== 0; });
      var k = [];
      if (anyHouse) k.push(key('household', 'Household surplus'));
      if (anyBiz) k.push(key('business', 'Business profit'));
      k.push(key('net', 'Net for the year'));
      sLeg.innerHTML = k.join('');
    }

    var last = proj[proj.length - 1];
    var lastNet = last.income - last.spend;
    var negYears = proj.filter(function (s) { return (s.income - s.spend) < 0; }).length;
    var worst = proj.reduce(function (a, s) {
      var n = s.income - s.spend; return n < a ? n : a;
    }, 0);

    var note = el('[data-surplus-note]');
    if (note) {
      var title, body;
      if (negYears > 0) {
        title = 'You are short for ' + negYears + (negYears === 1 ? ' year' : ' years') +
                ', and ' + money(worst).replace('−', '') + ' down at the worst point.';
        body = 'The household still spends ' + money(proj[0].spend) + ' a year and the income here does not cover it until it turns. ' +
               'The bars below the line are years you would be living off savings — and this is before any tax. ' +
               'Make sure that money exists before you plan on this.';
      } else {
        title = 'Your pre-tax surplus reaches ' + money(lastNet) + ' by Year 5.';
        body = 'Surplus, not income — earnings with household spending already taken out, but before any tax at all, ' +
               'including the sales tax that was sitting inside that spending. Step 3 takes the tax out.';
      }
      note.className = 'tf-callout ' + (negYears > 0 ? 'tf-callout-warn' : 'tf-callout-affirm');
      note.innerHTML = '<div><div class="tf-callout-title">' + esc(title) +
                       '</div><p class="tf-callout-body">' + esc(body) + '</p></div>';
    }
  }

  /* --- Step 3 ------------------------------------------------------------- */
  function renderAfterTax(base, projections) {
    var i = STATE.year3;
    var job = projections.job[i], both = projections.both[i], biz = projections.business[i];

    var grid = el('[data-scenario-stats]');
    if (grid) {
      grid.innerHTML = [
        ['Job only', job], ['Job + business', both], ['Business only', biz]
      ].map(function (p, n) {
        var s = p[1];
        return '<div' + (n === 1 ? ' class="tf-hilite-mark"' : '') + '>' +
               '<div class="tf-stat-label">' + p[0] + '</div>' +
               '<div class="tf-stat-value">' + money(s.remaining) + '</div>' +
               '<div class="tf-stat-sub">' + (s.remaining < 0 ? 'short' : 'left') + ', on ' + money(s.income) + '</div></div>';
      }).join('');
    }

    var tbl = el('[data-arith-table]');
    if (tbl) {
      var rowsOut = [
        ['Income', 'income', false],
        ['Spend', 'spend', true],
        ['Tax', 'tax', true]
      ].map(function (r) {
        return '<tr><td><strong>' + r[0] + '</strong></td>' +
          [job, both, biz].map(function (s) {
            var v = r[2] ? -s[r[1]] : s[r[1]];
            return '<td class="tf-num">' + money(v) + '</td>';
          }).join('') + '</tr>';
      }).join('');
      rowsOut += '<tr class="tf-hilite-base"><td><strong>Remaining</strong></td>' +
        [job, both, biz].map(function (s) {
          return '<td class="tf-num' + (s.remaining < 0 ? ' tf-num-neg' : '') + '"><strong>' +
                 money(s.remaining) + '</strong></td>';
        }).join('') + '</tr>';
      tbl.innerHTML = rowsOut;
    }

    /* The arithmetic table's own header. Both halves come from here, comma
       included, so the markup carries no state name and no year even as
       placeholder content — a failed script shows an empty cell, never a
       confidently wrong state. */
    setVar('yearLabel', 'Year ' + (i + 1) + ', ');
    setVar('homeState', ST[base.key].n);

    /* The two ledgers. Every line here is a DYNAMIC LABEL decision: a state
       with no income tax loses that line entirely, and the entity and gross
       receipts lines appear only where such a charge exists. */
    var pers = el('[data-personal-ledger]');
    if (pers) {
      var pl = both.personal;
      var lines = [
        ['Federal income tax', pl.fed],
        ['Social Security & Medicare', pl.fica]
      ];
      if (LABELS.hasStateIncomeTax(base.key)) lines.push(['State income tax', pl.state]);
      lines.push(['Property tax', pl.property]);
      if (LABELS.hasSalesTax(base.key)) lines.push(['Sales tax', pl.sales]);
      pers.innerHTML = '<p class="tf-meta">Personal</p>' + lines.map(function (l) {
        return '<div class="tf-check-row"><span>' + esc(l[0]) + '</span><span class="tf-num">' + money(l[1]) + '</span></div>';
      }).join('') + '<div class="tf-check-row is-total"><span>Personal</span><span class="tf-num">' +
        money(both.personalTax) + '</span></div>';
    }

    var bus = el('[data-business-ledger]');
    if (bus) {
      var bl = both.business;
      var bLines = [
        [base.election === 's-corp' ? 'Payroll tax on your salary' : 'Self-employment tax', bl.se],
        ['Federal income tax on profit', bl.fed]
      ];
      if (LABELS.hasStateIncomeTax(base.key)) bLines.push(['State income tax on profit', bl.state]);
      var ent = LABELS.entity(base.key, base.election);
      if (ent.present) bLines.push([ent.label, bl.entity]);
      var gr = LABELS.grossReceipts(base.key, both.full.profit.revenue);
      if (gr.present) bLines.push([gr.label, bl.gross]);
      bus.innerHTML = '<p class="tf-meta">Business</p>' + bLines.map(function (l) {
        return '<div class="tf-check-row"><span>' + esc(l[0]) + '</span><span class="tf-num">' + money(l[1]) + '</span></div>';
      }).join('') + '<div class="tf-check-row is-total"><span>Business</span><span class="tf-num">' +
        money(both.businessTax) + '</span></div>';
    }
  }

  /* The state comparison. Every selected state is repriced on the SAME pre-tax
     basket, which is why the spend segment is identical in every row and only
     tax and remaining move. */
  function renderCompare(base, years) {
    var host = el('[data-rank]');
    if (!host) return;
    var i = STATE.year3;
    var which = STATE.scenarioCompare;

    var keys = STATE_KEYS.filter(function (k) { return STATE.compare[k]; });
    if (keys.indexOf(base.key) === -1) keys.push(base.key);

    var all = STATE_KEYS.map(function (k) {
      var y = Object.assign({}, years[i]);
      var s = scenario(y, k, which);
      return { key: k, s: s };
    }).sort(function (a, b) { return b.s.remaining - a.s.remaining; });

    var rankOf = {};
    all.forEach(function (r, n) { rankOf[r.key] = n + 1; });

    var shown = all.filter(function (r) { return keys.indexOf(r.key) !== -1; });
    var home = all.filter(function (r) { return r.key === base.key; })[0];
    /* RANK 1 IS ALWAYS SHOWN, selected or not. A ranking that opens at rank 4
       because that is what happened to be ticked tells the reader where they
       came in a race whose winner they cannot see. It is marked as the best
       available so it is not mistaken for one of their own picks. */
    var best = all[0];
    var bestIsExtra = (best.key !== base.key) &&
                      !shown.some(function (r) { return r.key === best.key; });

    var span = shown.reduce(function (m, r) {
      return Math.max(m, r.s.spend + Math.abs(r.s.tax) + Math.abs(r.s.remaining));
    }, 1);

    function row(r, isHome, mark) {
      var s = r.s;
      var seg = function (v, role) {
        var w = Math.max(0, (Math.abs(v) / span) * 100);
        return w < 0.2 ? '' : '<i style="width:' + w.toFixed(1) + '%;background:' + SEG[role] + '"></i>';
      };
      var name = esc(ST[r.key].n) + (mark === 'best' ? ' <span class="tf-rank-best">best</span>' : '');
      return '<div class="tf-rank-row' + (isHome ? ' is-home' : '') + (mark === 'best' ? ' is-best' : '') + '">' +
        '<div class="tf-rank-num">' + rankOf[r.key] + '</div>' +
        '<div class="tf-rank-name">' + (isHome ? '<strong>' + name + '</strong>' : name) + '</div>' +
        '<div class="tf-rank-bar">' + seg(s.spend, 'spend') + seg(s.tax, 'tax') +
          seg(s.remaining, s.remaining < 0 ? 'short' : 'remaining') + '</div>' +
        '<div class="tf-rank-amt' + (s.remaining < 0 ? ' tf-num-neg' : '') + '">' + money(s.remaining) + '</div></div>';
    }

    var out = row(home, true) +
      '<div class="tf-rank-sep">— your state, ' + ordinal(rankOf[base.key]) + ' of ' + all.length + ' —</div>';

    if (bestIsExtra) {
      out += row(best, false, 'best') +
             '<div class="tf-rank-sep">— best of all ' + all.length + ', shown whether or not you picked it —</div>';
    }

    out += shown.filter(function (r) { return r.key !== base.key; })
                .map(function (r) { return row(r, false, r.key === best.key ? 'best' : ''); }).join('');

    host.innerHTML = out;

    /* The key, built from the rows actually drawn. "Remaining" and "Short" are
       two different reds — the bars have always drawn them that way, and a
       fixed legend claimed only the positive one, so in a scenario where every
       state ran short the key matched nothing on screen. */
    var legend = el('[data-rank-legend]');
    if (legend) {
      var drawn = shown.concat([home]).concat(bestIsExtra ? [best] : []);
      var anyPos = drawn.some(function (r) { return r.s.remaining >= 0; });
      var anyNeg = drawn.some(function (r) { return r.s.remaining < 0; });
      var keys = [key('spend', 'Spend'), key('tax', 'Tax')];
      if (anyPos) keys.push(key('remaining', 'Remaining'));
      if (anyNeg) keys.push(key('short', 'Short &mdash; spend and tax exceed income'));
      legend.innerHTML = keys.join('');
    }
  }

  function ordinal(n) {
    var s = ['th', 'st', 'nd', 'rd'], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  /* --- Step 4 -------------------------------------------------------------
     THE TABLE IS SCENARIO-INVARIANT. It carries five dollar columns and
     nothing else, so it can never disagree with the chart above it whatever
     the toggle says. The two share columns that used to sit at its right-hand
     end have moved into the summary block below, which renders only in the
     job + business scenario — the only one where a business SHARE means
     anything. See the build note in the commit message. */
  function renderOutlook(base, projections) {
    var which = STATE.scenarioOutlook;
    var okey = el('#o-state') ? el('#o-state').value : base.key;
    var years = buildYears(base);
    var proj = years.map(function (y) { return scenario(y, okey, which); });

    var chart = outlookChart(proj, which);
    var host = el('[data-outlook-chart]');
    if (host) host.innerHTML = chart.svg;

    /* Same treatment as the comparison list: a scenario that runs short draws
       a different red, so the key follows the data rather than asserting a
       fixed three. */
    var oLeg = el('[data-outlook-legend]');
    if (oLeg) {
      var keys = [key('spend', 'Spend'), key('tax', 'Tax')];
      if (proj.some(function (r) { return r.remaining >= 0; })) keys.push(key('remaining', 'Remaining'));
      if (proj.some(function (r) { return r.remaining < 0; })) keys.push(key('short', 'Short &mdash; spend and tax exceed income'));
      oLeg.innerHTML = keys.join('');
    }

    var tbl = el('[data-outlook-table]');
    if (tbl) {
      tbl.innerHTML = proj.map(function (s, i) {
        return '<tr><td>' + (i + 1) + '</td>' +
          '<td class="tf-num">' + money(s.income) + '</td>' +
          '<td class="tf-num">' + money(s.spend) + '</td>' +
          '<td class="tf-num">' + money(s.tax) + '</td>' +
          '<td class="tf-num' + (s.remaining < 0 ? ' tf-num-neg' : '') + '">' + money(s.remaining) + '</td></tr>';
      }).join('');
    }

    var box = el('[data-outlook-summary]');
    if (!box) return;
    if (which !== 'both') {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    var sh = shares(proj);
    var strip = sh.rows.map(function (r, i) {
      var mark = ((sh.sustained || sh.crossover) === i + 1) ? ' class="tf-hilite-mark"' : '';
      return '<tr' + mark + '><td>Year ' + (i + 1) + '</td><td class="tf-num">' + pct(r.shareIncome) +
             '</td><td class="tf-num">' + pct(r.shareTax) + '</td></tr>';
    }).join('');

    var sentence;
    if (!sh.crossover) {
      sentence = 'Business % of tax stays at or below business % of income across all five years, ' +
        'so there is no crossover to act on inside this horizon.';
    } else if (sh.sustained === sh.crossover) {
      sentence = 'Business % of tax first runs ahead of business % of income in <strong>Year ' + sh.crossover +
        '</strong>, and stays ahead — from there, each business dollar costs more tax than a wage dollar does, ' +
        'and that is the point to start considering tax optimization.';
    } else if (sh.sustained) {
      sentence = 'Business % of tax first runs ahead of business % of income in <strong>Year ' + sh.crossover +
        '</strong>, falls back below it, then stays ahead from <strong>Year ' + sh.sustained + '</strong>. ' +
        'The early crossing is self-employment tax landing on a small profit at full rate; ' +
        'Year ' + sh.sustained + ' is the one to plan around, and the point to start considering tax optimization.';
    } else {
      sentence = 'Business % of tax runs ahead of business % of income in <strong>Year ' + sh.crossover +
        '</strong> but is back below it by Year 5, so there is no settled crossover inside this horizon to act on.';
    }

    box.innerHTML =
      '<h3>The business share</h3>' +
      '<div class="tf-data-table"><table><thead><tr><th>Year</th>' +
      '<th class="tf-num">Business % of income</th><th class="tf-num">Business % of tax</th></tr></thead><tbody>' +
      strip + '</tbody></table></div>' +
      '<p class="tf-explain-note">' + sentence + '</p>';
  }

  /* --- Step 5: generated from the dataset ---------------------------------- */
  var PROV_LABEL = {
    checked: 'Checked against source',
    conflict: 'Sources disagree',
    plain: 'Not independently checked'
  };

  function renderSources(base) {
    var host = el('[data-sources-table]');
    if (!host) return;
    var rows = sourceRows(base.key);

    host.innerHTML = rows.map(function (r) {
      var prov = r[2] || 'plain';
      var note = r[3] ? '<span class="tf-source-conflict">' + esc(r[3]) + '</span>' : '';
      /* A row either LINKS to the document its figure came from, or says
         outright that no published source exists. An approximate link would be
         worse than none: it lends a figure authority it does not have. */
      var link = r[4];
      var cite = '';
      if (link && link.none) {
        cite = '<span class="tf-source-link is-none">' + esc(link.label) + '</span>';
      } else if (link) {
        cite = '<a class="tf-source-link" href="' + esc(link.href) + '" target="_blank" rel="noopener">' +
               esc(link.label) + '</a>';
      }
      return '<tr><td>' + esc(r[0]) + '</td>' +
             '<td>' + esc(r[1]) + note + cite + '</td>' +
             '<td><span class="tf-prov tf-prov-' + prov + '">' + PROV_LABEL[prov] + '</span></td></tr>';
    }).join('');

  }

  /* ========================================================================
     17. RECALCULATE — one entry point

     Everything the page shows is derived from the inputs on every change.
     There is no cached model and nothing stored between visits.
     ======================================================================== */

  var LAST = null;

  /* Every panel's data region, and the prompt each shows before a state is
     picked. Step 1 keeps its FORM — the reader can fill it in in any order —
     but its derived readouts go to an em dash, because each of them already
     depends on a sales-tax rate. */
  var AWAIT_MSG = 'Choose your home state in Step 1. Every rate on this page is state-specific, so there is nothing to show until then.';

  function renderAwaitingState() {
    /* Display slots only. A <select> can carry data-var too — the filing
       status does — and writing textContent to one DESTROYS ITS OPTIONS,
       which emptied the filing dropdown the moment the page opened without a
       state. Form controls hold their own value and are never a display slot. */
    els('[data-var]').forEach(function (e) {
      if (e.tagName === 'SELECT' || e.tagName === 'INPUT' || e.tagName === 'TEXTAREA') return;
      e.textContent = '—';
    });
    els('[data-await]').forEach(function (e) { e.hidden = false; });
    els('[data-needs-state]').forEach(function (e) { e.hidden = true; });
    els('[data-row]').forEach(function (e) { e.hidden = true; });
  }

  function clearAwaitingState() {
    els('[data-await]').forEach(function (e) { e.hidden = true; });
    els('[data-needs-state]').forEach(function (e) { e.hidden = false; });
  }

  function recalc() {
    var base = readBase();

    if (!base.key) {
      renderInflationRate();
      renderAwaitingState();
      LAST = null;
      return;
    }
    clearAwaitingState();

    var years = buildYears(base);

    var projections = {
      job: years.map(function (y) { return scenario(y, base.key, 'job'); }),
      both: years.map(function (y) { return scenario(y, base.key, 'both'); }),
      business: years.map(function (y) { return scenario(y, base.key, 'business'); })
    };

    LAST = { base: base, years: years, projections: projections };

    renderInflationRate();
    renderBase(base, years);
    renderIncomeStep(base, projections);
    renderAfterTax(base, projections);
    renderCompare(base, years);
    renderOutlook(base, projections);
    renderSources(base);
  }

  /* ========================================================================
     18. PDF — a real file via jsPDF, matching tool-001 and tool-002

     SCOPE.md §3 takes the jsPDF + autoTable CDN exception by name, listing the
     pages that consume it; this page was added to that list in the same change
     that added this code. If the CDN is blocked or an SRI hash fails,
     window.jspdf is simply undefined and this falls back to window.print(),
     whose stylesheet paginates the same way — so the button is never dead.
     ======================================================================== */

  function stamp() {
    var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
           ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  window.addEventListener('beforeprint', function () {
    var e = el('[data-byline-date]');
    if (e) e.textContent = ' | printed on ' + stamp();
  });

  /* The page's own text, never restated here: editing the markup changes the
     PDF in the same edit. Empty string rather than a stale fallback. */
  function headText(sel) {
    var e = document.querySelector('.tf-tool-content ' + sel);
    return e ? e.textContent.trim() : '';
  }
  function legalParagraphs() {
    var block = el('[data-tool-legal]');
    if (!block) return [];
    return [].map.call(block.querySelectorAll('p:not(.tf-meta)'), function (p) {
      return p.textContent.trim();
    }).filter(Boolean);
  }

  /* Presented-by byline, drawn from the logo's REAL geometry — three rounded
     rects in a 100-unit viewBox starting at y=8.5. Same line the screen and
     print byline render; the two are commented as a PAIR here, in the markup
     and in STYLE.css. */
  function drawByline(doc, margin, y, right) {
    var K = 18 / 100, oy = y;
    function bar(x, yy, w, h, c) {
      doc.setFillColor(c[0], c[1], c[2]);
      doc.roundedRect(margin + x * K, oy + (yy - 8.5) * K, w * K, h * K, 4 * K, 4 * K, 'F');
    }
    bar(21, 42, 16, 43, [38, 34, 31]);      // --tf-ink
    bar(42, 32, 16, 53, [194, 41, 27]);     // --tf-brick
    bar(63, 52, 16, 33, [184, 173, 165]);   // --tf-stone
    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(85, 80, 77);
    doc.text('Presented by Three Flows Solutions | printed on ' + stamp(), margin + 26, oy + 13);
    var ry = oy + 22;
    doc.setDrawColor(221, 214, 207).setLineWidth(1);
    doc.line(margin, ry, right, ry);
    return ry + 24;
  }

  function writeWrapped(doc, text, x, y, maxWidth, lineHeight) {
    var lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * lineHeight;
  }

  function svgToPng(svgMarkup, width, height, scale) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        try {
          var canvas = document.createElement('canvas');
          canvas.width = Math.round(width * scale);
          canvas.height = Math.round(height * scale);
          var ctx = canvas.getContext('2d');
          ctx.fillStyle = (getComputedStyle(document.documentElement)
            .getPropertyValue('--tf-paper') || '#FCFBFA').trim();
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/png'));
        } catch (e) { reject(e); }
      };
      img.onerror = function () { reject(new Error('SVG rasterization failed')); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgMarkup);
    });
  }

  function stampPageNumbers(doc) {
    var n = doc.internal.getNumberOfPages();
    var w = doc.internal.pageSize.getWidth();
    var h = doc.internal.pageSize.getHeight();
    for (var i = 1; i <= n; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(85, 80, 77);
      doc.text('Page ' + i + ' of ' + n, w / 2, h - 20, { align: 'center' });
    }
  }

  function buildPdf() {
    var Ctor = window.jspdf && window.jspdf.jsPDF;
    if (!Ctor || !LAST) { window.print(); return; }

    var base = LAST.base, projections = LAST.projections;
    var doc = new Ctor({ unit: 'pt', format: 'a4', compress: true });
    var margin = 34, width = doc.internal.pageSize.getWidth(), inner = width - margin * 2;
    var ink = [38, 34, 31], inkSoft = [85, 80, 77], sand = [229, 223, 215];

    var y = drawByline(doc, margin, margin, width - margin);
    doc.setFont('times', 'bold').setFontSize(20).setTextColor.apply(doc, ink);
    doc.text(headText('h1'), margin, y); y += 18;
    doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor.apply(doc, ink);
    y = writeWrapped(doc, headText('.tf-prose-intro'), margin, y, inner, 13); y += 10;

    doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor.apply(doc, inkSoft);
    doc.text(headText('[data-tool-legal] .tf-meta'), margin, y); y += 10;
    doc.setFont('helvetica', 'normal');
    legalParagraphs().forEach(function (p) { y = writeWrapped(doc, p, margin, y, inner, 10) + 5; });
    y += 6;

    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor.apply(doc, inkSoft);
    y = writeWrapped(doc, ST[base.key].n + ' · ' + base.filingLabel + ' · ' +
      (base.election === 's-corp' ? 'S-corp election' : 'Owner-run'), margin, y, inner, 11) + 8;

    /* ---- Step 1: what was entered -------------------------------------
       The PDF previously opened straight onto Step 3's arithmetic, so a saved
       copy recorded the ANSWER without the inputs that produced it — unusable
       as a record, and impossible to check months later. Every step is carried
       now, in the order the page presents them. */
    var yrs = LAST.years, y1 = yrs[0];
    var P1 = businessProfit(y1.biz, base.election, ST[base.key]);
    var enteredTotal = 0;
    BUCKETS.forEach(function (b) { enteredTotal += num(base.entered[b.id]); });
    var preTax = basketTotal(y1.basket);

    function table(title, head, body, opts) {
      opts = opts || {};
      if (opts.newPage) { doc.addPage(); y = margin; }
      if (title) {
        doc.setFont('times', 'bold').setFontSize(opts.big ? 14 : 11).setTextColor.apply(doc, ink);
        doc.text(title, margin, y);
        y += opts.big ? 14 : 11;
      }
      doc.autoTable({
        startY: y, margin: { left: margin, right: margin },
        head: head ? [head] : undefined, body: body,
        styles: { font: 'helvetica', fontSize: 8, cellPadding: 3.5, textColor: ink,
                  lineColor: sand, lineWidth: 0.5, valign: 'top' },
        headStyles: { fillColor: false, textColor: inkSoft, fontStyle: 'bold', lineColor: sand },
        columnStyles: opts.columnStyles || {}
      });
      y = doc.lastAutoTable.finalY + 16;
      return y;
    }

    var rightNum = { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } };

    doc.addPage(); y = margin;
    doc.setFont('times', 'bold').setFontSize(14).setTextColor.apply(doc, ink);
    doc.text('Step 1 — Your Base Year', margin, y); y += 18;

    table('Where you are', null, [
      ['Home state', ST[base.key].n],
      ['Filing status', base.filingLabel],
      ['Dependents', String(Math.round(base.dependents))],
      ['How the business is taxed', base.election === 's-corp' ? 'S-corp' : 'Owner-run']
    ], { columnStyles: { 0: { cellWidth: 170, fontStyle: 'bold' } } });

    table('Employment income and home', null, [
      ['W-2 wages', moneyPlain(base.wages)],
      ['1099 / contract income', moneyPlain(base.contract)],
      ['Home value', base.homeValue ? moneyPlain(base.homeValue) : 'Not owned']
    ], { columnStyles: { 0: { cellWidth: 170, fontStyle: 'bold' }, 1: { halign: 'right' } } });

    table('Household spend, as entered', ['Bucket', 'Amount'],
      BUCKETS.map(function (b) { return [b.label, moneyPlain(num(base.entered[b.id]))]; }).concat([
        ['Total as entered', moneyPlain(enteredTotal)],
        ['Sales tax inside it', moneyPlain(-(enteredTotal - preTax))],
        ['Pre-tax household spend', moneyPlain(preTax)]
      ]),
      { columnStyles: { 0: { cellWidth: 200 }, 1: { halign: 'right' } } });

    table('Business', ['Line', 'Amount'], [
      ['Total revenue for the year', moneyPlain(P1.revenue)],
      ['Less goods, wages and operating expenses', moneyPlain(-P1.costsBeforeDep)],
      ['Operating earnings (EBITDA)', moneyPlain(P1.ebitda)],
      ['Less depreciation and loan interest', moneyPlain(-P1.depreciation)],
      ['Business profit, before tax', moneyPlain(P1.net)]
    ], { columnStyles: { 0: { cellWidth: 200 }, 1: { halign: 'right' } } });

    /* ---- Step 2: the five-year inputs ---------------------------------- */
    table('Step 2 — Income Before Tax', ['Year', 'W-2 wages', '1099 / contract', 'Household spend', 'Business revenue', 'Business costs'],
      (YEAR_INPUTS || []).map(function (r, n) {
        return [String(n + 1), moneyPlain(r.wages), moneyPlain(r.contract),
                moneyPlain(r.spend), moneyPlain(r.revenue), moneyPlain(r.costs)];
      }),
      { newPage: true, big: true,
        columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' },
                        4: { halign: 'right' }, 5: { halign: 'right' } } });
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor.apply(doc, inkSoft);
    y = writeWrapped(doc, 'Year 1 comes from Step 1. Years 2 to 5 are placeholders on a plain growth curve unless overwritten; household spend is grown at ' +
      (HOUSEHOLD_SPEND_INFLATION * 100).toFixed(1) + '% a year.', margin, y, inner, 10) + 12;

    /* ---- Step 3: the arithmetic, and where the tax goes ---------------- */
    var i = STATE.year3;
    var job = projections.job[i], both = projections.both[i], biz = projections.business[i];

    table('Step 3 — The Tax Impact', ['Year ' + (i + 1) + ', ' + ST[base.key].n, 'Job only', 'Job + business', 'Business only'], [
      ['Income'].concat([job, both, biz].map(function (x) { return moneyPlain(x.income); })),
      ['Spend'].concat([job, both, biz].map(function (x) { return moneyPlain(-x.spend); })),
      ['Tax'].concat([job, both, biz].map(function (x) { return moneyPlain(-x.tax); })),
      ['Remaining'].concat([job, both, biz].map(function (x) { return moneyPlain(x.remaining); }))
    ], { newPage: true, big: true, columnStyles: Object.assign({ 0: { fontStyle: 'bold' } }, rightNum) });

    /* The two ledgers, carrying the SAME dynamic-label rules as the page: a
       state with no income tax loses that line rather than showing $0. */
    var pl = both.personal, bl = both.business;
    var persRows = [['Federal income tax', moneyPlain(pl.fed)],
                    ['Social Security & Medicare', moneyPlain(pl.fica)]];
    if (LABELS.hasStateIncomeTax(base.key)) persRows.push(['State income tax', moneyPlain(pl.state)]);
    persRows.push(['Property tax', moneyPlain(pl.property)]);
    if (LABELS.hasSalesTax(base.key)) persRows.push(['Sales tax', moneyPlain(pl.sales)]);
    persRows.push(['Personal total', moneyPlain(both.personalTax)]);
    table('Where the tax goes — personal', ['Line', 'Amount'], persRows,
      { columnStyles: { 0: { cellWidth: 240 }, 1: { halign: 'right' } } });

    var busRows = [[base.election === 's-corp' ? 'Payroll tax on your salary' : 'Self-employment tax', moneyPlain(bl.se)],
                   ['Federal income tax on profit', moneyPlain(bl.fed)]];
    if (LABELS.hasStateIncomeTax(base.key)) busRows.push(['State income tax on profit', moneyPlain(bl.state)]);
    var entL = LABELS.entity(base.key, base.election);
    if (entL.present) busRows.push([entL.label, moneyPlain(bl.entity)]);
    var grL = LABELS.grossReceipts(base.key, both.full.profit.revenue);
    if (grL.present) busRows.push([grL.label, moneyPlain(bl.gross)]);
    busRows.push(['Business total (incremental)', moneyPlain(both.businessTax)]);
    table('Where the tax goes — business', ['Line', 'Amount'], busRows,
      { columnStyles: { 0: { cellWidth: 240 }, 1: { halign: 'right' } } });

    /* ---- Step 3: the state comparison --------------------------------- */
    var cmpKeys = STATE_KEYS.filter(function (k) { return STATE.compare[k]; });
    if (cmpKeys.indexOf(base.key) === -1) cmpKeys.push(base.key);
    var ranked = STATE_KEYS.map(function (k) {
      return { key: k, s: scenario(Object.assign({}, yrs[i]), k, STATE.scenarioCompare) };
    }).sort(function (a, b) { return b.s.remaining - a.s.remaining; });
    var rankIdx = {};
    ranked.forEach(function (r, n) { rankIdx[r.key] = n + 1; });
    var cmpRows = ranked.filter(function (r) {
      return cmpKeys.indexOf(r.key) !== -1 || r.key === ranked[0].key;
    }).map(function (r) {
      return [String(rankIdx[r.key]),
              ST[r.key].n + (r.key === base.key ? ' (your state)' : '') + (r.key === ranked[0].key ? ' — best' : ''),
              moneyPlain(r.s.spend), moneyPlain(r.s.tax), moneyPlain(r.s.remaining)];
    });
    table('How your home state compares — after-tax take-home', ['Rank', 'State', 'Spend', 'Tax', 'After-tax take-home'], cmpRows,
      { newPage: true, big: true, columnStyles: Object.assign({ 0: { cellWidth: 34, halign: 'right' } }, { 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } }) });

    var chart = outlookChart(projections[STATE.scenarioOutlook], STATE.scenarioOutlook);
    var drawW = inner, drawH = chart.height * (drawW / chart.width);
    var scale = Math.min(3, Math.max(0.5, (drawW * 2) / chart.width));

    svgToPng(resolveTokens(chart.svg), chart.width, chart.height, scale).then(function (png) {
      doc.addPage();
      var y2 = margin;
      doc.setFont('times', 'bold').setFontSize(14).setTextColor.apply(doc, ink);
      doc.text('Step 4 — Surplus After Tax', margin, y2); y2 += 14;
      doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor.apply(doc, inkSoft);
      doc.text(ST[el('#o-state') && ST[el('#o-state').value] ? el('#o-state').value : base.key].n +
        ' · ' + scenarioWords(STATE.scenarioOutlook), margin, y2); y2 += 12;
      doc.addImage(png, 'PNG', margin, y2, drawW, drawH);
      return y2 + drawH + 16;
    }, function () {
      doc.addPage();
      return margin;
    }).then(function (yAfter) {
      var proj = projections[STATE.scenarioOutlook];
      doc.autoTable({
        startY: yAfter, margin: { left: margin, right: margin },
        head: [['Year', 'Income', 'Spend', 'Tax', 'Remaining']],
        body: proj.map(function (s, n) {
          return [String(n + 1), moneyPlain(s.income), moneyPlain(s.spend), moneyPlain(s.tax), moneyPlain(s.remaining)];
        }),
        styles: { font: 'helvetica', fontSize: 8, cellPadding: 4, textColor: ink, lineColor: sand, lineWidth: 0.5 },
        headStyles: { fillColor: false, textColor: inkSoft, fontStyle: 'bold', lineColor: sand },
        columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } }
      });

      /* The business share, and the crossover — the point of Step 4, and it
         was absent from the saved copy entirely. */
      var sh = shares(proj);
      if (STATE.scenarioOutlook === 'both') {
        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 16, margin: { left: margin, right: margin },
          head: [['Year', 'Business % of income', 'Business % of tax']],
          body: sh.rows.map(function (r, n) {
            return ['Year ' + (n + 1), pct(r.shareIncome), pct(r.shareTax)];
          }),
          styles: { font: 'helvetica', fontSize: 8, cellPadding: 3.5, textColor: ink, lineColor: sand, lineWidth: 0.5 },
          headStyles: { fillColor: false, textColor: inkSoft, fontStyle: 'bold', lineColor: sand },
          columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } }
        });
        var yS = doc.lastAutoTable.finalY + 12;
        doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor.apply(doc, inkSoft);
        var line = sh.crossover
          ? (sh.sustained === sh.crossover
              ? 'Business % of tax first runs ahead of business % of income in Year ' + sh.crossover + ', and stays ahead.'
              : (sh.sustained
                  ? 'Business % of tax first runs ahead in Year ' + sh.crossover + ', falls back, then stays ahead from Year ' + sh.sustained + '.'
                  : 'Business % of tax runs ahead in Year ' + sh.crossover + ' but is back below by Year 5.'))
          : 'Business % of tax stays at or below business % of income across all five years.';
        writeWrapped(doc, line, margin, yS, inner, 10);
      }

      doc.addPage();
      var y3 = margin;
      doc.setFont('times', 'bold').setFontSize(14).setTextColor.apply(doc, ink);
      doc.text('Step 5 — Assumptions and sources', margin, y3);
      doc.autoTable({
        startY: y3 + 12, margin: { left: margin, right: margin },
        head: [['Input', 'Source, and what we assumed', 'Provenance']],
        body: sourceRows(base.key).map(function (r) {
          var src = r[1];
          if (r[3]) src += '  ' + r[3];
          if (r[4]) src += '  ' + (r[4].none ? r[4].label : r[4].label + ' — ' + r[4].href);
          return [r[0], src, PROV_LABEL[r[2] || 'plain']];
        }),
        styles: { font: 'helvetica', fontSize: 7, cellPadding: 3, textColor: ink, lineColor: sand, lineWidth: 0.5, valign: 'top' },
        headStyles: { fillColor: false, textColor: inkSoft, fontStyle: 'bold', lineColor: sand },
        columnStyles: { 0: { cellWidth: 130 }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 72 } }
      });

      stampPageNumbers(doc);
      doc.save('overall-tax-estimator-' + base.key.toLowerCase() + '.pdf');
    })['catch'](function (err) {
      /* The fallback is deliberate — the button must always do something — but
         a SILENT fallback turns a real bug into a print dialog and hides it.
         The warning costs nothing and is the only trace a failure leaves. */
      if (window.console && console.warn) console.warn('PDF build failed, falling back to print:', err);
      window.print();
    });
  }

  /* ========================================================================
     19. SHELL WIRING — steps, derived labels, show/hide

     Unchanged in substance from the shell pass: the rail tablist, the panels,
     the pager and the URL hash are ONE state, and the step number is authored
     once in the rail with the eyebrow and both pager labels read off it.
     ======================================================================== */

  var tabs = els('[role="tab"]');
  var panels = els('[data-tool-panel]');
  var pager = el('[data-step-pager]');
  var prevLink = pager && pager.querySelector('[data-pager-prev]');
  var nextLink = pager && pager.querySelector('[data-pager-next]');

  function stepLabel(tab) {
    var n = tab.querySelector('.tf-step-nav-num');
    return n ? n.textContent.trim() : '';
  }

  function activate(index, focus) {
    if (index < 0 || index >= tabs.length) return;
    tabs.forEach(function (t, i) {
      var on = i === index;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach(function (p) { p.hidden = true; });
    var active = el('#' + tabs[index].getAttribute('aria-controls'));
    if (active) {
      active.hidden = false;
      var eyebrow = active.querySelector('[data-step-eyebrow]');
      if (eyebrow) eyebrow.textContent = stepLabel(tabs[index]);
    }
    writePager(index);
    if (focus) tabs[index].focus();
    var id = tabs[index].getAttribute('data-tab');
    if (id && window.history && history.replaceState) history.replaceState(null, '', '#' + id);
  }

  function writePager(index) {
    if (!prevLink || !nextLink) return;
    var last = tabs.length - 1;
    if (index > 0) {
      prevLink.textContent = '← ' + stepLabel(tabs[index - 1]);
      prevLink.href = '#' + tabs[index - 1].getAttribute('data-tab');
      prevLink.classList.remove('is-disabled');
    } else {
      prevLink.textContent = '← ' + stepLabel(tabs[0]);
      prevLink.removeAttribute('href');
      prevLink.classList.add('is-disabled');
    }
    if (index < last) {
      nextLink.textContent = stepLabel(tabs[index + 1]) + ' →';
      nextLink.href = '#' + tabs[index + 1].getAttribute('data-tab');
      nextLink.classList.remove('is-disabled');
    } else {
      nextLink.textContent = stepLabel(tabs[last]) + ' →';
      nextLink.removeAttribute('href');
      nextLink.classList.add('is-disabled');
    }
  }

  function indexOfTab(id) {
    for (var i = 0; i < tabs.length; i++) if (tabs[i].getAttribute('data-tab') === id) return i;
    return -1;
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { activate(i, false); });
    tab.addEventListener('keydown', function (e) {
      var n = -1;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = (i + 1) % tabs.length;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = tabs.length - 1;
      if (n >= 0) { e.preventDefault(); activate(n, true); }
    });
  });

  if (pager) {
    pager.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      e.preventDefault();
      var i = indexOfTab(link.getAttribute('href').slice(1));
      if (i >= 0) activate(i, false);
    });
  }

  /* Entity election. The owner W-2 salary field EXISTS ONLY under S-corp — a
     an owner-run business cannot put its owner on payroll — so the row is removed
     rather than disabled, and the draws footnote takes its place. */
  function applyElection() {
    var scorp = el('[data-election="s-corp"]');
    var on = !!(scorp && scorp.checked);
    var ownerRow = el('[data-owner-salary-row]');
    var drawsNote = el('[data-draws-note]');
    if (ownerRow) ownerRow.hidden = !on;
    if (drawsNote) drawsNote.hidden = on;
  }

  /* ========================================================================
     20. EVENT WIRING
     ======================================================================== */

  root.addEventListener('input', function (e) {
    var t = e.target;
    if (t.hasAttribute && t.hasAttribute('data-picker-filter')) {
      pickerFilter = t.value;
      fillStatePicker();
      return;
    }
    if (t.classList && t.classList.contains('tf-year-input')) {
      var yi = parseInt(t.getAttribute('data-year'), 10);
      var col = t.getAttribute('data-col');
      if (YEAR_INPUTS && YEAR_INPUTS[yi]) YEAR_INPUTS[yi][col] = num(t.value);
      EDITED[yi + '.' + col] = true;
      t.classList.remove('is-placeholder');
      recalc();
      return;
    }
    if (t.hasAttribute && t.hasAttribute('data-money')) {
      t.classList.remove('is-placeholder');
      delete t.dataset.suggested;
      renderYearTable(readBase());
      recalc();
    }
  });

  /* Regroup on BLUR, never while typing: reformatting under a live caret
     moves it, and a reader mid-number loses their place. The value is parsed
     comma-blind either way, so what is on screen and what the engine reads
     cannot diverge. */
  /* A PLACEHOLDER CLEARS WHEN YOU ENTER IT. Greying the figure says "this is a
     suggestion"; leaving it in the box means the reader has to select and
     delete someone else's number before typing their own, and any character
     they type lands beside it. Focus empties the cell; leaving it empty puts
     the suggestion back, so nothing is lost by looking. */
  /* AFFIRMING THE PRE-SELECTED FILING STATUS.
     A <select> fires `change` only when the value actually MOVES, so choosing
     the option that is already selected fires nothing at all — and the
     pre-selected option is "Married filing jointly", the likeliest answer for
     the household this tool is built for. The result was that the one status
     most readers want was the one they could not confirm: it stayed muted
     until they picked something else and came back.
     Interaction is the right signal rather than value change. Opening the
     control is a deliberate act on a question the reader has now engaged with,
     and whatever they leave it on is their answer. Bound to pointerdown and to
     the keys that open a native select, so mouse and keyboard behave alike;
     Tab alone is not an answer and is excluded. */
  function affirmFiling(e) {
    var sel = e.target.closest && e.target.closest('#b-filing');
    if (!sel || !sel.classList.contains('is-placeholder')) return;
    if (e.type === 'keydown' && (e.key === 'Tab' || e.shiftKey && e.key === 'Tab')) return;
    sel.classList.remove('is-placeholder');
  }
  root.addEventListener('pointerdown', affirmFiling);
  root.addEventListener('keydown', affirmFiling);

  root.addEventListener('focusin', function (e) {
    var t = e.target;
    if (!t || t.tagName !== 'INPUT') return;
    if (!t.classList.contains('is-placeholder')) return;
    t.dataset.suggested = t.value;
    t.value = '';
  });

  root.addEventListener('focusout', function (e) {
    var t = e.target;
    if (!t || !t.tagName || t.tagName !== 'INPUT') return;
    if (!t.hasAttribute('data-money') && !t.classList.contains('tf-year-input')) return;
    /* Left without typing: the suggestion goes back, still grey. */
    if (t.value.trim() === '') {
      if (t.dataset.suggested !== undefined) {
        t.value = t.dataset.suggested;
        delete t.dataset.suggested;
      }
      return;
    }
    delete t.dataset.suggested;
    t.value = grouped(t.value);
  });

  root.addEventListener('change', function (e) {
    var t = e.target;
    if (t.matches && t.matches('[data-election]')) { applyElection(); renderYearTable(readBase()); recalc(); return; }
    if (t.id === 'b-state' || t.id === 'b-filing') {
      /* The home select's muting is VALUE-driven — muted whenever no real
         state is held — so it is re-derived here and needs no interaction
         tracking. The filing status is different and is handled on
         interaction instead; see the pointerdown/keydown listener below. */
      t.classList.toggle('is-placeholder', t.id === 'b-state' && !ST[t.value]);
      if (t.id === 'b-state' && !STATE.outlookStateTouched) {
        var o = el('#o-state');
        if (o) o.value = t.value;
      }
      if (t.id === 'b-state') fillStatePicker();
      renderYearTable(readBase());
      recalc();
      return;
    }
    if (t.id === 'o-state') { STATE.outlookStateTouched = true; recalc(); return; }
    if (t.id === 't-year') { STATE.year3 = t.selectedIndex; recalc(); return; }
    if (t.closest && t.closest('#state-picker')) {
      STATE.compare[t.value] = t.checked;
      fillStatePicker();
      recalc();
      return;
    }
    if (t.tagName === 'SELECT' || t.type === 'checkbox' || t.type === 'radio') recalc();
  });

  root.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-scenario]');
    if (btn) {
      var group = btn.closest('[data-scenario-group]');
      if (group) {
        var name = group.getAttribute('data-scenario-group');
        group.querySelectorAll('[data-scenario]').forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        var which = btn.getAttribute('data-scenario');
        if (name === 'income') STATE.scenarioIncome = which;
        else if (name === 'compare') STATE.scenarioCompare = which;
        else if (name === 'outlook') STATE.scenarioOutlook = which;
        recalc();
      }
      return;
    }
    var all = e.target.closest('[data-picker-all]'), none = e.target.closest('[data-picker-none]');
    if (all || none) {
      var on = !!all;
      /* Scoped to what the filter is currently SHOWING. With a filter active,
         "All" meaning all fifty-one would silently select states the reader
         cannot see; against an empty filter the two are the same thing. */
      var q = pickerFilter.trim().toLowerCase();
      STATE_KEYS.forEach(function (k) {
        if (!q || ST[k].n.toLowerCase().indexOf(q) !== -1) STATE.compare[k] = on;
      });
      fillStatePicker();
      recalc();
      return;
    }
    if (e.target.closest('[data-pdf]')) { buildPdf(); return; }
    if (e.target.closest('[data-reset]')) {
      els('input, select').forEach(function (x) {
        if (x.type === 'checkbox' || x.type === 'radio') x.checked = x.defaultChecked;
        else if (x.tagName === 'SELECT') {
          Array.prototype.slice.call(x.options).forEach(function (o) { o.selected = o.defaultSelected; });
          /* Back to a pre-selected default, so it is muted again. Only the
             filing status has one; the state selects open empty or derived. */
          if (x.id === 'b-filing') x.classList.add('is-placeholder');
        } else {
          x.value = x.defaultValue;
          /* Back to a suggestion: greyed again, and cleared again on focus.
             Without this, Start over would return the values but leave them
             looking like figures the reader had entered. */
          delete x.dataset.suggested;
          if (x.hasAttribute('data-money') && x.defaultValue !== '') x.classList.add('is-placeholder');
        }
      });
      YEAR_INPUTS = null;
      EDITED = {};
      pickerFilter = '';
      STATE.year3 = 0;
      STATE.outlookStateTouched = false;
      STATE.scenarioIncome = STATE.scenarioCompare = STATE.scenarioOutlook = 'both';
      STATE.compare = {};
      DEFAULT_COMPARE.forEach(function (k) { STATE.compare[k] = true; });
      els('[data-scenario]').forEach(function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-scenario') === 'both' ? 'true' : 'false');
      });
      applyElection();
      boot();
    }
  });

  /* ========================================================================
     21. START
     ======================================================================== */

  /* A handful of states pre-selected in the comparison so Step 3 has something
     to show on arrival. Sample data, not a recommendation. */
  var DEFAULT_COMPARE = ['WY', 'NV', 'TN', 'FL', 'WA', 'TX'];

  function boot() {
    fillStateSelects();
    fillStatePicker();
    var homeSel = el('#b-state'), outSel = el('#o-state');
    /* No default home state: the reader picks one, and nothing computes until
       they do. Step 4 seeds from whatever Step 1 holds — empty at first — and
       follows it until the reader takes that control over. Testing !ST[value]
       was not enough for the Step 4 seed: the select had already been
       populated, so its value was a VALID key, the first alphabetically, and
       the seed never ran. That is how it came to open on Alabama. */
    if (outSel && !STATE.outlookStateTouched && homeSel) outSel.value = homeSel.value;
    renderYearTable(readBase());
    recalc();
  }

  DEFAULT_COMPARE.forEach(function (k) { STATE.compare[k] = true; });

  var fromHash = window.location.hash ? indexOfTab(window.location.hash.slice(1)) : -1;
  activate(fromHash >= 0 ? fromHash : 0, false);
  applyElection();
  boot();
})();
