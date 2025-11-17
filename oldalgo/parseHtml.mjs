// JSON format is still not finalized

// Simple parser from HTML to JSON
// Tested for getLinkedSections
const matchRowGroup = /<(thead|tbody)>[\s\S]*?<\/\1>/g;
const matchTr = /<tr>[\s\S]*?<\/tr>/g;
const matchTdTh = /<(td|th)[^>]*>[\s\S]*?<\/\1>/g;
export function parseHtmlTable(htmlString) {
	let result = [];
	const matches = htmlString.matchAll(matchRowGroup);
	for (const match of matches) {
		let rowGroup = { type: match[1], data: [] };
		const rows = match[0].matchAll(matchTr);
		// console.log(match[0]);
		for (const row of rows) {
			rowGroup.data.push([...row[0].matchAll(matchTdTh)].map(x => {
				// innerHtml of the td/th element
				return x[0];
			}));
		}
		// Test if no rows in rowGroup
		if (rowGroup.data.length === 0) {
			rowGroup.data = { noTr: true, data: match[0].match(matchTdTh)[0] };
		}
		result.push(rowGroup);
	}
	return result;
}

// Simple parser for line separated colon delimited span data
// Intended for getEnrollmentInfo
const matchSpanBrHr = /<br>|<hr>|<span[^>]*>[\s\S]*?<\/span>/g;
export function parseSpanEntries(htmlString) {
	let result = {};
	const matches = htmlString.matchAll(matchSpanBrHr);
	let currentProperty = null;
	for (const match of matches) {
		if (match[0] == "<hr>" || match[0] == "<br>") {
			continue; // Could be changed to treat <br> as significant
		}
		const innerText = match[0].substring(match[0].indexOf(">") + 1, match[0].length - 7);
		if (currentProperty == null) {
			if (innerText[innerText.length-1] != ":") {
				throw new Error(`Expected colon at end of ${innerText}`);
			}
			currentProperty = innerText.substring(0, innerText.length - 1);
		} else {
			result[currentProperty] = innerText;
			currentProperty = null;
		}
	}
	return result;
}

// [\s\S]*? matches arbitrary characters while minimizing length
// Not including g tag on this, not sure if that's best practice
const matchTable = /<table[^>]*>[\s\S]*?<\/table>/;
function extractHtmlTable(htmlString) {
	return htmlString.match(matchTable)[0];
}
