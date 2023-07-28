type FigChars = {
	[charCode: number]: string[],
	numChars: number
};



const OPTIONS = {
	fittingRules: {
		hRule1: true,
		hRule2: true,
		hRule3: true,
		hRule4: true,
		hLayout: 3
	},

	hardBlank: "$",
	numCommentLines: 16,
	height: 8
}



const HARDBLANK_REGEX = new RegExp(`\\${OPTIONS.hardBlank}`, "g");



export default class FigletDoomFont {
	private smushHRule1(char1: string, char2: string) {
		if (char1 === char2 && char1 !== OPTIONS.hardBlank) {
			return char1;
		}

		return false;
	}

	private smushHRule2(char1: string, char2: string) {
		const underscoreSmushing = "|/\\[]{}()<>";

		if(char1 === "_" && underscoreSmushing.includes(char2)) {
			return char2;
		} else if(char2 === "_" && underscoreSmushing.includes(char1)) {
			return char1;
		}

		return false;
	}

	private smushHRule3(char1: string, char2: string) {
		const hierarchySmushing = "| /\\ [] {} <>";

		const char1Pos = hierarchySmushing.indexOf(char1);
		const char2Pos = hierarchySmushing.indexOf(char2);

		if(char1Pos && char2Pos && char1Pos !== char2Pos && Math.abs(char1Pos - char2Pos) !== 1) {
			return hierarchySmushing.charAt(Math.max(char1Pos, char2Pos));
		}

		return false;
	}

	private smushHRule4(char1: string, char2: string) {
		const oppositePairSmushing = "[] {} ()";

		const char1Pos = oppositePairSmushing.indexOf(char1);
		const char2Pos = oppositePairSmushing.indexOf(char2);

		if(char1Pos && char2Pos && Math.abs(char1Pos - char2Pos) <= 1) {
			return "|";
		}

		return false;
	}

	private smushUniversal(char1: string, char2: string) {
		if((char2 === "" || char2 === "") ||
			(char2 === OPTIONS.hardBlank && char1 !== " ")) {
			return char1;
		}

		return char2;
	}



	private horizontalSmushLengthMemo!: {[text1: string]: {[text2: string]: number}};

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

				validSmush = !!this.smushHRule1(text1Char, text2Char) ||
				!!this.smushHRule2(text1Char, text2Char) ||
				!!this.smushHRule3(text1Char, text2Char) ||
					!!this.smushHRule4(text1Char, text2Char);

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
				const char1 = textLine1.charAt(signedOverlapStart + j);
				const char2 = textLine2.charAt(j);

				if(char1 === " " || char2 === " ") {
					piece2 += this.smushUniversal(char1, char2);
					continue;
				}


				let nextCh: string | boolean = this.smushHRule1(char1, char2) ||
					this.smushHRule2(char1, char2) ||
					this.smushHRule3(char1, char2) ||
					this.smushHRule4(char1, char2) ||
					this.smushUniversal(char1, char2);

				piece2 += nextCh;
			}

			let piece3 = (overlap >= textLine2Length) ? "" : textLine2.slice(overlap, textLine2Length);

			output[i] = piece1 + piece2 + piece3;
		}

		return output;
	}

	private generateFigTextLine(text: string, figChars: FigChars) {
		let outputText = [];

		// useless
		// TODO: disable
		for(let row = 0; row < OPTIONS.height; row++) {
			outputText[row] = "";
		}

		// i = char index
		for(let charIndex = 0; charIndex < text.length; charIndex++) {
			const figChar = figChars[text.charCodeAt(charIndex)];

			if (!figChar) continue;

			let overlap = Infinity;

			for(let row = 0; row < OPTIONS.height; row++) {
				overlap = Math.min(overlap, this.getHorizontalSmushLength(outputText[row], figChar[row]));
			}

			overlap = (overlap === Infinity) ? 0 : overlap;
			outputText = this.horizontalSmush(outputText, figChar, overlap);
		}

		// always equal to 8?
		for(let row = 0; row < outputText.length; row++) {
			outputText[row] = outputText[row].replace(HARDBLANK_REGEX, " ");
		}

		return outputText;

		// return outputText.map(row => row.replace(HARDBLANK_REGEX, " "));
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

		let endCharRegex;


		// for loop can be written here? idk
		while(lines.length > 0 && this.figChars.numChars < charCodes.length) {
			let currentCharCode = charCodes[this.figChars.numChars];

			this.figChars[currentCharCode] = lines.slice(0, OPTIONS.height);

			for(let i = 0; i < OPTIONS.height; i++) {
				let currentCharCodeAtLine = this.figChars[currentCharCode][i];

				if(!currentCharCode) {
					this.figChars[currentCharCode][i] = "";
				} else {
					endCharRegex = new RegExp(`\\${currentCharCodeAtLine.charAt(currentCharCodeAtLine.length - 1)}$`);
					this.figChars[currentCharCode][i] = currentCharCodeAtLine.replace(endCharRegex, "");
				}
			}

			this.figChars.numChars++;
		}


		while(lines.length > 0) {
			let currentCharCode: number | string = lines.splice(0, 1)[0].split(" ")[0];

			if ( /^0[xX][0-9a-fA-F]+$/.test(currentCharCode)) {
				currentCharCode = parseInt(currentCharCode, 16);
			} else if ( /^0[0-7]+$/.test(currentCharCode)) {
				currentCharCode = parseInt(currentCharCode, 8);
			} else if ( /^[0-9]+$/.test(currentCharCode)) {
				currentCharCode = parseInt(currentCharCode, 10);
			} else {
				break;
			}

			this.figChars[currentCharCode] = lines.splice(0, OPTIONS.height);
			// remove end sub-chars
			for (let i = 0; i < OPTIONS.height; i++) {
				let currentCharCodeAtLine = this.figChars[currentCharCode][i];

			if (!currentCharCode) {
				this.figChars[currentCharCode][i] = "";
			} else {
					endCharRegex = new RegExp(`\\${currentCharCodeAtLine.charAt(currentCharCodeAtLine.length - 1)}$`);
					this.figChars[currentCharCode][i] = currentCharCodeAtLine.replace(endCharRegex, "");
				}
			}

			this.figChars.numChars++;
		}

		this.isLoaded = true;
	}


	private figChars: FigChars;
	private isLoaded: boolean;

	getText(text: string) {
		if(this.isLoaded === false) {
			return "";
		}


		return text
			.split("\n")
			.map(line => this.generateFigTextLine(line, this.figChars))
			.join("\n");
	}



	constructor() {
		this.horizontalSmushLengthMemo = {};
		this.isLoaded = false;
		this.figChars = {
			numChars: 0
		};
	}
}
