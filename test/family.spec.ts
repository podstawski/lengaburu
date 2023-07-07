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
    });

    it('creating temp marriage to test birthDate calculation of a child of just married couple (no kids yet)', () => {
        const mother = 'Ginny';
        const daughter = 'Kate';
        const ginny = family.findByName('Ginny');
        const draco = family.findByName('Draco');
        ginny.addSpouse(draco);
        const kate = family.addChild(mother, daughter, FEMALE);
        assert.equal(kate.getMother().getName(), mother);
    });

    it('Dominique\'s siblings', async () => {
        const name = 'Dominique';
        const relatives = await family.getRelationship(name,'Siblings');
        assert.equal(relatives.join(' '), 'Victoire Louis Minerva');
    });

    it('Remus\'s maternal aunt', async () => {
        const name = 'Remus';
        const relatives = await family.getRelationship(name,'Maternal-Aunt');
        assert.equal(relatives.join(' '), 'Dominique Minerva');
    });

    it('Lily\'s sister in law', async () => {
        const name = 'Lily';
        const relatives = await family.getRelationship(name,'Sister-In-Law');
        assert.equal(relatives.join(' '), 'Darcy Alice');
    });
});