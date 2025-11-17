// This file is intended for use on the following page:
// https://reg-prod.ec.ucmerced.edu/StudentRegistrationSsb/ssb/registration

// For best results, first navigate to a state with a table of data first
// Sometimes, this code just does not work and trying to create the iframe results in a 500 error
// I believe this is just due to a cookie expiring, so close the window, reopen, and try again
// Sometimes, the data property in the JSON is null, so just retry if that happens

// This file could be refactored a lot to make it more maintainable,
// but since it's not being imported by anything else in the project,
// I have chosen not to spend my time refactoring this.

// Scrapes all SCC data into a single object
// Short for get subject course combo list
async function getSCCList(txt_term = "202510", pageMaxSize = 50) {
  const output = {};
  for (let i = 0; ; i += pageMaxSize) {
    await sleepBetweenQueries(i);
    const entries = await querySCC(i, sleepForIframe, txt_term, pageMaxSize);
    if (entries.length === 0) {
      break;
    }
    entries.forEach((entry) => {
      output[entry[0]] ??= [];
      output[entry[0]].push(entry[1]);
    });
  }
  return output;
}

async function querySCC(
  pageOffset,
  sleep,
  txt_term = "202510",
  pageMaxSize = 50
) {
  // Does not remove all HTML, but suffices
  document.body.innerHTML = "";
  // Short for registration helper iframe
  const rhif = document.createElement("iframe");
  rhif.setAttribute(
    "src",
    `https://reg-prod.ec.ucmerced.edu/StudentRegistrationSsb/ssb/courseSearchResults/courseSearchResults?txt_term=${txt_term}&startDatepicker=&endDatepicker=&pageOffset=${pageOffset}&pageMaxSize=${pageMaxSize}&sortColumn=subjectDescription&sortDirection=asc`
  );
  // Hacky solution with closures
  let rhifLoaded = false;
  rhif.addEventListener("load", (event) => {
    rhifLoaded = true;
  });
  // Required to make an iframe load
  document.body.appendChild(rhif);
  for (let i = 0; !rhifLoaded; ++i) {
    await sleep(i);
  }
  const json = JSON.parse(
    rhif.contentDocument.querySelector("body>pre").innerText
  );
  // If failing, test entry.subjectCode instead
  return json.data.map((entry) => [entry.subject, entry.courseNumber]);
}

// This function mutates an object ref of the following format:
// { unfinished: ["AE", "ANTH"...], data: { "WRI": { "001": [10965, 10966...] } } }
// scc is just the output of getSCCList and does not get mutated
// Not very maintanable code, but that shouldn't be a problem

// Please use await when calling this function and wrap it in basic error handling
// Be sure to log if there are any errors at all, since it's difficult to verify
// whether the CRN list is exhaustive
async function appendCRN(ref, scc, txt_term = "202510", pageMaxSize = 50) {
  if (ref.unfinished.length === 0) {
    return;
  }
  // Only allowing splitting task up into subject-sized chunks
  // for the sake of simplicity.
  const subject = ref.unfinished[ref.unfinished.length - 1];
  ref.data[subject] = {};
  for (const courseCode of scc[subject]) {
    await sleepBetweenQueries();
    let crn = await queryCRN(
      `${subject}${courseCode}`,
      0,
      sleepForIframe,
      txt_term,
      pageMaxSize
    );
    // Pretty terrible code, but it works
    const rhif = document.querySelector("iframe");
    const countCRN = JSON.parse(
      rhif.contentDocument.querySelector("body>pre").innerText
    ).totalCount;
    console.log(subject, courseCode, countCRN);
    for (let i = pageMaxSize; i < countCRN; i += pageMaxSize) {
      await sleepBetweenQueries();
      crn.push(
        ...(await queryCRN(
          `${subject}${courseCode}`,
          i,
          sleepForIframe,
          txt_term,
          pageMaxSize
        ))
      );
    }
    ref.data[subject][courseCode] = crn;
  }
  // Now we finished that part
  ref.unfinished.pop();
}

async function queryCRN(
  scc,
  pageOffset,
  sleep,
  txt_term = "202510",
  pageMaxSize = 50
) {
  const xhr = new XMLHttpRequest();
  await xhr.open(
    "POST",
    "https://reg-prod.ec.ucmerced.edu/StudentRegistrationSsb/ssb/courseSearch/resetDataForm"
  );
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  await xhr.send("resetCourses=false&resetSections=true");
  await sleepBetweenQueries();
  document.body.innerHTML = "";
  const rhif = document.createElement("iframe");
  rhif.setAttribute(
    "src",
    `https://reg-prod.ec.ucmerced.edu/StudentRegistrationSsb/ssb/searchResults/searchResults?txt_subjectcoursecombo=${scc}&txt_term=${txt_term}&pageOffset=${pageOffset}&pageMaxSize=${pageMaxSize}&sortColumn=subjectDescription&sortDirection=asc`
  );
  let rhifLoaded = false;
  rhif.addEventListener("load", (event) => {
    rhifLoaded = true;
  });
  // Required to make an iframe load
  document.body.appendChild(rhif);
  for (let i = 0; !rhifLoaded; ++i) {
    console.log(scc, pageOffset);
    await sleep(i);
  }
  const json = JSON.parse(
    rhif.contentDocument.querySelector("body>pre").innerText
  );
  return json.data.map((entry) => entry.courseReferenceNumber);
}

// Weird sleep function that seems like it would be good for this usecase
function sleepForIframe(i) {
  if (i === 0) {
    return null; // Let's just try not sleeping
  } else if (i < 50) {
    return new Promise((r) => setTimeout(r, 100));
  } else {
    console.log(`Called sleep ${i}, which probably means something is broken`);
    return new Promise((r) => setTimeout(r, 5000));
  }
}

function sleepBetweenQueries(_i) {
  return new Promise((r) => setTimeout(r, 1000));
}
