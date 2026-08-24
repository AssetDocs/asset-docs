# Features Page Audit — Public Copy vs. Current Product

Audit only. No source files were changed.

---

## A. Executive Summary

**Verdict: structural rewrite, not copy cleanup.**

The `/features` page was written against an Asset Safe architecture that no longer exists. The dashboard now has three primary destinations (Asset Documentation, Knowledge Hub, Secure Vault). The Features page teaches none of them. It still teaches "Family Archive," "Insights & Tools," "Password and Accounts Catalog," "Quick Notes," "Asset Valuation," and "Assets" — all superseded.

Major areas of drift, by severity:

| Severity | Area | Summary |
|---|---|---|
| **P0 — Legal/compliance risk** | "Password and Accounts Catalog" card × 4 | Claims Asset Safe stores "financial account information" and offers "end-to-end encryption." Both are outside approved messaging. |
| **P0 — Legal/compliance risk** | Healthcare industry card | "patient care assets" + "Compliance and certification records" invites a HIPAA/clinical inference. |
| **P0 — Legal/compliance risk** | Insurance industry card | "faster claims processing and accurate settlements" is an outcome guarantee. |
| **P1 — Architecture drift** | Homeowners › Life Support | Uses retired "Family Archive" and "Insights & Tools" headings; Knowledge Hub is never mentioned on the page. |
| **P1 — Architecture drift** | Security & Access + Legacy Locker | Secure Vault does not appear as a rendered concept anywhere. Legacy Locker and Digital Access are presented as unrelated things; "Digital Access" appears zero times. |
| **P1 — Coverage gap** | Renters / Business / Landlords tabs | Three of four audiences get no Knowledge Hub, no Legacy Locker, no continuity content at all. |
| **P2 — Maintainability** | No shared data model | Every card is inline JSX, duplicated per tab. Four verbatim copies of the same three cards. Guarantees future drift. |
| **P2 — Terminology** | Export/Asset naming | "Export Assets" / "Assets" / "Asset Valuation" do not match live "Export Account Archive" / "Asset Documentation" / "Asset Values". |
| **P3 — Positioning** | Hero | "Complete Asset Documentation Solution" now describes one of three destinations. |

**Good news:** no stale tier names (Standard/Premium/Basic), no stale GB figures, no stale prices, and no retired role terms (administrator/contributor/viewer) appear on the page. The Authorized Users card already says "Full Access or Read Only" correctly. The Legacy Locker "What It's Not" disclaimer is exemplary and should be the model for the rest of the page.

---

## B. Current Page Architecture

| Route | Component | Notes |
|---|---|---|
| `/features` | `src/pages/Features.tsx` (640 lines) | The audit target. |
| `/features-list` | `src/components/FeaturesList.tsx` (405 lines) | Second, independent features page. Publicly indexable (`App.tsx:378`, `noIndex={false}`). Exposes tech stack and internal route map. |
| — | `src/components/FeaturesSection.tsx` | **Orphaned.** Not imported anywhere. Dead code. |

**Audience tabs** — shadcn `Tabs` at `Features.tsx:84-364`. Values: `homeowners` (86), `renters` (87), `business` (88), `landlords` (89).

**There is no shared data structure.** Each tab is hand-written inline JSX:
- Homeowners `:93-210` · Renters `:213-261` · Business `:264-312` · Landlords `:315-363`

Card component: `FeatureCard` at `:13-23`. Collapsible section wrapper: `FeatureCategory` at `:27-45`, `defaultOpen` false everywhere — **every section on the page is collapsed on load**, including all four audience tabs' content.

**Shared sections below the tabs** (`:368-616`): Core Platform Features (`:369`), Industry Applications (`:426`), Industries We Serve (`:471`), CTA banner (`:619-633`).

**Verified current product architecture** (source of truth for this audit):

- Dashboard primary destinations (`DashboardGrid.tsx:142-197`): **Asset Documentation** ("Claim-ready proof for your home and belongings"), **Knowledge Hub** ("Everyday life, organized and protected"), **Secure Vault** (amber banner, "A single encrypted space for digital access and legacy planning") whose inner card reads "Legacy Locker - Digital Access".
- Dashboard utilities (`DashboardGrid.tsx:202-308`): Documentation Checklist, MFA, Asset Values, Emergency Instructions, **Export Account Archive**, **Download All Files**, **Post Damage Report**.
- Knowledge Hub groups (`KnowledgeHubGrid.tsx:35,60,94,137`): **People & Care** (Contacts → VIP Contacts / Trusted Professionals; Medication List) · **Notes & Family** (Notes → Written / Voice; Family Traditions & Recipes; Memory Safe) · **Property & Household** (Important Locations, Paint Codes, Upgrades & Repairs, Source Websites) · **Planning** (Smart Calendar).
- Quick Notes: **retired**, redirects to Notes (`knowledgeHubNavigation.ts:15-16`).
- Manual Entry Item: an **Asset Documentation** asset type (`AssetTypeSelector.tsx:117-118`, `assetUploadRouting.ts:22-23`), not Knowledge Hub.
- Secure Vault (`SecureVault.tsx:661,759,793`): subtitle "Digital Access & Legacy Locker"; sub-sections **Digital Access** and **Legacy Locker**. **Legacy Instructions** is a distinct live label (`AccountContinuityInstructions.tsx:121`).
- Plan: single **Asset Safe Plan**, monthly / annual / gift (`asset_safe_monthly|annual|gift_annual`), **25 GB base + 25 GB add-on blocks**, **unlimited properties** (`subscriptionFeatures.ts:232-235`). No 50 GB reference exists anywhere in the repo.
- MFA: TOTP authenticator app + backup codes only.
- Roles: Authorized User · Full Access · Read Only · Legacy Admin.

