"use strict";

import fs from 'fs';
import { FamilyMember } from "./member";
import { DB_DIR, GenderType, ERRORS, FEMALE, RelationType, RelationTypes, DEFAULT_ROOT_AGE, DEFAULT_GENERATION_DIFF} from "./definitions";

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

    /**
     * Opens the JSON file as a database
     *
     * @since 1.0.1
     *
     */
    public async open() {
        if (this.dbPath && fs.existsSync(this.dbPath)) {
            const dataTxt=fs.readFileSync(this.dbPath, {encoding: 'utf-8'});
            try {
                const data = JSON.parse(dataTxt);
                if (Array.isArray(data.members)) {
                    data.members.map(member=>{
                       this.familyIndex[member.name] = new FamilyMember(member.name, member.gender, member.birthDate);
                    });
                    data.members.map(member=>{
                        if (member.relations) {
                            for (let key in member.relations) {
                                if (typeof member.relations[key] === 'string') {
                                    member.relations[key] = this.familyIndex[member.relations[key]];
                                }
                                if (Array.isArray(member.relations[key])) {
                                    for (let i = 0; i < member.relations[key].length; i++) {
                                        member.relations[key][i] = this.familyIndex[member.relations[key][i]];
                                    }
                                }
                            }
                            this.familyIndex[member.name].applyRelations(member.relations);
                        }
                    });
                }
                if (data.root) {
                    this.root = this.familyIndex[data.root];
                }
            } catch (e) {
                console.error(e);
            }

        }
    }

    /**
     * Cleans all the family tree. After save there will be empty database.
     *
     * @since 1.0.1
     *
     */
    public clean() {
        this.root=null;
        this.familyIndex={};
    }

    /**
     * Saves family tree to a JSON file - database
     *
     * @since 1.0.1
     *
     */
    public async save() {
        if (this.dbPath) {
            const data={
                root: this.root && this.root.getName() || null,
                members: await Promise.all(Object.keys(this.familyIndex).map(async (name)=>{
                    const member=this.findByName(name);
                    return {
                        name: member.getName(),
                        gender: member.getGender(),
                        birthDate: member.getBirthDate(),
                        relations: member.exportRelations()
                    }
                }))
            }
            return fs.promises.writeFile(this.dbPath, JSON.stringify(data));
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

    /**
     * Adds a child to a mather
     *
     * @since 1.0.0
     * @param {string} motherName name of existing mother
     * @param {string} name name of the child being added
     * @param {GenderType} gender gender of the child being added
     * @returns {FamilyMember} instance of the added family member
     *
     */
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

    /**
     * Relationship finder
     *
     * @since 1.0.0
     * @param {string} personName name of a person to find
     * @param {string} relationName name of the relationship listed in RelationTypes
     * @returns {string[]} list of names in relationship
     *
     */
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

    public getRoot = () => this.root;
    public findByName = (name: string) => this.familyIndex[name];
}