// a heavily stripped down version of https://patorjk.com/software/taag/



type FigChars = {
	[charCode: number]: string[],
	numChars: number
};



const OPTIONS = {
	EOL: "@",
	HARD_BLANK: "$",
	height: 8
}



const HARDBLANK_REGEX = new RegExp(`\\${OPTIONS.HARD_BLANK}`, "g");
const END_CHAR_REGEX = new RegExp(`\\${OPTIONS.EOL}+$`);



export default class FigletDoomFont {
	private figChars: FigChars;
	private isLoaded: boolean;

	private horizontalSmushLengthMemo: {[text1: string]: {[text2: string]: number}};



	private horizontalSmush1(char1: string, char2: string) {
		if (char1 === char2 && char1 !== OPTIONS.HARD_BLANK) {
			return char1;
		}

		return false;
	}

	private horizontalSmush2(char1: string, char2: string) {
		const underscoreSmushing = "|/\\[]{}()<>";

		if(char1 === "_" && underscoreSmushing.includes(char2)) {
			return char2;
		} else if(char2 === "_" && underscoreSmushing.includes(char1)) {
			return char1;
		}

		return false;
	}

	private horizontalSmush3(char1: string, char2: string) {
		const hierarchySmushing = "| /\\ [] {} <>";

		const char1Pos = hierarchySmushing.indexOf(char1);
		const char2Pos = hierarchySmushing.indexOf(char2);

		if(char1Pos !== -1 && char2Pos !== -1 &&
			char1Pos !== char2Pos && Math.abs(char1Pos - char2Pos) !== 1) {
			return hierarchySmushing.charAt(Math.max(char1Pos, char2Pos));
		}

		return false;
	}

	private horizontalSmush4(char1: string, char2: string) {
		const oppositePairSmushing = "[] {} ()";

		const char1Pos = oppositePairSmushing.indexOf(char1);
		const char2Pos = oppositePairSmushing.indexOf(char2);

		if(char1Pos !== -1 && char2Pos !== -1 &&
			Math.abs(char1Pos - char2Pos) <= 1) {
			return "|";
		}

		return false;
	}

	private universalSmush(char1: string, char2: string) {
		if((char2 === "" || char2 === " ") ||
			(char2 === OPTIONS.HARD_BLANK && char1 !== " ")) {
			return char1;
		}

		return char2;
	}



	// i have no clue how this function works i just rewrote it for funsies
	private getHorizontalSmushLength(text1: string, text2: string) {
		const text1Length = text1.length;
		const text2Length = text2.length;

		const maxDistance = text1Length;

		let currentDistance = 1;
		let breakAfterwards = false;
		let validSmush = false;

		if(text1Length === 0) return 0;


		let text1InMemo = false;

		if(this.horizontalSmushLengthMemo[text1]) {
			text1InMemo = true;

			if(this.horizontalSmushLengthMemo[text1][text2]) {
				return this.horizontalSmushLengthMemo[text1][text2];
			}
		}



		distanceCalculation: while(currentDistance <= maxDistance) {
			// substr: select from text1Length - currentDistance with a length of currentDistance
			// substring: select from text1Length - currentDistance to (text1Length - currentDistance) + currentDistance
			// const text1Segment = text1.slice(text1Length - currentDistance, text1Length);
			// const text2Segement = text2.slice(0, Math.min(currentDistance, text2Length));

			for(let i = 0; i < Math.min(currentDistance, text2Length); i++) {
				const text1Char = text1.charAt(text1Length - currentDistance + i);
				const text2Char = text2.charAt(i);

				if(text1Char === " " || text2Char === " ") continue;

				breakAfterwards = true;
				validSmush = false;

				validSmush = !!this.horizontalSmush1(text1Char, text2Char) ||
					!!this.horizontalSmush2(text1Char, text2Char) ||
					!!this.horizontalSmush3(text1Char, text2Char) ||
					!!this.horizontalSmush4(text1Char, text2Char);

				if (!validSmush) {
					currentDistance--;
					break distanceCalculation;
				}
			}

			if(breakAfterwards) break;
			currentDistance++;
		}


		let minDistance = Math.min(maxDistance, currentDistance);

		if(!text1InMemo) {
			this.horizontalSmushLengthMemo[text1] = {};
		}

		this.horizontalSmushLengthMemo[text1][text2] = minDistance;

		return minDistance;
	}