---

## C. Homeowners Audit

### Property & Assets (`:102`)

| Card | Current copy | Maps to | Finding | Disposition |
|---|---|---|---|---|
| Property Documentation (`:106`) | "Complete visual inventory of your home, improvements, and possessions..." | Asset Documentation | Accurate concept, wrong name | **Rename** → Asset Documentation |
| Asset Valuation (`:115`) | "Document home improvements and upgrades to maximize property value when selling." | Two different live things | Name collides with live **Asset Values**; description actually describes **Upgrades & Repairs** | **Rewrite copy + split** |
| Assets (`:116`) | "Comprehensive asset tracking with photos, receipts, and valuations..." | Asset Documentation | Duplicates Property Documentation. "Assets" is not a live label. | **Merge** into Asset Documentation |
| Export Assets (`:117`) | "Export... to CSV, PDF, or other formats" | Export Account Archive | Wrong name; **format claim unverified** — live feature is PDF summary + ZIP, not CSV | **Rename + rewrite** |
| Download All Files (`:118`) | "Bulk download all your photos, videos, documents, and files" | Download All Files | Correct name, accurate | **Keep** |

**Missing from this section:** Asset Values, High-Value Items, Documentation Checklist, Property Profiles, Manual Entry Item (currently misfiled under Insights & Tools).

### Life Support › "Family Archive" (`:127`)

Heading is **retired terminology**. All seven cards still exist as products but under Knowledge Hub.

| Card | Live location | Disposition |
|---|---|---|
| VIP Contacts (`:130`) | Knowledge Hub › People & Care › Contacts | Keep, regroup |
| Voice Notes (`:131`) | Knowledge Hub › Notes & Family › Notes | Keep, regroup — **but duplicated at `:179`** |
| Trusted Professionals (`:132`) | Knowledge Hub › People & Care › Contacts | Keep, regroup |
| Notes (`:133`) | Knowledge Hub › Notes & Family | Keep, regroup |
| Family Traditions (`:134`) | Knowledge Hub › Family Traditions & Recipes | Merge with Family Recipes |
| Family Recipes (`:135`) | same | Merge |
| Memory Safe (`:136`) | Knowledge Hub › Notes & Family | Keep, regroup |

**Missing:** Medication List — a live People & Care module with zero public coverage.

### Life Support › "Insights & Tools" (`:142`)

Heading is **retired terminology**.

| Card | Finding | Disposition |
|---|---|---|
| Smart Calendar (`:145`) | Live, Knowledge Hub › Planning | Keep, regroup |
| Manual Entry Items (`:146`) | **Wrong parent** — is an Asset Documentation asset type | **Move** to Asset Documentation |
| Upgrades & Repairs (`:147`) | Live, Property & Household | Keep, regroup |
| Source Websites (`:148`) | Live, Property & Household | Keep, regroup |
| Paint Codes (`:149`) | Live, Property & Household | Keep, regroup |
| Quick Notes (`:150`) | **Retired feature.** Redirects to Notes. Also duplicates the Notes card at `:133`. | **Retire from page** |

**Missing:** Important Locations — a live Property & Household module with zero public coverage.

### Protection & Insurance (`:157`)

| Card | Finding | Disposition |
|---|---|---|
| Insurance Claims (`:159`) | "Streamlined claims process" — mild outcome implication | **Rewrite copy** (organizational framing) |
| Post Damage Documentation (`:160`) | Live feature is named **Post Damage Report** | **Rename** |
| Moving Protection (`:161`) | No dedicated module; is a use case | Keep as use case, or move to a Use Cases section |

### Life Events (`:166`)

| Card | Finding | Disposition |
|---|---|---|
| Estate Planning (`:168`) | "Detailed asset records for inheritance planning and family legacy protection." **No "not a will / not legal advice" disclaimer**, unlike `:199`. Inconsistent risk posture on the same page. | **Rewrite copy** — add disclaimer |
| Divorce Protection (`:169`) | Use case, no module. Accurate. | Keep |

### Security & Access (`:174`)

