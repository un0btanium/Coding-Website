var letterWidth = 9.9;
var letterHeight = 22;

export const getLetterWidth = () => {
    return letterWidth;
}

export const getLetterHeight = () => {
    return letterHeight;
}

export const setLetterWidth = (width) => {
    if (width !== null && width !== undefined) {
        letterWidth = width;
    }
}

export const setLetterHeight = (height) => {
    if (height !== null && height !== undefined) {
        letterHeight = height;
    }
}