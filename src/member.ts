"use strict";

import {GenderType, MembersType, ERRORS, MALE} from './definitions';

export class FamilyMember {
    protected name: string;
    protected gender:GenderType;
    protected birthDate: Date;
    protected father: FamilyMember;
    protected mather: FamilyMember;
    protected children: MembersType;
    protected spouse: FamilyMember;


    constructor(name: string, gender: GenderType, birthDate?: Date|string) {
        this.name = name;
        this.gender = gender;
        this.children = [];
        this.birthDate = new Date(birthDate);
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

    public getName = () => this.name;
    public getGender = () => this.gender;
    public getSpouse = () => this.spouse;
    public getMother = () => this.mather;
    public getFather = () => this.father;
    public setMother = (mother: FamilyMember) => this.mather=mother;
    public setFather = (father: FamilyMember) => this.father=father;
}