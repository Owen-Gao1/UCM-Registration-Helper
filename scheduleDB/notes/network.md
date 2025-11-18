# sever query calls

## starting session and selecting term
for all query a cookie must be saved on the clinet the cookies can be acquired at StudentRegistrationSsb/ssb/term/termSelection?mode=courseSearch 
then a POST request must be sent to the server with the term pram being the code for the semester and a unique session id
the unique session id shold be 5 random alphanumeric characters plus time in mililseconds to unix epoch but
it works with any random unique alphanumeric characters 
```python
data = {
    "term": "202610",
    "studyPath": "",
    "studyPathText": "",
    "startDatepicker": "",
    "endDatepicker": "",
    "uniqueSessionId": "5ln921765111215717" 
    }
```
this is a sample format to the get request
## course listing
the course listing endpoint is /StudentRegistrationSsb/ssb/courseSearchResults/courseSearchResults. the pram 
are in the folowing format
```python
courseQuery= {
    "txt_term": "202610",
    "startDatepicker": "",
    "endDatepicker": "",
    "uniqueSessionId": "5ln921765111215717",
    "pageOffset": "0",
    "pageMaxSize": "100",
    "sortColumn": "subjectDescription",
    "sortDirection": "asc"
    }
```
### prams
- txt_term - code to set what term it shold look in the code is formated with the year and semester spring semester is 1 summer semester is 2 fall semester is 3 the last digit is always zero 
    eg:
    "code": "202610", "description": "Spring Semester 2026"
    "code": "202530", "description": "Fall Semester 2025"
    "code": "202520", "description": "Summer Semester 2025"
    "code": "202510", "description": "Spring Semester 2025"
    
- uniqueSessionId - must be the same ID generated during session creation
- pageOffset - number of course to be ignored in the sort direction aka start point
- pageMaxSize - nummber of course to be returned in the data packet (MAX:500)
- sortColumn - unknown: most likely determines the key of the sort
- sortDirection- unknown : most likely determines if the sort will be reversed
