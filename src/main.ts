const input = document.getElementById("input") as HTMLInputElement;
const output = document.getElementById("output") as HTMLTextAreaElement;


// TODO: rewrite Figlet myself, to make it more efficient and in typescript
// @ts-expect-error
let figlet = new Figlet() as Figlet;


await fetch("./assets/Doom.flf")
	.then(res => res.text())
	.then(text => figlet.load(text));



input.addEventListener("keyup", () => {
	let figgedText = figlet.getText(input.value);

	const figgedLength = figgedText.split("\n")[0].length;
	const stars = "*".repeat(figgedLength);

	figgedText = `${stars}\n${trimFiggedText(figgedText)}\n${stars}`;

	output.textContent = figgedText;
});



function trimFiggedText(text: string): string {
	let lines = text.split("\n");

	return lines
		.map(line => line.trimEnd())
		.filter(line => line !== "")
		.join("\n")
}



export {};
