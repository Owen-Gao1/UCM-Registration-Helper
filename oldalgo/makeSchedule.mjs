// Note that this file has not been extensively tested
// The first commit of this branch is just to get something down
// since so much needs to be done to make it easier to test

// .mjs just so you know it's meant for local use
// No point in a proper CLI, so read README.md if confused

import { fetchCrn } from "../webScraper/fetchCrn.mjs";

const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

// courses is a list of CRN lists
export async function* solve(courses, term = "202510") {
    let busy = {};
    dayNames.forEach(day => busy[day] = []);
    let output = new Array(courses.length - 1);
    let cache = new Map();
    console.log(fetchCrn);
    // Cache data for every CRN for simplicity
    for (const group of courses) {
        for (const crn of group) {
            let data = await getClassTimes(crn, term, cache);
            // console.log("In bruteforce.mjs", data);
            cache.set(crn, data.getFacultyMeetingTimes.fmt[0].meetingTime);
        }
    }
    yield* solveHelper(courses, 0, busy, output, cache);
}

function* solveHelper(courses, iCourse, busy, output, cache) {
    for (const crn of courses[iCourse]) {
        let data = cache.get(crn);
        if (timeCompatible(busy, data)) {
            if (iCourse === courses.length - 1) {
                yield [...output, crn];
            } else {
				output[iCourse] = crn;
                yield* solveHelper(courses, iCourse + 1, busyAdded(busy, data), output, cache);
            }
        }
    }
}

function timeCompatible(busy, candidate) {
    let beginTime = parseInt(candidate.beginTime);
    let endTime = parseInt(candidate.endTime);
    for (const name of dayNames) {
        if (candidate[name]) {
            // console.log(busy, busy[name]);
            for (const [beginBusy, endBusy] of busy[name]) {
                // No passing period is required here
                if (endTime > beginBusy && beginTime < endBusy) {
                    return false;
                }
            }
        }
    }
    return true;
}

// solveHelper can be changed to avoid inefficient copies
// but that seems overly complex for now
function busyAdded(busy, candidate) {
    busy = JSON.parse(JSON.stringify(busy));
    let beginTime = parseInt(candidate.beginTime);
    let endTime = parseInt(candidate.endTime);
    dayNames.forEach(name => {
        if (candidate[name]) {
            // Note that the arrays in busy are not sorted by beginTime
            // No need for that unless we want to have binary search,
            // which is only better if we have a ton of classes in a day
			busy[name].push([beginTime, endTime]);
        }
    });
    return busy;
}

async function getClassTimes(crn, term) {
    try {
        let data = await fetchCrn(crn, term);
        // We only need beginTime, endTime, and the day properties
        // No filtering for the sake of simplicity
        return data;
        // cache.set(crn, data.getFacultyMeetingTimes.fmt[0].meetingTime);
    } catch (error) {
        console.log(`Failed to fetch data for CRN ${crn}`);
        throw error;
    }
}
