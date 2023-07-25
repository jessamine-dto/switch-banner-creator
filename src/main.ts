const input = document.getElementById("input") as HTMLInputElement;
const output = document.getElementById("output") as HTMLTextAreaElement;


// TODO: rewrite Figlet myself, to make it more efficient and in typescript
// @ts-expect-error
let figlet = new Figlet() as Figlet;


await fetch("./assets/Doom.flf")
	.then(res => res.text())
	.then(text => figlet.load(text));



input.addEventListener("keyup", () => {
	const figgedText = figlet.getText(input.value);

	const figgedTextNoEmpty = figgedText
		.split("\n")
		.filter(line => line.trim() !== "")
		.join("\n");


	output.textContent = generateBanner(figgedTextNoEmpty);
});



function generateCenteredText(text: string, targetLength: number, paddingChar: string = " ") {
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



function generateBanner(figgedText: string) {
	const federalLaw = "18 USC $ 1030";

	const splitWarningBanner = "*** THE NETWORK EQUIPMENT IS PROTECTED BY FEDERAL LAW ***";
	const joinedWarningBanner = `*** THE NETWORK EQUIPMENT IS PROTECTED BY FEDERAL LAW ${federalLaw} ***`;


	const figgedLength = figgedText.split("\n")[0].length;

	let targetLength;
	let output = "";


	if(splitWarningBanner.length >= figgedLength) {
		// split banner is longer than figged text, so it is the targetLength
		// use the split banner
		targetLength = splitWarningBanner.length;

		output += `${splitWarningBanner}\n${generateCenteredText(federalLaw, targetLength)}`;
	} else if(figgedLength > splitWarningBanner.length && figgedLength < joinedWarningBanner.length) {
		// figged text is longer than split banner and shorter than joined banner, so text length is the targetLength
		// use the split banner
		targetLength = figgedLength;

		output += `${generateCenteredText(splitWarningBanner, targetLength, "*")}\n${generateCenteredText(federalLaw, targetLength)}`;
	} else {
		// figged text is longer than the joined banner, so text length is the targetLength
		// use the joined banner
		targetLength = figgedLength;

		output += `${generateCenteredText(joinedWarningBanner, targetLength, "*")}`;
	}


	output += `\n${centerAndTrimFiggedText(figgedText, targetLength)}`;
	output += `\n${"*".repeat(targetLength)}`;

	return output;
}



function centerAndTrimFiggedText(text: string, length: number) {
	let lines = text.split("\n");

	lines = lines.filter(line => line.trimEnd() !== "");

	return lines
		.map(line => generateCenteredText(line, length, " "))
		.map(line => line.trimEnd())
		.filter(line => line !== "")
		.join("\n");
}



export {};
