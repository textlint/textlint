// MIT © 2018 azu
"use strict";

const asyncMap = async function asyncMap(array, operation) {
    return Promise.all(array.map(async item => await operation(item)));
};
const asyncFilter = async (array, predicate) => {
    const evaluateds = await asyncMap(array, async item => {
        const shouldExist = await predicate(item);
        return {
            item,
            shouldExist
        };
    });
    return evaluateds.filter(evaluated => evaluated.shouldExist).map(evaluated => evaluated.item);
};
module.exports = {
    asyncMap,
    asyncFilter
};
