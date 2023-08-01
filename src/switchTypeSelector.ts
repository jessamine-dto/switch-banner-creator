import {generateBanner} from "./main.js";



// TODO: use window hashes to store tab
const switchButtons = Array.from(document.getElementsByClassName("switch-type-button"));

let activeTab = "";



export function initializeButtons() {
	for(const button of switchButtons) {
		button.addEventListener("click", ev => switchTab((<Element>ev.target).id));
	}
}



function switchTab(id: string) {
	const target = document.getElementById(id)!;

	if(target.classList.contains(id)) {
		return;
	}

	activeTab = id;


	for(const button of switchButtons) {
		button.classList.remove("switch-type-active");
	}


	target.classList.add("switch-type-active");

	generateBanner();
}



export function getActiveTab() {
	return activeTab;
}
