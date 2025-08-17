import { ANSWER_WILDCARD_LETTER } from '../model';

export const compareLetter = (l: string, r: string, strict = true) => {
    if (strict === false && (l === ANSWER_WILDCARD_LETTER || r === ANSWER_WILDCARD_LETTER)) return 0;
    return l.toLocaleUpperCase().localeCompare(r.toLocaleUpperCase());
};

export const letterListFromString = (value: string[], result: string) => {
    return value.map((letter, index) => ({
        key: `pos-${index}`,
        letter,
        index,
        status: compareLetter(letter, result[index]),
    }));
};