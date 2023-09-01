import assignGeneratedBannerToElement from "../banner/generateBanner.js";
import getInput from "./composite.js";
let output;
export function updateOutput() {
    if (!output)
        return;
    const inputValue = getInput();
    assignGeneratedBannerToElement(output, inputValue);
}
export function addInputChangeListeners(writeTo) {
    output = document.querySelector(writeTo);
    const schoolSelect = document.getElementById("school-select");
    schoolSelect.addEventListener("change", updateOutput);
    const wiringClosetInput = document.getElementById("wiring-closet");
    wiringClosetInput.addEventListener("keyup", updateOutput);
    const closetTypeSelect = document.getElementById("closet-type-select");
    closetTypeSelect.addEventListener("change", updateOutput);
}
