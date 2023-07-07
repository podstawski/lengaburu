"use strict";

import {FamilyMember} from "./member";

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