| Card | Finding | Disposition |
|---|---|---|
| Password and Accounts Catalog (`:176`) | **P0.** Name retired (live: **Digital Access**, inside Secure Vault). Claims storing "**financial account information**" — outside approved scope. Claims "**end-to-end encryption**" — flagged term; actual model is client-side envelope encryption (AES-GCM-256, PBKDF2 600k, `vaultKey.ts:33,94-129`) with a designed Legacy Admin recovery path. | **Rename + rewrite copy** |
| Authorized Users (`:177`) | Correct role terms ("Full Access or Read Only"). Description says "collaborate on your property documentation" — understates scope. **Omits that Authorized Users never get Secure Vault access** (`SecureVault.tsx:725`), which is a selling point. | **Rewrite copy** |
| Voice Notes (`:178-182`) | **Duplicate** of `:131` in the same tab, with different copy and a different icon treatment. | **Retire** the duplicate |

### Legacy Locker (`:187-208`)

Three-column block: What It Is / What It's Not / Why It Matters.

- **Best copy on the page.** The "What It's Not" panel (`:199`) correctly disclaims will/attorney replacement. Use as the template elsewhere.
- **Architecture drift:** presents Legacy Locker as the top-level product. It is now a sub-section of **Secure Vault**, alongside **Digital Access**. The page never once mentions Secure Vault as a destination (only in the SEO meta at `:58`).
- "What It Is" (`:195`) says "account access" — same financial-scope ambiguity as the Digital Access card.
- **Homeowners-only.** Renters, Business, and Landlords get nothing.

**Disposition:** **Move/regroup** — reframe as a **Secure Vault** section containing Legacy Locker + Digital Access + Legacy Instructions; surface on all four tabs.

---

## D. Renters Audit

### Rental Documentation (`:222`)
Move-In Documentation (`:224`), Deposit Recovery (`:225`), Tenant Rights Protection (`:226`), Moving Documentation (`:227`) — all use-case framings of Asset Documentation. No module mismatch. **Keep**, but "Tenant Rights Protection" / "legal protection" leans legalistic; **rewrite copy** to organizational framing.

### Personal Property (`:232`)

| Card | Finding | Disposition |
|---|---|---|
| Personal Property Inventory (`:234`) | Duplicates the "Assets" card directly below it | **Merge** |
| Assets (`:235`) | Retired label | **Rename** → Asset Documentation |
| Export Assets (`:236`) | Retired label | **Rename** → Export Account Archive |
| Download All Files (`:237`) | Correct | Keep |

### Protection & Insurance (`:242`)
Insurance Support (`:244`) — fine. Post Damage Documentation (`:245`) — **rename** to Post Damage Report.

### Security & Access (`:250`)
Verbatim copies of `:176/177/178`. Same three P0/P1 findings. Same dispositions.

### Renters-specific findings
- **No Knowledge Hub content at all.** Renters would benefit heavily from Contacts, Notes, Important Locations, Medication List, Memory Safe, Smart Calendar. This is the biggest gap in the tab.
- **No Secure Vault / Legacy Locker content.** Digital Access and continuity are audience-neutral.
- No homeowner-only claims leaked into this tab — property-value and improvement language is correctly absent.

---

## E. Businesses Audit

### Business Assets (`:273`)
Commercial Property Documentation (`:275`), Inventory Documentation (`:277`) — accurate use cases. **Value Authentication** (`:276`) — "Value Authentication" is not a live product term and "authentication" overstates what the product does (it records self-reported values); **rename + rewrite**. **Assets** (`:278`) — retired label, **rename**.

### Compliance & Financing (`:283`)
- Compliance Documentation (`:285`) — "Maintain records for regulatory compliance and audit requirements." **Overclaim risk:** implies the product delivers regulatory compliance. **Rewrite copy.**
- Business Financing (`:286`) — acceptable.
- Export Assets (`:287`) / Download All Files (`:288`) — **rename** the former.

### Protection & Recovery (`:293`)
Disaster Recovery (`:295`) — fine. Post Damage Documentation (`:296`) — **rename**.

### Security & Access (`:301`)
Verbatim copies. Same findings.

### Business-specific findings
- **Consumer/family terminology bleed:** the Security & Access cards say "collaborate on your **property** documentation" and Voice Notes framing is inherited from the consumer copy. Businesses see no Authorized Users framing that fits a team.
- **No Knowledge Hub content.** Trusted Professionals, Source Websites, Upgrades & Repairs, Smart Calendar, and Important Locations are all directly applicable to a business.
- **No continuity content**, despite "business continuity" being named in the tab's own subheading (`:268`).
- The tab reads as a light reskin of the homeowner tab. **Needs product-owner decision** on how seriously the business segment is being pursued.

---

## F. Landlords Audit

### Property Management (`:324`)

| Card | Finding | Disposition |
|---|---|---|
| Multi-Property Management (`:326`) | "Document **unlimited** rental properties with **centralized management portal**." Unlimited is **verified correct** (`subscriptionFeatures.ts:232-235`). "Centralized management portal" overstates — there is no landlord portal product. | **Rewrite copy** |
| Tenant Move-In/Out (`:327`) | Use case, accurate | Keep |
| Property Value Tracking (`:328`) | Maps to Upgrades & Repairs + Asset Values | **Rename** |
| Tenant Communication (`:329`) | **"Share property documentation and maintenance records with tenants securely."** No tenant-sharing feature exists. Sharing is Authorized Users (account-level, `account_memberships`), which is not a tenant-facing mechanism. | **Retire or needs product-owner decision** |

