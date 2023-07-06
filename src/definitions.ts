"use strict";

import {FamilyMember} from "./member";
export const MALE:string = 'Male';
export const FEMALE:string = 'Female';

export type GenderType = typeof MALE | typeof FEMALE;
export type MembersType = (Promise<FamilyMember> | FamilyMember)[];

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
    }
}