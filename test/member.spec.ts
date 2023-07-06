import { assert } from "chai";
import { FamilyMember } from "../src/member";
import { MALE, FEMALE, ERRORS } from '../src/definitions';


describe("Family members tests", () => {
    let arthur: FamilyMember, margret: FamilyMember, flora: FamilyMember;

    it("creation of members", () => {
        arthur = new FamilyMember('Arthur', MALE);
        margret = new FamilyMember('Margaret', FEMALE);
        flora = new FamilyMember('Flora', FEMALE);
        assert.equal(arthur.getName(), 'Arthur');
    });

    it("adding a spouse with the same gender", () => {
        try {
            margret.addSpouse(flora);
        } catch (err) {
            assert.equal(err.short, ERRORS.NO_SAME_SEX_MARRIAGE.short);
        }
    });

    it("adding a child to unmarried person", () => {
        try {
            margret.addChild(flora);
        } catch (err) {
            assert.equal(err.short, ERRORS.NO_SPOUSE.short);
        }
    });

    it("adding a spouse", () => {
        arthur.addSpouse(margret);
        assert.equal(arthur.getSpouse(), margret);
        assert.equal(margret.getSpouse(), arthur);
    });

    it("adding a child", () => {
        margret.addChild(flora);
        assert.equal(flora.getMother(), margret);
        assert.equal(flora.getFather(), arthur);
    });
});