### Legal & Protection (`:334`)

| Card | Finding | Disposition |
|---|---|---|
| Legal Protection (`:336`) | **"Court-ready documentation for evictions and tenant disputes."** "Court-ready" is an unsupported legal-sufficiency claim. | **Rewrite copy** |
| Insurance Claims (`:337`) | "Streamlined claims process" | **Rewrite copy** |
| Post Damage Documentation (`:338`) | **Rename** → Post Damage Report | Rename |

### Assets & Records (`:343`)
Assets (`:345`) — retired label; also claims tracking "**tenant belongings**," which is not a supported or advisable use. **Rewrite + rename.** Export Assets (`:346`) — **rename**. Download All Files (`:347`) — keep.

### Security & Access (`:352`)
Verbatim copies. Same findings.

### Landlord-specific findings
- Property-level organization is real and under-sold; multi-property is the strongest true landlord claim on the page.
- **No Knowledge Hub content**, though Trusted Professionals, Upgrades & Repairs, Paint Codes, Important Locations, Source Websites, and Smart Calendar are the most landlord-relevant modules in the entire product. Significant missed opportunity.
- Two of the tab's twelve cards (Tenant Communication, Legal Protection) make claims the product does not support. Highest per-card inaccuracy rate of any tab.

---

## G. Shared Sections Audit

### Core Platform Features (`:369`) — 8 cards

| Card | Finding | Disposition |
|---|---|---|
| High-Resolution Photography (`:375`) | "Upload high-quality images directly from your mobile device." Accurate — no resolution guarantee made. | **Keep** |
| Mobile-Optimized Platform (`:381`) | Accurate. Note a Capacitor config exists but this is correctly described as responsive web. | **Keep** |
| Secure Cloud Storage (`:387`) | "**Enterprise-grade** security with automatic backups and redundancy." Vague superlative; no GB figure. Should reference the approved "SOC 2–aligned practices" wording and the real 25 GB + add-on model. | **Rewrite copy** |
| Controlled Sharing (`:393`) | "Share specific documents with insurance, legal, or family members." **Inaccurate.** Sharing is account-level Authorized Users (Full Access / Read Only), not per-document sharing. | **Rewrite copy** or retire |
| Detailed Reports (`:399`) | Vague; overlaps Export Account Archive and Post Damage Report. | **Merge** |
| Unlimited Properties (`:405`) | **Verified accurate.** Recently updated. | **Keep** |
| Online Client Portal (`:411`) | "Client portal" is agency-speak that does not match a self-serve SaaS dashboard. | **Rename** or retire |
| Export & Download (`:417`) | Duplicates Export Assets + Download All Files cards in every tab. | **Merge** |

**Missing platform capabilities:** MFA (TOTP + backup codes), Authorized Users access controls, Secure Vault client-side encryption, Documentation Checklist, Smart Calendar reminders.

### Industry Applications (`:426`) — 6 cards
Covered in §M.

### Industries We Serve (`:471`) — 10 cards
Covered in §M. Structurally, this section largely duplicates the purpose of Industry Applications (`:426`) — **two industry sections, back to back, with overlapping entries** (Real Estate / Property Management vs. Home Services / Construction). **Merge into one.**

### CTA banner (`:619-633`)
"Ready to Protect Your Assets?" / "Join **thousands of** homeowners, renters, and businesses who trust Asset Safe" (`:623`). **The "thousands" claim is unsubstantiated** and should be removed or substantiated. **Rewrite copy.**

---

## H. Terminology Mismatch Table

| Features page term | File:line | Current product term | Status | Recommendation |
|---|---|---|---|---|
| Family Archive | `:127` | Knowledge Hub | **Retired terminology** | Replace heading |
| Insights & Tools | `:142` | Knowledge Hub | **Retired terminology** | Replace heading |
| Quick Notes | `:150` | Notes (Quick Note = shortcut) | **Retired feature** | Remove card |
| Password and Accounts Catalog | `:176,252,303,354` | Digital Access (in Secure Vault) | **Current feature, old label** | Rename |
| Manual Entry Items | `:146` | Manual Entry Item (Asset Documentation) | **Misleading grouping** | Move to Asset Documentation |
| Asset Valuation | `:115` | Asset Values | **Current feature, old label** | Rename + split description |
| Assets | `:116,235,278,345` | Asset Documentation | **Current feature, old label** | Rename |
| Export Assets | `:117,236,287,346` | Export Account Archive | **Current feature, old label** | Rename |
| Post Damage Documentation | `:160,245,296,338` | Post Damage Report | **Current feature, old label** | Rename |
| Property Documentation | `:106` | Asset Documentation | **Current feature, old label** | Rename |
| Property Value Tracking | `:328` | Upgrades & Repairs / Asset Values | **Duplicate concept** | Rename |
| Value Authentication | `:276` | Asset Values | **Old label + overclaim** | Rename |
| Legacy Locker (as top-level) | `:187` | Secure Vault › Legacy Locker | **Misleading grouping** | Regroup under Secure Vault |
| Digital Access | *absent* | Digital Access | **Missing** | Add |
| Secure Vault | `:58` (meta only) | Secure Vault (parent destination) | **Missing from page body** | Add as parent section |
| Legacy Instructions | *absent* | Legacy Instructions | **Missing** | Add (secondary) |
| Emergency Instructions | *absent* | Emergency Instructions | **Missing** | Add |
| Legacy Admin | *absent* | Legacy Admin | **Missing** | Add (within Secure Vault) |
| Download All Files | `:118,237,288,347` | Download All Files | **Current/correct** | Keep |
| Authorized Users / Full Access / Read Only | `:177,253,304,355` | same | **Current/correct** | Keep, expand copy |
| Unlimited Properties | `:405` | unlimited (verified) | **Current/correct** | Keep |
| Voice Notes | `:131,179,255,306,357` | Voice Notes (under Notes) | **Current/correct but duplicated 5×** | Dedupe |
| administrator / contributor / viewer | *absent* | — | **Correctly absent** | — |
| Standard / Premium / Basic / tier | *absent* | Asset Safe Plan | **Correctly absent** | — |
| GB amounts / prices / photo counts | *absent* | 25 GB + 25 GB blocks | **Correctly absent** | Consider adding accurate storage line |

