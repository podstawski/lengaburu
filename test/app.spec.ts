
import { assert } from "chai";
import { mochaTest } from "../src/app";

describe("Mocha Tests", () => {
    it("addition of two numbers", () => {
      const result = mochaTest(5, 7);
      assert.equal(result, 12);
    });
    it("addition of two numbers failure", () => {
        const result = mochaTest(5, 7);
        assert.notEqual(result, 15);
    });
});