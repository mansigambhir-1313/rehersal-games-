// Shape tests for the scenario authoring data. Walks every scenario × every
// canonical cause and asserts the R0/R0.5 contract: causeKind is valid,
// teachingNote is non-trivial, seniorPartnerId resolves to a real partner.
//
// Runs with Node 24's built-in test runner + experimental TS stripping:
//   node --test --experimental-strip-types lib/__tests__/scenarios.test.ts
// No external test framework required — npm install is currently broken on
// this machine due to an npm/arborist bug.

import { describe, it } from "node:test";
import { strict as assert } from "node:assert";

import { funnelRecovery } from "../scenarios/funnel-recovery.ts";
import { resignationLetter } from "../scenarios/resignation-letter.ts";
import { hertzAccenture } from "../scenarios/hertz-accenture.ts";
import { PARTNERS } from "../partners.ts";
import type { CauseKind } from "../types.ts";

const VALID_KINDS: CauseKind[] = ["symptom", "proximate", "root"];

// Import each scenario directly (not via index.ts) so node --test doesn't
// require ESM-resolution patches for extensionless internal imports.
describe("scenarios — R0.5 shape contract", () => {
  const scenarios = [funnelRecovery, resignationLetter, hertzAccenture];

  it("registry has 3 scenarios", () => {
    assert.equal(scenarios.length, 3);
  });

  for (const scenario of scenarios) {
    describe(`${scenario.id}`, () => {
      it("has a valid seniorPartnerId resolving to a real partner", () => {
        assert.ok(
          scenario.seniorPartnerId in PARTNERS,
          `Unknown partner: ${scenario.seniorPartnerId}`
        );
      });

      it("declares 12 canonical causes", () => {
        assert.equal(scenario.canonicalCauses.length, 12);
      });

      it("declares 12 candidate chips", () => {
        assert.equal(scenario.candidateChips.length, 12);
      });

      it("has a valid version semver string", () => {
        assert.match(scenario.version, /^\d+\.\d+\.\d+$/);
      });

      it("has a non-empty failurePoster", () => {
        assert.ok(scenario.failurePoster.headline.length > 5);
        assert.ok(scenario.failurePoster.subtitle.length > 5);
        assert.ok(scenario.failurePoster.storyParagraph.length > 50);
      });

      describe("canonical causes — every cause must satisfy R0.5 fields", () => {
        for (const c of scenario.canonicalCauses) {
          it(`${c.id} has valid causeKind`, () => {
            assert.ok(
              VALID_KINDS.includes(c.causeKind),
              `${c.id}.causeKind = ${c.causeKind}`
            );
          });

          it(`${c.id} has a non-trivial teachingNote (>50 chars)`, () => {
            assert.ok(
              c.teachingNote.length > 50,
              `${c.id}.teachingNote too short: ${c.teachingNote.length} chars`
            );
          });

          it(`${c.id} has at least 2 debrief variants for replay`, () => {
            assert.ok(
              c.debriefLineVariants.length >= 2,
              `${c.id} has only ${c.debriefLineVariants.length} variants`
            );
          });

          it(`${c.id} has at least 4 synonyms for semantic match`, () => {
            assert.ok(
              c.synonyms.length >= 4,
              `${c.id} has only ${c.synonyms.length} synonyms`
            );
          });
        }
      });

      it("at least one cause is a root", () => {
        const roots = scenario.canonicalCauses.filter((c) => c.causeKind === "root");
        assert.ok(roots.length >= 1, "scenario must have at least one root cause");
      });
    });
  }
});