---

## I. Retired / Incorrect Features

**Retired — remove:**
1. Quick Notes (`:150`) — folded into Notes.
2. Voice Notes duplicate (`:178-182`) — same tab as `:131`.

**Incorrect — feature does not work as described:**
3. Controlled Sharing (`:393`) — implies per-document sharing; reality is account-level roles.
4. Tenant Communication (`:329`) — no tenant-sharing feature exists.
5. Export Assets "CSV, PDF, or other formats" (`:117`) — live export is PDF summary + ZIP.
6. Online Client Portal (`:411`) — no client portal product.
7. "Centralized management portal" (`:326`) — no landlord portal.

**Overclaim — rewrite:**
8. "end-to-end encryption" (`:176,252,303,354`).
9. "financial account information" (`:176,252,303,354`).
10. "Court-ready documentation" (`:336`).
11. "faster claims processing and accurate settlements" (`:439`).
12. "regulatory compliance and audit requirements" (`:285`).
13. "Value Authentication" (`:276`).
14. "Join thousands of..." (`:623`).
15. "tenant belongings" tracking (`:345`).

---

## J. Missing Current Features

| Feature | Currently on page | Recommended coverage |
|---|---|---|
| Knowledge Hub (parent) | No | **Prominent** — top-level section on all tabs |
| Secure Vault (parent) | Meta only | **Prominent** — top-level section on all tabs |
| Digital Access | No | **Prominent** — inside Secure Vault |
| Asset Documentation (as the name) | No | **Prominent** — top-level section |
| Medication List | No | Secondary |
| Important Locations | No | Secondary |
| Emergency Instructions | No | Secondary |
| Legacy Instructions | No | Secondary — inside Secure Vault |
| Legacy Admin | No | Secondary — inside Secure Vault |
| Asset Values | Mislabeled | **Prominent** |
| High-Value Items | No | Secondary |
| Documentation Checklist | No | Secondary |
| Property Profiles | Implied only | Secondary |
| Export Account Archive | Mislabeled | **Prominent** |
| Download All Files | Yes | Keep |
| Post Damage Report | Mislabeled | **Prominent** |
| MFA (TOTP + backup codes) | No | Secondary — under platform/security |
| Authorized Users | Yes, understated | **Prominent** |
| Smart Calendar | Yes, mis-grouped | Keep, regroup |
| Contacts (VIP + Trusted Pros) | Yes, mis-grouped | Keep, regroup |
| Notes (Written + Voice) | Yes, fragmented | Consolidate |
| Family Traditions & Recipes | Yes, split | Merge into one card |
| Memory Safe | Yes, mis-grouped | Keep, regroup |
| Source Websites / Upgrades & Repairs / Paint Codes | Yes, mis-grouped | Keep, regroup |
| Gift subscription | No | **No public coverage on Features** — belongs on Pricing |
| Multi-account / workspace switching | No | No public coverage |
| Admin/CRM tooling | No | No public coverage (correct) |

---

## K. Pricing / Storage / Plan Findings

**Canonical, verified:** one Asset Safe Plan · monthly + annual + gift (`asset_safe_monthly` / `asset_safe_annual` / `asset_safe_gift_annual`) · **25 GB base**, **+25 GB add-on blocks** (`storage_25gb_monthly`) · **unlimited properties**.

Findings on `/features`:
1. **No stale tier names, prices, GB figures, or photo counts appear.** This is the cleanest area of the page.
2. "Unlimited Properties" (`:405`) and "unlimited rental properties" (`:326`) are **verified accurate**.
3. **Gap:** the page makes no storage statement at all. Adding an accurate "25 GB included, expandable in 25 GB blocks" line would strengthen Secure Cloud Storage (`:387`) and replace the vague "enterprise-grade" claim.
4. Both CTAs route to `/pricing`, so no price is duplicated on this page — good, keep it that way.
5. **Adjacent risk (out of scope, flag only):** `AskAssetSafe.tsx:29` hardcodes "25 GB Secure Storage Included" and "Add another 25 GB anytime for $4.99/month". Correct today, but a price literal outside the canonical config.

