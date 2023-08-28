import assignGeneratedBannerToElement from "./banner/generateBanner.js";



// TODO: might need to completely restructure this code
const inputBox = document.getElementById("wiring-closet-input") as HTMLInputElement;
const outputBox = document.getElementById("output") as HTMLTextAreaElement;

inputBox.addEventListener("keyup", () => {
	assignGeneratedBannerToElement(outputBox, inputBox.value);
});


// const lastUpdated = document.getElementById("last-updated") as HTMLSpanElement;
// await assignLastCommitToElement(lastUpdated, "jessamine-dto/switch-banner-creator");



assignGeneratedBannerToElement(outputBox, "");
