const inputBox = document.getElementById("input") as HTMLInputElement;
inputBox.addEventListener("keyup", generateBanner);

const outputBox = document.getElementById("output") as HTMLTextAreaElement;



// TODO: rewrite Figlet myself, to make it more efficient and in typescript
// TODO: possibly make the "constructor" method i wrote
const figlet = await fetch("./assets/Doom.flf")
	.then(res => res.text())
	// @ts-expect-error
	.then(text => new Figlet(text) as Figlet);



// script tag has defer, this won't load until after the page is loaded
generateBanner();



function generateBanner() {
	const figgedText = figlet.getText(inputBox.value);
	const figgedLines = figgedText.split("\n");

	const federalLaw = "18 USC $ 1030";

	const splitWarningBanner = "*** THE NETWORK EQUIPMENT IS PROTECTED BY FEDERAL LAW ***";
	const joinedWarningBanner = `*** THE NETWORK EQUIPMENT IS PROTECTED BY FEDERAL LAW ${federalLaw} ***`;


	const figgedTextLength = figgedLines[0].length;

	let targetLength;
	let outputLines: string[] = [];


	if(splitWarningBanner.length >= figgedTextLength) {
		// split banner is longer than figged text, so it is the targetLength
		// use the split banner
		targetLength = splitWarningBanner.length;

		outputLines.push(splitWarningBanner);
		outputLines.push(centerString(federalLaw, targetLength));
	} else if(figgedTextLength > splitWarningBanner.length && figgedTextLength < joinedWarningBanner.length) {
		// figged text is longer than split banner and shorter than joined banner, so text length is the targetLength
		// use the split banner
		targetLength = figgedTextLength;

		outputLines.push(centerString(splitWarningBanner, targetLength, "*"));
		outputLines.push(centerString(federalLaw, targetLength));
	} else {
		// figged text is longer than the joined banner, so text length is the targetLength
		// use the joined banner
		targetLength = figgedTextLength;

		outputLines.push(centerString(joinedWarningBanner, targetLength, "*"));
	}


	// trim should be done separately
	outputLines.push(...centerArray(figgedLines, targetLength));
	outputLines.push("*".repeat(targetLength));

	const joined = outputLines
		.map(line => line.trimEnd())
		.filter(line => line !== "")
		.join("\n");

	outputBox.textContent = joined;
}



function centerString(text: string, targetLength: number, paddingChar: string = " ") {
	if(text.length >= targetLength) {
		return text;
	}


	targetLength = Math.max(text.length, targetLength);

	const onEitherSide = (targetLength - text.length) / 2;

	// if onEitherSide is fractional, pad less on the left and more on the right
	const before = paddingChar.repeat(Math.floor(onEitherSide));
	const after = paddingChar.repeat(Math.ceil(onEitherSide));

	return `${before}${text}${after}`;
}



function centerArray(lines: string[], length: number): string[] {
	return lines.map(line => centerString(line, length, " "));
}



export {};