---

## L. Security / Legacy / Access Findings

**Verified implementation:** Secure Vault content (Digital Access + Legacy Locker free-text fields) is **client-side encrypted** — random AES-GCM-256 vault key, wrapped with the owner's passphrase via PBKDF2 at 600,000 iterations (`vaultKey.ts:33,94-129`); plaintext key lives only in JS memory and is cleared on hide/pagehide (`vaultKey.ts:217-253`). Asset Documentation and Knowledge Hub data are **not** covered by this scheme. A **Legacy Admin recovery path** exists and is approval-based. A "Support Staff Access" flag grants access to the vault *record* metadata only, not decrypted contents.

Findings:

1. **"end-to-end encryption"** (`:176,252,303,354`) — inaccurate framing. The correct description is client-side / at-rest encryption where Asset Safe never receives the passphrase. **Rewrite.**
2. **"financial account information"** (`:176,252,303,354`) — the product intentionally avoids positioning itself as a store of bank credentials, routing/account numbers, or balances. **Rewrite** to reference-level information only.
3. **"account access"** in the Legacy Locker "What It Is" panel (`:195`) — same ambiguity, softer. **Rewrite.**
4. **Secure Vault is invisible.** The page never presents the parent destination. Users who sign up from this page will not recognize the dashboard. **Structural fix.**
5. **Authorized Users copy understates the security story** (`:177`). It omits the strongest fact: Authorized Users — including Full Access — **never** get Secure Vault access (`SecureVault.tsx:725`). **Rewrite to include.**
6. **No public mention of MFA**, despite live TOTP + backup codes.
7. **Legacy Admin, Legacy Instructions, and Emergency Instructions are absent.** These are four distinct concepts (Emergency Instructions ≠ Legacy Instructions ≠ Legacy Locker ≠ Legacy Admin) and the page currently collapses all of them into one Legacy Locker block on one tab.
8. **No retired role language** (administrator / contributor / viewer / recovery delegate / temporary stewardship / ownership transfer) appears on `/features`. Clean.
9. **Adjacent, out of scope but flagged:** `FAQAccordion.tsx:293` claims a "**zero-knowledge encryption architecture**" and that "we never see, store, or have access to your... vault contents." The passphrase claim is accurate; the absolute no-access claim sits awkwardly beside the designed Legacy Admin recovery path. `AskAssetSafe.tsx:41,45` says "End-to-end encryption," "**SOC 2 compliant**" (violates the approved "SOC 2–aligned practices" rule), and "Trusted delegate access" (retired delegate language). **These three should be folded into the same remediation pass.**

---

## M. Industry-Claim Risk Review

### Healthcare (`:542-551`) — **highest risk**
> "Medical practices and facilities protect expensive diagnostic equipment and **patient care assets**." Bullets include "Diagnostic machinery inventory" and "**Compliance and certification records**."

The intent (equipment inventory) is defensible. The execution is not: "patient care assets" plus unqualified "compliance and certification records," under a Healthcare heading, invites a HIPAA / clinical-systems inference. Asset Safe is not a medical records platform and makes no HIPAA representation. **Rewrite copy** — scope explicitly to physical equipment and furnishings; drop "patient care assets"; qualify or drop the compliance bullet.

### Financial Services (`:461-463`)
> "Asset verification for loans, mortgages, and investment opportunities."

The card itself is acceptable. The real financial-services exposure is the Digital Access card's "financial account information" (§L.2). **Keep** the industry card; fix the vault card.

### Legal & Estate Planning (`:432-433`)
> "Asset documentation for probate, inheritance, divorce proceedings, and legal disputes."

Does not claim to replace a will or attorney — acceptable in isolation. But it carries **no disclaimer**, while `:199` on the same page has an excellent one. Same gap on the Estate Planning card (`:168`) and `FeaturesList.tsx:164`. **Rewrite copy** — apply the `:199` disclaimer pattern consistently.

### Insurance (`:437-439`)
> "Pre-loss documentation for **faster claims processing and accurate settlements**."

Outcome guarantee. Asset Safe cannot promise processing speed or settlement accuracy. **Rewrite copy** to organizational/supportive framing. Same softening needed on "Streamlined claims process" (`:159`, `:337`) and "Insurance Claims" headings generally.

### Aviation & Marine (`:512-521`)
"Regulatory compliance documentation" — milder instance of the compliance-overreach pattern. **Rewrite copy** (record-keeping that supports compliance, not compliance itself).

### Business › Compliance Documentation (`:285`)
"Maintain records for regulatory compliance and audit requirements." Same pattern. **Rewrite copy.**

### Legal Protection, Landlords (`:336`)
"Court-ready documentation for evictions and tenant disputes." Asserts legal admissibility/sufficiency. **Rewrite copy.**

