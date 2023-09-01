import assignGeneratedBannerToElement from "../banner/generateBanner.js";
import getInput from "./composite.js";



let output: HTMLElement;



export function updateOutput() {
	if(!output) return;

	const inputValue = getInput();
	assignGeneratedBannerToElement(output, inputValue);
}



export function addInputChangeListeners(writeTo: string) {
	output = document.querySelector(writeTo)!;

	const schoolSelect = document.getElementById("school-select") as HTMLSelectElement;
	schoolSelect.addEventListener("change", updateOutput);

	const wiringClosetInput = document.getElementById("wiring-closet") as HTMLInputElement;
	wiringClosetInput.addEventListener("keyup", updateOutput);

	const closetTypeSelect = document.getElementById("closet-type-select") as HTMLSelectElement;
	closetTypeSelect.addEventListener("change", updateOutput);
}
