"use strict";

import fs from 'fs';

import { FamilyMember } from "./member";
import { DB_DIR } from "./definitions";

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

    public async import(tree):Promise <FamilyMember> {
        if (tree.name && tree.gender) {
            const member=new FamilyMember(tree.name, tree.gender, tree.birthDate);
            this.root = this.root || member;
            this.familyIndex[tree.name] = member;
            if (tree.spouse) {
                const spouse=await this.import(tree.spouse);
                spouse && member.addSpouse(spouse);
            }
            if (Array.isArray(tree.children) && tree.children.length>0) {
                await Promise.all(tree.children.map(async (descendant)=>{
                    const child=await this.import(descendant);
                    child && member.addChild(child);
                }));
            }
            return member;
        }
        return null;
    }


    public getRoot = () => this.root;
    public findByName = (name: string) => this.familyIndex[name];
}