### Low risk — keep as-is
Educational Institutions (`:482-491`), Automotive (`:497-506`), Manufacturing (`:527-536`), Construction (`:557-566`), Religious Organizations (`:572-581`), Art & Collectibles (`:587-596`), Home Services (`:602-611`), Real Estate (`:444-445`), Moving & Storage (`:450-451`), Property Management (`:456-457`).

**Structural note:** 16 industry cards across two sections is disproportionate for a product with three destinations, and several (Aviation, Manufacturing, Religious Organizations) have no evidence of being served segments. **Needs product-owner decision** on which industries to retain.

---

## N. Hero / Positioning Review

**Current** (`:67-70`):
> "Complete Asset Documentation Solution"
> "Comprehensive protection and documentation services for homeowners, renters, business owners, landlords, and more."

**Finding: too narrow.** "Asset Documentation" is now the name of **one of three** dashboard destinations. Leading with it tells visitors the product is one-third of what it is, and it makes Knowledge Hub and Secure Vault read as bolt-ons rather than peers. "Services" also implies a done-for-you offering rather than software.

Brand direction is "Everything you love. Protected in one place."

**Recommended options** (do not implement yet):

- **Option 1 — brand-led, structure-supported (recommended):**
  H1: "Everything you love. Protected in one place."
  Sub: "Asset Safe brings three things together: **Asset Documentation** for claim-ready proof of your home and belongings, a **Knowledge Hub** for the everyday details your household runs on, and a **Secure Vault** for your most private information."

- **Option 2 — structure-led:**
  H1: "Document, organize, and protect what matters."
  Sub: same three-destination sentence.

- **Option 3 — minimal change:**
  H1: "Everything you love. Protected in one place."
  Sub: keep the existing audience list, append the three destinations.

All three keep the page concrete. The three-destination sentence is the critical element — it is what makes the public page teach the dashboard.

**Also recommended:** add a three-card "How Asset Safe is organized" band immediately below the hero, above the audience tabs, mirroring `DashboardGrid` exactly. This single change does more to close the drift than any individual card rewrite.

---

## O. CTA / Route Findings

| CTA | Destination | File:line | Finding |
|---|---|---|---|
| View Pricing | `/pricing` | `:72-76` | Valid route. Fine. |
| Get Started Today | `/pricing` | `:626-630` | Valid, but **both CTAs on a 640-line page go to the same place**. No signup path, no "see how it works," no per-audience CTA. |

Findings:
1. **No stale or broken routes.** Both destinations resolve.
2. **Redundant CTAs** — two buttons, one destination.
3. **No audience-specific CTAs.** Four tabs, zero tab-level calls to action.
4. **No cross-links to related public pages** — `/scenarios`, `/legacy-locker-info`, `/complete-pricing`, `/checklists` all exist and are unreferenced from Features.
5. **`/features-list` is publicly indexable** (`App.tsx:378`) and exposes tech stack and internal route maps. **Recommend `noIndex` or removal** — separate decision from the copy work.
6. **`FeaturesSection.tsx` is dead code** — delete during implementation.
7. Recommend adding: a hero secondary CTA to `/scenarios`, and a per-tab CTA.

---

## P. Proposed New Feature Taxonomy

Mirror the dashboard's three destinations at the top level, then use marketing-friendly groupings **within** each while preserving exact product terminology for every module name. Do **not** mirror the Knowledge Hub's internal group headings verbatim — "People & Care" and "Notes & Family" are navigation labels, not marketing headers. Preserve the module names exactly; adapt only the group headers.

```text
HERO — brand-led, names the three destinations
  └─ "How Asset Safe is organized" — 3 cards mirroring DashboardGrid

1. ASSET DOCUMENTATION — "Claim-ready proof for your home and belongings"
   Property Profiles · Photos & Videos · Documents & Receipts
   Manual Entry Item · Asset Values · High-Value Items
   Documentation Checklist · Post Damage Report
   Export Account Archive · Download All Files

2. KNOWLEDGE HUB — "Everyday life, organized and protected"
   People            Contacts (VIP Contacts · Trusted Professionals)
                     Medication List
   Notes & Family    Notes (Written · Voice) · Family Traditions & Recipes
                     Memory Safe
   Home Details      Important Locations · Paint Codes
                     Upgrades & Repairs · Source Websites
   Planning          Smart Calendar

3. SECURE VAULT — "A single encrypted space for digital access and legacy planning"
   Digital Access · Legacy Locker · Legacy Instructions · Legacy Admin
   (+ the "What It Is / What It's Not" disclaimer block, retained)

4. ACCESS & SECURITY
   Authorized Users (Full Access · Read Only) · MFA
   Emergency Instructions · Encryption & storage (accurate wording)

5. WHO IT'S FOR  (tabs — use cases only, no feature re-listing)
   Homeowners · Renters · Businesses · Landlords

6. INDUSTRIES  (one merged section, trimmed)

7. CTA
```

**Key structural changes:**
- Features are described **once**, in sections 1–4, for everyone. The audience tabs (section 5) become short use-case narratives that *link into* those sections. This eliminates the 4× duplication and permanently ends per-tab drift.
- Every audience gets Knowledge Hub and Secure Vault, which today only Homeowners partially get.
- Sections default **open**, not collapsed.

