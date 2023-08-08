import FigletDoomFont from "./FigletDoomFont.js";
import generateLastCommitText from "./generateLastCommitText.js";



// TODO: might need to completely restructure this code
const inputBox = document.getElementById("wiring-closet-input") as HTMLInputElement;
inputBox.addEventListener("keyup", generateBanner);

const outputBox = document.getElementById("output") as HTMLTextAreaElement;


const figlet = new FigletDoomFont();
await figlet.load("./assets/Doom.flf")



export function generateBanner() {
	generateExtremeBanner();
}



function generateExtremeBanner() {
	const figgedText = figlet.getText(inputBox.value);
	const figgedLines = figgedText.split("\n");

	const federalLaw = "18 USC $ 1030";

	const warningText = " WARNING ";
	const splitWarningBanner = " THE NETWORK EQUIPMENT IS PROTECTED BY FEDERAL LAW ";
	const joinedWarningBanner = ` THE NETWORK EQUIPMENT IS PROTECTED BY FEDERAL LAW ${federalLaw} `;


	const figgedTextLength = figgedLines[0].length;

	let targetLength;
	let outputLines: string[] = [];


	if(splitWarningBanner.length >= figgedTextLength) {
		// split banner is longer than figged text, so it is the targetLength
		// use the split banner
		targetLength = splitWarningBanner.length;

		outputLines.push(centerString(warningText, targetLength, "*"));
		outputLines.push(splitWarningBanner);
		outputLines.push(centerString(federalLaw, targetLength));
	} else if(figgedTextLength > splitWarningBanner.length && figgedTextLength < joinedWarningBanner.length) {
		// figged text is longer than split banner and shorter than joined banner, so text length is the targetLength
		// use the split banner
		targetLength = figgedTextLength;

		outputLines.push(centerString(warningText, targetLength, "*"));
		outputLines.push(centerString(splitWarningBanner, targetLength));
		outputLines.push(centerString(federalLaw, targetLength));
	} else {
		// figged text is longer than the joined banner, so text length is the targetLength
		// use the joined banner
		targetLength = figgedTextLength;

		outputLines.push(centerString(warningText, targetLength, "*"));
		outputLines.push(centerString(joinedWarningBanner, targetLength));
	}


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




// iife for page load (script tag has defer, this won't load until after the page is loaded)
(async () => {
	generateExtremeBanner();
	// initializeButtons();

	await generateLastCommitText();
})();
