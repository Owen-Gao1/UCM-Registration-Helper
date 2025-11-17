// TODO Finalize output format
// TODO Add support for passing in an object/array of CRNs
// TODO Add proper error handling

import fetch from "node-fetch";

const queries = [
	"getClassDetails",
	"getSectionBookstoreDetails",
	"getCourseDescription",
	"getSyllabus",
	"getRestrictions",
	"getFacultyMeetingTimes",
	"getEnrollmentInfo",
	"getCorequisites",
	"getSectionPrerequisites",
	"getCourseMutuallyExclusions",
	"getXlstSections",
	"getLinkedSections",
	"getFees",
	"getSectionCatalogDetails",
	"getSectionAttributes"
];

export async function fetchCrn(crn, term = "202510") {
	const pathHead = "https://reg-prod.ec.ucmerced.edu/StudentRegistrationSsb/ssb/searchResults/";
	const pathTail = `?term=${term}&courseReferenceNumber=${crn}`;
	let output = {};
	for (const query of queries) {
		const response = await fetch(pathHead + query + pathTail);
		if (query == "getFacultyMeetingTimes") {
			output[query] = await response.json();
		} else {
			output[query] = await response.text();
		}
	}
	return output;
}
