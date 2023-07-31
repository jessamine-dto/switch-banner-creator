

/*
	FIGlet.js (a FIGDriver for FIGlet fonts)
	By Patrick Gillespie (patorjk@gmail.com)
	Originally Written For: http://patorjk.com/software/taag/
	License: MIT (with this header staying intact)

	This JavaScript code aims to fully implement the FIGlet spec.
	Full FIGlet spec: http://patorjk.com/software/taag/docs/figfont.txt

	If you use this for a public app, a link back to TAAG is appreciated
	but not necessary.

	Modified (trimmed) by Layne Ogden
*/

"use strict";

var Figlet = Figlet || (function() {

	// ---------------------------------------------------------------------
	// private static variables
	const CONTROLLED_SMUSHING = 3;

	// ---------------------------------------------------------------------
	// private static methods


	// simplified to contain only the computed values for the doom font
	function getSmushingRules() {
		return {
			"hRule4": true,
			"hRule3": true,
			"hRule2": true,
			"hRule1": true,
			"hLayout": 3
		};
	}

	/* The [vh]Rule[1-6]_Smush functions return the smushed character OR false if the two characters can't be smushed */

	/*
		Rule 1: EQUAL CHARACTER SMUSHING (code value 1)

			Two sub-characters are smushed into a single sub-character
			if they are the same.  This rule does not smush
			hardblanks.  (See rule 6 on hardblanks below)
	*/
	function hRule1_Smush(ch1, ch2, hardBlank) {
		if (ch1 === ch2 && ch1 !== hardBlank) {return ch1;}
		return false;
	}

	/*
		Rule 2: UNDERSCORE SMUSHING (code value 2)

			An underscore ("_") will be replaced by any of: "|", "/",
			"\", "[", "]", "{", "}", "(", ")", "<" or ">".
	*/
	function hRule2_Smush(ch1, ch2) {
		var rule2Str = "|/\\[]{}()<>";
		if (ch1 === "_") {
			if (rule2Str.indexOf(ch2) !== -1) {return ch2;}
		} else if (ch2 === "_") {
			if (rule2Str.indexOf(ch1) !== -1) {return ch1;}
		}
		return false;
	}

	/*
		Rule 3: HIERARCHY SMUSHING (code value 4)

			A hierarchy of six classes is used: "|", "/\", "[]", "{}",
			"()", and "<>".  When two smushing sub-characters are
			from different classes, the one from the latter class
			will be used.
	*/
	function hRule3_Smush(ch1, ch2) {
		var rule3Classes = "| /\\ [] {} () <>";
		var r3_pos1 = rule3Classes.indexOf(ch1);
		var r3_pos2 = rule3Classes.indexOf(ch2);
		if (r3_pos1 !== -1 && r3_pos2 !== -1) {
			if (r3_pos1 !== r3_pos2 && Math.abs(r3_pos1-r3_pos2) !== 1) {
				return rule3Classes.substr(Math.max(r3_pos1,r3_pos2), 1);
			}
		}
		return false;
	}

	/*
		Rule 4: OPPOSITE PAIR SMUSHING (code value 8)

			Smushes opposing brackets ("[]" or "]["), braces ("{}" or
			"}{") and parentheses ("()" or ")(") together, replacing
			any such pair with a vertical bar ("|").
	*/
	function hRule4_Smush(ch1, ch2) {
		var rule4Str = "[] {} ()";
		var r4_pos1 = rule4Str.indexOf(ch1);
		var r4_pos2 = rule4Str.indexOf(ch2);

		if (r4_pos1 !== -1 && r4_pos2 !== -1) {
			if (Math.abs(r4_pos1-r4_pos2) <= 1) {
				return "|";
			}
		}
		return false;
	}

	/*
		Universal smushing simply overrides the sub-character from the
		earlier FIGcharacter with the sub-character from the later
		FIGcharacter.  This produces an "overlapping" effect with some
		FIGfonts, wherin the latter FIGcharacter may appear to be "in
		front".
	*/
	function uni_Smush(ch1, ch2, hardBlank) {
		if (ch2 === " " || ch2 === "") {
			return ch1;
		} else if (ch2 === hardBlank && ch1 !== " ") {
			return ch1;
		} else {
			return ch2;
		}
	}

	// -------------------------------------------------------------------------
	// main horizontal smush routines (excluding rules)

	function getHorizontalSmushLength(txt1, txt2, opts) {
		var ii, len1 = txt1.length, len2 = txt2.length;
		var maxDist = len1;
		var curDist = 1;
		var breakAfter = false;
		var validSmush = false;
		var seg1, seg2, ch1, ch2;
		if (len1 === 0) {return 0;}

		distCal: while (curDist <= maxDist) {
			seg1 = txt1.substr(len1-curDist,curDist);
			seg2 = txt2.substr(0,Math.min(curDist,len2));
			for (ii = 0; ii < Math.min(curDist,len2); ii++) {
				ch1 = seg1.substr(ii,1);
				ch2 = seg2.substr(ii,1);
				if (ch1 !== " " && ch2 !== " " ) {
					breakAfter = true; // we know we need to break, but we need to check if our smushing rules will allow us to smush the overlapped characters
					validSmush = false; // the below checks will let us know if we can smush these characters

					validSmush = hRule1_Smush(ch1,ch2,opts.hardBlank);
					validSmush = (!validSmush) ? hRule2_Smush(ch1,ch2,opts.hardBlank) : validSmush;
					validSmush = (!validSmush) ? hRule3_Smush(ch1,ch2,opts.hardBlank) : validSmush;
					validSmush = (!validSmush) ? hRule4_Smush(ch1,ch2,opts.hardBlank) : validSmush;

					if (!validSmush) {
						curDist = curDist - 1;
						break distCal;
					}
				}
			}
			if (breakAfter) {break;}
			curDist++;
		}

		console.log(maxDist, curDist);

		return Math.min(maxDist,curDist);
	}

	function horizontalSmush(textBlock1, textBlock2, overlap, opts) {
		var ii, jj, outputFig = [],
			overlapStart,piece1,piece2,piece3,len1,len2,txt1,txt2;

		for (ii = 0; ii < opts.height; ii++) {
			txt1 = textBlock1[ii];
			txt2 = textBlock2[ii];
			len1 = txt1.length;
			len2 = txt2.length;
			overlapStart = len1-overlap;
			piece1 = txt1.substr(0,Math.max(0,overlapStart));
			piece2 = "";

			// determine overlap piece
			var seg1 = txt1.substr(Math.max(0,len1-overlap),overlap);
			var seg2 = txt2.substr(0,Math.min(overlap,len2));

			for (jj = 0; jj < overlap; jj++) {
				var ch1 = (jj < len1) ? seg1.substr(jj,1) : " ";
				var ch2 = (jj < len2) ? seg2.substr(jj,1) : " ";

				if (ch1 !== " " && ch2 !== " ") {
					// Controlled Smushing
					var nextCh = "";
					nextCh = hRule1_Smush(ch1,ch2,opts.hardBlank);
					nextCh = (!nextCh) ? hRule2_Smush(ch1,ch2,opts.hardBlank) : nextCh;
					nextCh = (!nextCh) ? hRule3_Smush(ch1,ch2,opts.hardBlank) : nextCh;
					nextCh = (!nextCh) ? hRule4_Smush(ch1,ch2,opts.hardBlank) : nextCh;
					nextCh = nextCh || uni_Smush(ch1, ch2, opts.hardBlank);
					piece2 += nextCh;
				} else {
					piece2 += uni_Smush(ch1, ch2, opts.hardBlank);
				}
			}

			if (overlap >= len2) {
				piece3 = "";
			} else {
				piece3 = txt2.substr(overlap,Math.max(0,len2-overlap));
			}
			outputFig[ii] = piece1 + piece2 + piece3;
		}
		return outputFig;
	}

	function generateFigTextLine(txt, figChars, opts) {
		var charIndex, figChar, overlap = 0, row, outputFigText = [], len=opts.height;
		for (row = 0; row < len; row++) {
			outputFigText[row] = "";
		}
		len=txt.length
		for (charIndex = 0; charIndex < len; charIndex++) {
			figChar = figChars[txt.substr(charIndex,1).charCodeAt(0)];
			if (figChar) {
				overlap = 10000;// a value too high to be the overlap
				for (row = 0; row < opts.height; row++) {
					overlap = Math.min(overlap, getHorizontalSmushLength(outputFigText[row], figChar[row], opts));
				}
				overlap = (overlap === 10000) ? 0 : overlap;
				outputFigText = horizontalSmush(outputFigText, figChar, overlap, opts);
			}
		}
		// remove hardblanks
		len = outputFigText.length;
		for (row = 0; row < len; row++) {
			outputFigText[row] = outputFigText[row].replace(new RegExp("\\"+opts.hardBlank,"g")," ")
		}
		return outputFigText;
	}

	// -------------------------------------------------------------------------
	// object definition

	return function(preload) {
		var me = this,
			opts = null,
			comment = "",
			figChars = {};

		// ---------------------------------------------------------------------
		// public methods

		me.loadHorizontalOpts = function() {
			params = {};

			// default smushing
			params = {"hLayout": CONTROLLED_SMUSHING,"hRule1":true,"hRule2":true,"hRule3":true,"hRule4":true};

			for (prop in params) {
				opts.fittingRules[prop] = params[prop];
			}
		};

		me.load = function(data) {
			data = data.replace(/\r\n/g,"\n").replace(/\r/g,"\n");
			var lines = data.split("\n");
			var headerData = lines.splice(0,1)[0].split(" ");
			opts = {};
			opts.hardBlank = headerData[0].substr(5,1);
			opts.height = parseInt(headerData[1], 10);
			opts.numCommentLines = parseInt(headerData[5], 10);
			opts.fittingRules = getSmushingRules();
			comment = lines.splice(0,opts.numCommentLines).join("\n");
			figChars = {};

			var charNums = [], cNum, ii;
			for (ii = 32; ii <= 126; ii++) {
				charNums.push(ii);
			}
			charNums = charNums.concat(196, 214, 220, 228, 246, 252, 223);
			figChars.numChars = 0;

			var endCharRegEx;

			while (lines.length > 0 && figChars.numChars < charNums.length) {
				cNum = charNums[figChars.numChars];
				figChars[cNum] = lines.splice(0,opts.height);
				// remove end sub-chars
				for (ii = 0; ii < opts.height; ii++) {
					if (typeof figChars[cNum][ii] === "undefined") {
						figChars[cNum][ii] = "";
					} else {
						endCharRegEx = new RegExp("\\"+figChars[cNum][ii].substr(figChars[cNum][ii].length-1,1)+"+$");
						figChars[cNum][ii] = figChars[cNum][ii].replace(endCharRegEx,"");
					}
				}
				figChars.numChars++;
			}

			// load any extra characters
			while (lines.length > 0) {
				cNum = lines.splice(0,1)[0].split(" ")[0];
				if ( /^0[xX][0-9a-fA-F]+$/.test(cNum) ) {
					cNum = parseInt(cNum, 16);
				} else if ( /^0[0-7]+$/.test(cNum) ) {
					cNum = parseInt(cNum, 8);
				} else if ( /^[0-9]+$/.test(cNum) ) {
					cNum = parseInt(cNum, 10);
				} else {
					if (cNum === "") {break;}
					// something's wrong
					//console.log("Invalid data:"+cNum);
					break;
				}

				figChars[cNum] = lines.splice(0,opts.height);
				// remove end sub-chars
				for (ii = 0; ii < opts.height; ii++) {
					if (typeof figChars[cNum][ii] === "undefined") {
						figChars[cNum][ii] = "";
					} else {
						endCharRegEx = new RegExp("\\"+figChars[cNum][ii].substr(figChars[cNum][ii].length-1,1)+"+$");
						figChars[cNum][ii] = figChars[cNum][ii].replace(endCharRegEx,"");
					}
				}
				figChars.numChars++;
			}
		};

		me.getComment = function() {
			return comment;
		};

		me.getText = function(txt) {
			txt = txt.replace(/\r\n/g,"\n").replace(/\r/g,"\n");
			var lines = txt.split("\n");
			var figLines = [];
			var ii, len, output;
			len = lines.length;
			for (ii = 0; ii < len; ii++) {
				figLines.push( generateFigTextLine(lines[ii], figChars, opts) );
			}
			len = figLines.length;
			output = figLines[0];


			return output.join("\n");
		};



		// convenience method i made because i feel like it
		if(preload) {
			me.load(preload);
		}
	};
})();