// this is will convert the multi-element input system into a string
const schoolSelect = document.getElementById("school-select");
const wiringClosetInput = document.getElementById("wiring-closet");
const closetTypeSelect = document.getElementById("closet-type-select");
export default function getInput() {
    let school = schoolSelect.selectedOptions[0].textContent;
    if (school === "school...") {
        school = "";
    }
    const wiringCloset = wiringClosetInput.value;
    let closetType = closetTypeSelect.selectedOptions[0].textContent;
    if (closetType === "closet type...") {
        closetType = "";
    }
    return `${school} ${wiringCloset} ${closetType}`;
}
