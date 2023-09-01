import {centerString, centerArray} from "./stringUtils.js";
import FigletDoomFont from "./FigletDoomFont.js";



const figlet = new FigletDoomFont();
await figlet.load("./assets/Doom.flf");



export default function assignGeneratedBannerToElement(element: HTMLElement, bannerText: string) {
	element.textContent = generateBanner(bannerText);
}



function generateBanner(from: string) {
	return generateExtremeBanner(from);
}



function generateExtremeBanner(from: string) {
	const figgedText = figlet.getText(from);
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


	return joined;
}
