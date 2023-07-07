"use strict";

import {GenderType, MembersType, ERRORS, MALE, Relations, FEMALE, SortFamilyMembers} from './definitions';

export class FamilyMember {
    protected name: string;
    protected gender:GenderType;
    protected birthDate: Date;
    protected father: FamilyMember = null;
    protected mother: FamilyMember = null;
    protected children: MembersType = null;
    protected spouse: FamilyMember = null;


    constructor(name: string, gender: GenderType, birthDate?: Date|string, relations?: Relations) {
        this.name = name;
        this.gender = gender;
        this.children = [];
        this.birthDate = birthDate && new Date(birthDate) || new Date();
        relations && this.applyRelations(relations).then(null);
    }

    protected async applyRelations(relations: Relations) {
        for (let relation in relations) {
            if (this[relation]===null) {
                this[relation] = await relations[relation];
            }
        }
    }

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
    public getChildren = ():MembersType => this.children;
    public getBirthDate = ():Date => this.birthDate;
    public exportRelations = () => {
        return {
            father: this.father && this.father.getName() || null,
            mother: this.mother && this.mother.getName() || null,
            spouse: this.spouse && this.spouse.getName() || null,
            children: this.children && this.children.map( (child: FamilyMember) => child.getName && child.getName()) || []
        }
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
}

