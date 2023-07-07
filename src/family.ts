"use strict";

import fs from 'fs';
import { FamilyMember } from "./member";
import {
        DB_DIR, GenderType, ERRORS, FEMALE, RelationType, RelationTypes,
        DEFAULT_ROOT_AGE, DEFAULT_GENERATION_DIFF
} from "./definitions";

export class Family {
    protected familyIndex: {[name:string]: FamilyMember} = {};
    protected root: FamilyMember;
    protected dbPath: string;

    constructor(dbName?: string) {
        if (dbName) {
            this.dbPath = DB_DIR+'/'+dbName;
            if (!fs.existsSync(DB_DIR)) {
                fs.mkdirSync(DB_DIR);
            }
        }
    }

    public async open() {
        if (this.dbPath && fs.existsSync(this.dbPath)) {
            const tree=require(this.dbPath);
            return this.import(tree);
        }
    }

    /**
     * Tree importer from a JSON object
     *
     * @since 1.0.0
     * @param {object} tree data from JSON file
     * @param {number} age for the purpose of sorting we calculate an age of person if not given, assuming the spouse is the same age and children are born every year, younger 30 years from their parents
     * @returns {FamilyMember} person added at the current level of recursion, finally the root member is returned
     *
     */
    public async import(tree, age?:number):Promise <FamilyMember> {
        if (tree.name && tree.gender) {
            age=age||DEFAULT_ROOT_AGE;
            const born=new Date();
            born.setFullYear(born.getFullYear()-age);
            const member=new FamilyMember(tree.name, tree.gender, tree.birthDate||born);
            this.root = this.root || member;
            this.familyIndex[tree.name] = member;
            if (tree.spouse) {
                const spouse=await this.import(tree.spouse, age);
                spouse && member.addSpouse(spouse);
            }

            if (Array.isArray(tree.children) && tree.children.length>0) {
                age-=DEFAULT_GENERATION_DIFF;
                await Promise.all(tree.children.map(async (descendant)=>{
                    const child=await this.import(descendant, age--);
                    child && member.addChild(child);
                }));
            }
            return member;
        }
        return null;
    }

    public addChild (motherName:string, name:string, gender:GenderType) {
        const mother = this.findByName(motherName);
        if (!mother)
            throw ERRORS.PERSON_NOT_FOUND;
        if (mother.getGender()!==FEMALE)
            throw ERRORS.ONLY_TROUGH_MOTHER;
        if (this.findByName(name))
            throw ERRORS.PERSON_EXIST;

        const youngestChild = <FamilyMember>(mother.getChildren()).pop();
        const birthDate=new Date();
        birthDate.setFullYear( youngestChild && youngestChild.getBirthDate().getFullYear()+1  || mother.getBirthDate().getFullYear()+DEFAULT_GENERATION_DIFF);

        this.familyIndex[name] = new FamilyMember(name, gender, birthDate);
        mother.addChild(this.familyIndex[name]);
        return this.familyIndex[name];
    }

    public getRoot = () => this.root;
    public findByName = (name: string) => this.familyIndex[name];

    public async getRelationship (personName: string, relationName: RelationType): Promise <string[]> {
        const person = this.findByName(personName);
        if (!person)
            throw ERRORS.PERSON_NOT_FOUND;
        const relationMethod = relationName.replace(/[^a-z]/gi,'');
        if (RelationTypes.indexOf(relationName)===-1 || typeof person[relationMethod]!=='function')
            throw ERRORS.RELATIONSHIP_NOT_FOUND;
        const relationship = await person[relationMethod].call(person);
        return relationship.map((person:FamilyMember) => person.getName());
    }
}