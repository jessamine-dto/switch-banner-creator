const input = document.getElementById("input") as HTMLInputElement;
const output = document.getElementById("output") as HTMLTextAreaElement;


// @ts-expect-error
let figlet = new Figlet() as Figlet;


await fetch("./assets/Doom.flf")
	.then(res => res.text())
	.then(text => figlet.load(text));



input.addEventListener("keyup", async (_) => {
	let figgedText = figlet.getText(input.value);


	output.textContent = figgedText;
});



export {};