---

## Q. Exact Files That Would Change

**Primary:**
- `src/pages/Features.tsx` — full restructure (all 640 lines)

**Recommended in the same pass:**
- `src/components/FeaturesSection.tsx` — delete (orphaned)
- `src/App.tsx:378` — set `noIndex` on `/features-list`, or remove the route
- `src/components/FeaturesList.tsx` — remove or gate (exposes tech stack + internal routes)

**Same-family copy risks worth folding in (product-owner decision):**
- `src/components/AskAssetSafe.tsx:29,41,45` — "SOC 2 compliant" → "SOC 2–aligned practices"; "End-to-end encryption"; "Trusted delegate access"; hardcoded price literal
- `src/components/FAQAccordion.tsx:290-294` — "zero-knowledge" + absolute no-access claim vs. Legacy Admin recovery path
- `src/components/HomeFAQ.tsx:17,37` — encryption + Authorized Users copy (currently safer than Features; align)
- `src/pages/Index.tsx:24-25` — encryption claim + Legacy Locker FAQ text

**New (optional):**
- `src/data/featuresContent.ts` — extract card definitions to one config so audience tabs and sections cannot drift apart again

**Explicitly not changing:** dashboard components, database, RLS, edge functions, storage, subscription config, legal pages, pricing pages.

---

## R. Risk / Scope Notes

1. **Legal review required** before shipping. Items in §M (Healthcare, Insurance, Legal/Estate) and §L (encryption, financial account information) are compliance-facing, not stylistic. These should be signed off, not just rewritten.
2. **SEO impact.** `Features.tsx:56-59` meta and `/features` is a canonical indexed page. Restructuring headings changes the H2/H3 map. Keep one H1, preserve the canonical URL, and keep the breadcrumb schema (`:48-51`). Retiring `/features-list` needs a redirect or a 410, not a silent delete.
3. **Content volume.** The proposed taxonomy describes ~35 modules. Without editorial discipline the page becomes a wall. Recommend short cards plus a link to `/features-list` — if that page is retained and rebuilt as a legitimate full index rather than a dev artifact.
4. **Product decisions blocking full implementation:**
   - Which industries to keep (16 cards today, several unsupported)
   - Whether Tenant Communication and Online Client Portal describe intended roadmap or should be deleted
   - Whether the Business tab is a real segment or should be merged into a general "Organizations" view
   - Whether to state 25 GB publicly on Features or keep storage on Pricing only
   - Whether `/features-list` stays public
5. **Copy-only vs. structural.** §H renames and §I/§L/§M rewrites are pure copy and could ship first, quickly, at low risk. The §P restructure is a larger change requiring design review. These can be sequenced separately.
6. **No backend work is implied by any finding.** Everything in this audit is public UI/copy.

---

## S. Recommended Implementation Order

**Phase 1 — Risk remediation (ship first, copy-only, small diff)**
1. Digital Access card × 4 (`:176,252,303,354`) — remove "financial account information" and "end-to-end encryption"; rename to Digital Access
2. Healthcare card (`:542-551`) — rescope to equipment
3. Insurance industry card (`:439`) + "Streamlined claims" (`:159,337`) — remove outcome guarantees
4. "Court-ready" (`:336`), "regulatory compliance" (`:285`), "Value Authentication" (`:276`), "Regulatory compliance documentation" (`:517-520`)
5. "Join thousands of" (`:623`)
6. Apply the `:199` legal disclaimer to `:168`, `:432-433`, `FeaturesList.tsx:164`
7. Same-family fixes: `AskAssetSafe.tsx` "SOC 2 compliant" → "SOC 2–aligned practices"

**Phase 2 — Remove what is false or retired**
8. Quick Notes (`:150`), Voice Notes duplicate (`:178-182`)
9. Tenant Communication (`:329`), Online Client Portal (`:411`), "centralized management portal" (`:326`), "tenant belongings" (`:345`)
10. Fix Controlled Sharing (`:393`) and Export Assets format claim (`:117`)
11. Delete `FeaturesSection.tsx`; decide `/features-list`

**Phase 3 — Terminology alignment (§H table, mechanical)**
12. Assets → Asset Documentation · Export Assets → Export Account Archive · Post Damage Documentation → Post Damage Report · Asset Valuation → Asset Values · Manual Entry Items → move to Asset Documentation

**Phase 4 — Structural rewrite (§P)**
13. New hero + three-destination band
14. Build sections 1–4 (Asset Documentation, Knowledge Hub, Secure Vault, Access & Security)
15. Convert audience tabs to use-case narratives
16. Merge the two industry sections; trim
17. Add missing modules (§J) at the recommended prominence
18. Extract to `src/data/featuresContent.ts`
19. Add per-tab and secondary CTAs; default sections open

**Phase 5 — Verification**
20. Side-by-side: every card title on `/features` vs. its live dashboard label
21. Confirm the four continuity concepts read as distinct: Emergency Instructions · Legacy Instructions · Legacy Locker · Legacy Admin
22. SEO check — single H1, canonical intact, breadcrumb schema intact
23. Legal sign-off on Phase 1 copy
