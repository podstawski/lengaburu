"use strict";

import {FamilyMember} from "./member";

export const SortFamilyMembers = (isAsync?: boolean) => {
    const sortResult = (result => Array.isArray(result) ? result.sort((a:FamilyMember, b:FamilyMember)=> {
        const aBirthDate = a.getBirthDate();
        const bBirthDate = b.getBirthDate();
        return aBirthDate > bBirthDate ? 1 : (aBirthDate < bBirthDate ? -1 : 0);
    }) : result);

    return (target: any, name: string, descriptor: any) => {
        const method = descriptor && typeof(descriptor.value)==='function' && descriptor.value;

        if (isAsync) {
            descriptor.value = async function (...args) {
                return sortResult(await method.apply(this, args));
            }
        } else {
            descriptor.value = function (...args) {
                return sortResult(method.apply(this, args));
            }
        }
    }
}
