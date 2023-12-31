"use strict";

import {GenderType, MembersType, ERRORS, MALE, Relations, FEMALE} from './definitions';
import {SortFamilyMembers} from './decorators';

export class FamilyMember {
    protected name: string;
    protected gender:GenderType;
    protected birthDate: Date;
    protected father: FamilyMember = null;
    protected mother: FamilyMember = null;
    protected children: MembersType = null;
    protected spouse: FamilyMember = null;

    constructor(name: string, gender: GenderType, birthDate?: Date|string) {
        this.name = name;
        this.gender = gender;
        this.children = [];
        this.birthDate = birthDate && new Date(birthDate) || new Date();
        if (gender!==MALE && gender!==FEMALE)
            throw ERRORS.NO_SUCH_GENDER;
    }

    /**
     * Sets the relations after the family tree is read from JSON file
     *
     * @since 1.0.1
     * @param {Relations} relations object of relations to apply with corresponding keys
     *
     */
    public applyRelations(relations: Relations) {
        for (let relation in relations) {
            if (this[relation]===null) {
                this[relation] = relations[relation];
            } else if (Array.isArray(this[relation]) && this[relation].length===0 && Array.isArray(relations[relation])) {
                relations[relation].map(child=>this[relation].push(child));
            }
        }
    }

    /**
     * Add a child to current person, the child must be an instance of the FamilyMember class
     * Both parents get the child to their 'children' collections
     *
     * @since 1.0.0
     * @param {FamilyMember} child child instance
     *
     */
    public addChild = (child: FamilyMember) => {
        if (!this.spouse) {
            throw ERRORS.NO_SPOUSE;
        }
        if (this.children.indexOf(child)!==-1) {
            return;
        }
        this.children.push(child);
        this.gender===MALE && child.setFather(this) || child.setMother(this);
        this.spouse.addChild(child);
    }

    /**
     * Add a spouse to current person, the spouse must be an instance of the FamilyMember class
     * The spouse will get the current person as a spouse as well
     *
     * @since 1.0.0
     * @param {FamilyMember} spouse spouse instance
     * @param {boolean} addingMutual anti-infinity loop flag
     *
     */
    public addSpouse = (spouse: FamilyMember, addingMutual?:boolean) => {
        if (this.gender===spouse.getGender()) {
            throw ERRORS.NO_SAME_SEX_MARRIAGE;
        }
        //TODO: check if there was a spouse before and unchain it
        //TODO: check if we don't marry sibling, ancestor or descendant

        this.spouse = spouse;
        if (!addingMutual) {
            spouse.addSpouse(this, true);
        }
    }

    public getName = ():string => this.name;
    public getGender = ():GenderType => this.gender;
    public getSpouse = ():FamilyMember => this.spouse;
    public getMother = ():FamilyMember => this.mother;
    public getFather = ():FamilyMember => this.father;
    public setMother = (mother: FamilyMember) => this.mother=mother;
    public setFather = (father: FamilyMember) => this.father=father;
    public getBirthDate = ():Date => this.birthDate;

    /**
     * Export of related people as the text indexes - names
     *
     * @since 1.0.0
     *
     */
    public exportRelations = () => {
        return {
            father: this.father && this.father.getName() || null,
            mother: this.mother && this.mother.getName() || null,
            spouse: this.spouse && this.spouse.getName() || null,
            children: this.children && this.children.map( (child: FamilyMember) => child.getName && child.getName()) || []
        }
    }

    @SortFamilyMembers()
    public getChildren ():MembersType {
        // clone this.children
        return Object.assign([], this.children);
    }

    @SortFamilyMembers()
    public Siblings ():MembersType {
        return this.mother && this.mother.getChildren().filter((child:FamilyMember)=>child!==this) || [];
    }

    @SortFamilyMembers()
    public MaternalAunt ():MembersType {
        return this.mother && this.mother.Siblings().filter((aunt: FamilyMember) => aunt.getGender() === FEMALE) || [];
    }

    @SortFamilyMembers()
    public Sisters ():MembersType {
        return this.Siblings().filter((sibling:FamilyMember)=>sibling.getGender()===FEMALE) || [];
    }

    @SortFamilyMembers()
    public Brothers ():MembersType {
        return this.Siblings().filter((sibling: FamilyMember) => sibling.getGender() === MALE) || [];
    }

    @SortFamilyMembers()
    public SisterInLaw ():MembersType {
        const spouseSisters = this.spouse && this.spouse.Sisters() || [];
        const siblingsWives = this.Brothers().filter((brother:FamilyMember)=>brother.getSpouse()).map((brother:FamilyMember)=>brother.getSpouse());
        return spouseSisters.concat(siblingsWives);
    }

    @SortFamilyMembers(true)
    public async Descendants(): Promise <MembersType> {
        const children=this.getChildren()||[];
        return <Promise<MembersType>> children.reduce( (aggregatedDescendants: Promise<MembersType>, child: FamilyMember) => {
            return child.Descendants().then(async (descendants:MembersType)=>descendants.concat(await aggregatedDescendants));
        }, Promise.resolve(children));
    }
}