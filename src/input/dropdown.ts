const CARRIAGE_AND_NEWLINE_REGEX = new RegExp("\\r\\n", "g");
const CARRIAGE_REGEX = new RegExp("\\r", "g");




export default async function initalizeSchoolDropdown() {
	const schoolsText = await fetch("./schools.txt")
		.then(res => res.text());

	const schools = schoolsText
		.replace(CARRIAGE_AND_NEWLINE_REGEX, "\n")
		.replace(CARRIAGE_REGEX, "\n")
		.split("\n")
		.filter(line => line !== "");


	// console.log(schools);
}
