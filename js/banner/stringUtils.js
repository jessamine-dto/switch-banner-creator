export function centerString(text, targetLength, paddingChar = " ") {
    if (text.length >= targetLength) {
        return text;
    }
    targetLength = Math.max(text.length, targetLength);
    const onEitherSide = (targetLength - text.length) / 2;
    // if onEitherSide is fractional, pad less on the left and more on the right
    const before = paddingChar.repeat(Math.floor(onEitherSide));
    const after = paddingChar.repeat(Math.ceil(onEitherSide));
    return `${before}${text}${after}`;
}
export function centerArray(lines, length) {
    return lines.map(line => centerString(line, length, " "));
}
