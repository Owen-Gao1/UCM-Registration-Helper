# webScraper

## To-do

- Decide upon a final format for course data fetched from CRN.
- Figure out how to handle linked sections
- Decide how to handle npm dependencies.

## Explanation

The purpose of the programs of this folder is to automatically collect course data.
This is done first by opening the school's website in a real browser, then running code from iframeScraper.js.
That code generates data in JSON form, which can be saved to later be accessed locally.

Two important abbreviations to understand are SCC and CRN.
CRN, course reference number, is a 5 digit number that can be used to access course information through the website without even having a real browser open.
SCC, subject course combo, is a string that is required to scrape for CRNs.

## Files

- **iframeScraper.js** is a simple script that provides function to automatically get possible CRNs.
  It requires the school website to be open in a real browser, but it just gets JSON data instead of simulating clicks through pages.
- **fetchCrn.mjs** is a simple script that takes a single CRN and returns an object that contains all information about the corresponding course.
- **transformData.mjs** is a script with functions to transform scraped data into useful formats.
- **data/scc.json** is an object with SCC data that I scraped locally using iframeScraper.js.
- **data/ref.json** is an object which has a purpose explained in iframeScraper.js.
- **data/pared.json** is a trimmed down object with CRN data made from ref.json.