	private horizontalSmush(textLines1: string[], textLines2: string[], overlap: number) {
		const output = [];

		for(let i = 0; i < OPTIONS.height; i++) {
			const textLine1 = textLines1[i];
			const textLine2 = textLines2[i];

			const textLine1Length = textLine1.length;
			const textLine2Length = textLine2.length;

			let signedOverlapStart = Math.max(0, textLine1Length - overlap);

			const piece1 = textLine1.slice(0, signedOverlapStart);
			let piece2 = "";

			// textLine1Length - overlap --> textLineLength (last -overlap)
			// const segment1 = textLine1.slice(signedOverlapStart, textLine1Length);
			// 0 --> overlap/textLine2Length
			// const segment2 = textLine2.slice(0, Math.min(overlap, textLine2Length));

			for(let j = 0; j < overlap; j++) {
				const char1 = (j < textLine1Length) ? textLine1.charAt(signedOverlapStart + j) : " ";
				const char2 = (j < textLine2Length) ? textLine2.charAt(j) : " ";


				if(char1 === " " || char2 === " ") {
					piece2 += this.universalSmush(char1, char2);
					continue;
				}


				let nextCh = this.horizontalSmush1(char1, char2) ||
					this.horizontalSmush2(char1, char2) ||
					this.horizontalSmush3(char1, char2) ||
					this.horizontalSmush4(char1, char2) ||
					this.universalSmush(char1, char2); // always returns string

				piece2 += nextCh;
			}

			let piece3 = textLine2.slice(overlap, textLine2Length);


			output.push(piece1 + piece2 + piece3);
		}

		return output;
	}

	private generateLineOfFigText(text: string) {
		let outputText: string[] = new Array(OPTIONS.height).fill("");

		for(let charIndex = 0; charIndex < text.length; charIndex++) {
			const figChar = this.figChars[text.charCodeAt(charIndex)];

			if (!figChar) continue;

			let overlap = Infinity;

			for(let row = 0; row < OPTIONS.height; row++) {
				// TODO: how to optimize this? this function is called way too much
				overlap = Math.min(overlap, this.getHorizontalSmushLength(outputText[row], figChar[row]));
			}

			overlap = (overlap === Infinity) ? 0 : overlap;
			outputText = this.horizontalSmush(outputText, figChar, overlap);
		}


		return outputText.map(row => row.replace(HARDBLANK_REGEX, " "));
	}



	// public methods
	async load(url: string) {
		const data = await fetch(url)
			.then(res => res.text());

		let lines = data.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
		if(lines.length === 0) {
			return;
		}


		const charCodes = [];

		for(let i = 32; i <= 126; i++) {
			charCodes.push(i);
		}

		charCodes.push(...[196, 214, 220, 228, 246, 252, 223]);


		while(lines.length > 0 && this.figChars.numChars < charCodes.length) {
			let currentCharCode = charCodes[this.figChars.numChars];

			this.figChars[currentCharCode] = lines
				.splice(0, OPTIONS.height)
				.map(charLine => charLine.replace(END_CHAR_REGEX, ""));

			this.figChars.numChars++;
		}


		this.isLoaded = true;
	}

	getText(text: string) {
		if(this.isLoaded === false) {
			return "";
		}

		return this.generateLineOfFigText(text).join("\n");
	}



	constructor() {
		this.horizontalSmushLengthMemo = {};
		this.isLoaded = false;
		this.figChars = {
			numChars: 0
		};
	}
}
