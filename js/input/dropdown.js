const schoolSelect = document.getElementById("school-select");
const CARRIAGE_AND_NEWLINE_REGEX = new RegExp("\\r\\n", "g");
const CARRIAGE_REGEX = new RegExp("\\r", "g");
export default async function initalizeSchoolDropdown() {
    const schoolsText = await fetch("./schools.txt")
        .then(res => res.text());
    const schoolNames = schoolsText
        .replace(CARRIAGE_AND_NEWLINE_REGEX, "\n")
        .replace(CARRIAGE_REGEX, "\n")
        .split("\n")
        .filter(line => line !== "");
    // console.log(schools);
    const optionArray = schoolNames
        .map(schoolName => generateOption(schoolName));
    schoolSelect.append(...optionArray);
}
function generateOption(schoolName) {
    const option = document.createElement("option");
    option.textContent = schoolName;
    return option;
}
