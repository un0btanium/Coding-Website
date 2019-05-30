export const log = (message) => {
    if (process.env.NODE_ENV !== "production") {
        console.log(message);
    }
}

export const logError = (message) => {
    if (process.env.NODE_ENV !== "production") {
        console.error(message);
    }
}