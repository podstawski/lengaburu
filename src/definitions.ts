"use strict";

import {FamilyMember} from "./member";
import type = Mocha.utils.type;
export const MALE:string = 'Male';
export const FEMALE:string = 'Female';
export const DEFAULT_ROOT_AGE = 350;
export const DEFAULT_GENERATION_DIFF = 30;

export type GenderType = typeof MALE | typeof FEMALE;
export type MembersType = (Promise<FamilyMember> | FamilyMember)[];

export const RelationTypes = ['Siblings', 'Maternal-Aunt', 'Sister-In-Law'];
export type RelationType =  (typeof RelationTypes)[number];

export const DB_DIR:string = '../db';
export const RESOURCES_DIR:string = '../resources';

export type Relations = {
    father: Promise<FamilyMember>;
    mother: Promise<FamilyMember>;
    spouse: Promise<FamilyMember>;
    children: Promise<FamilyMember>[];
}

type Error = {
    code: number;
    message: string;
    short: string;
}

export const ERRORS: {[s: string]: Error} = {
    'NO_SPOUSE': {
        code: 400,
        message: 'You can not add a child without a spouse',
        short: 'MEMBER_HAS_NO_SPOUSE'
    },
    'NO_SAME_SEX_MARRIAGE': {
        code: 400,
        message: 'We don\'t support same-sex marriages yet',
        short: 'NO_SAME_SEX_MARRIAGE'
    },
    'PERSON_NOT_FOUND': {
        code: 404,
        message: 'Such person was not found',
        short: 'PERSON_NOT_FOUND'
    },
    'PERSON_EXIST': {
        code: 400,
        message: 'Person of given name already in our tree',
        short: 'PERSON_EXIST'
    },
    'ONLY_TROUGH_MOTHER': {
        code: 400,
        message: 'At this moment we only support adding a child by its mother',
        short: 'ONLY_TROUGH_MOTHER'
    },
    'RELATIONSHIP_NOT_FOUND': {
        code: 404,
        message: 'We don\'t support given relation',
        short: 'RELATIONSHIP_NOT_FOUND'
    }
}

export const SortFamilyMembers = () => {
    return (target: any, name: string, descriptor: any) => {
        const method = descriptor && typeof(descriptor.value)==='function' && descriptor.value;

        descriptor.value = function (...args) {
            const result = method.apply(this, args);
            return Array.isArray(result) ? result.sort((a:FamilyMember, b:FamilyMember)=> {
                const aBirthDate = a.getBirthDate();
                const bBirthDate = b.getBirthDate();
                return aBirthDate > bBirthDate ? 1 : (aBirthDate < bBirthDate ? -1 : 0);
            }) : result;
        }

    }
}