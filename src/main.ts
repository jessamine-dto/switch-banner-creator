import assignGeneratedBannerToElement from "./banner/generateBanner.js";
import initalizeSchoolDropdown from "./input/dropdown.js";



export const IS_DEVELOPMENT = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";



// TODO: might need to completely restructure this code
const inputBox = document.getElementById("wiring-closet") as HTMLInputElement;
const outputBox = document.getElementById("output") as HTMLTextAreaElement;

inputBox.addEventListener("keyup", () => {
	assignGeneratedBannerToElement(outputBox, inputBox.value);
});



await initalizeSchoolDropdown();
assignGeneratedBannerToElement(outputBox, "");



if(IS_DEVELOPMENT === false) {
	const assignLastCommitToElement = (await import("./generateLastCommitText.js")).default;
	const lastUpdated = document.getElementById("last-updated") as HTMLSpanElement;

	await assignLastCommitToElement(lastUpdated, "jessamine-dto/switch-banner-creator");
}
