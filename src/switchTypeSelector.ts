// TODO: use window hashes to store tab
const switchButtons = Array.from(document.getElementsByClassName("switch-type-button"));




export default function initializeButtons() {
	for(const button of switchButtons) {
		button.addEventListener("click", ev => switchTab((<Element>ev.target).id));
	}
}



function switchTab(id: string) {
	const target = document.getElementById(id)!;

	if(target.classList.contains(id)) {
		return;
	}


	for(const button of switchButtons) {
		button.classList.remove("switch-type-active");
	}


	target.classList.add("switch-type-active");
}
