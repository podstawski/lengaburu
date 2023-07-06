import { assert } from "chai";
import { Family } from "../src/family";
import { RESOURCES_DIR, FEMALE } from '../src/definitions';
import { FamilyMember } from "../src/member";


describe("Family tests", () => {
    const family: Family = new Family();

    it("import of king Arthur\'s family", async () => {
        const tree = require(RESOURCES_DIR+'/arthur.json');
        await family.import(tree);
        const root=family.getRoot();
        assert.equal(root && root.getName(), tree.name);
        tree.spouse && assert.equal(root.getSpouse().getName(), tree.spouse.name);
        root.getChildren().map( (child: FamilyMember) => assert.equal(child.getFather(), root));
    });

    it('add Minerva as Flora\'s daughter', () => {
        const mother = 'Flora';
        const daughter = 'Minerva';
        const minerva = family.addChild(mother, daughter, FEMALE);
        assert.equal(minerva.getMother().getName(), mother);
    })

});