import { describe, it } from "node:test";
import { strict as assert } from "node:assert";

import { PARTNERS, getPartner } from "../partners.ts";
import type { SeniorPartnerId } from "../types.ts";

describe("partners", () => {
  it("registry exports Anika, Ravi, Karen", () => {
    assert.ok(PARTNERS.anika);
    assert.ok(PARTNERS.ravi);
    assert.ok(PARTNERS.karen);
    assert.equal(Object.keys(PARTNERS).length, 3);
  });

  it("each partner has the four authoring fields populated", () => {
    for (const p of Object.values(PARTNERS)) {
      assert.ok(p.name.length > 2, `${p.id}.name`);
      assert.ok(p.role.length > 10, `${p.id}.role`);
      assert.ok(p.voice.length > 50, `${p.id}.voice`);
      assert.ok(p.sharpFeedback.length > 10, `${p.id}.sharpFeedback`);
      assert.ok(p.warmFeedback.length > 10, `${p.id}.warmFeedback`);
    }
  });

  it("getPartner('anika') returns Anika", () => {
    const p = getPartner("anika");
    assert.equal(p.id, "anika");
    assert.equal(p.name, "Anika Mehra");
  });

  it("getPartner throws on an unknown id", () => {
    assert.throws(
      () => getPartner("ghost" as SeniorPartnerId),
      /Unknown senior partner id/
    );
  });
});
