import requests
import random
import time
import string

class serachSession:
    protocol = "https://"
    authority = "reg-prod.ec.ucmerced.edu"
    handShakeEntryPoint= "/StudentRegistrationSsb/ssb/term/termSelection?mode=courseSearch"
    courseSearch = "/StudentRegistrationSsb/ssb/term/search?mode=courseSearch"
    courseSearchResults = "/StudentRegistrationSsb/ssb/courseSearchResults/courseSearchResults"
    courseDetailsEndpoint = "/StudentRegistrationSsb/ssb/searchResults/searchResults" 
    linkedCouresEndpoint = "/StudentRegistrationSsb/ssb/searchResults/fetchLinkedSections"
    resetDataFromEndpoint = "/StudentRegistrationSsb/ssb/courseSearch/resetDataForm"


    def __init__(self, currentSemester: int) -> None:
        self.currentSemester = currentSemester
        print(f"starting session with semester code: {self.currentSemester}")
        self.uniqueSessionId = self.idGenerator()
        print(f"unique session ID generated:{self.uniqueSessionId}")
        self.session = self.startSession(self.currentSemester, self.uniqueSessionId)
        if not self.session:
            print("failed to start session")
            return
        print("querying for course metadata")
        r = self.getCourseListInfo()
        if not r:
            print("could not get course metadata")
            return
        self.totalCourseCount = r["totalCount"]
        print(f"total course count is {self.totalCourseCount}")


    def idGenerator(self)->str:
        source = string.ascii_letters + string.digits
        id = ''.join(random.choice(source) for _ in range(5))
        return id + str(round(time.time() * 1000))


    def startSession(self,semesterCode: int, sessionID) -> requests.Session:
        print("starting handShake")
        session = requests.Session()
        handShakeURL=self.protocol+self.authority+self.handShakeEntryPoint
        session.get(handShakeURL)
        serverSessionInitURL = self.protocol+self.authority+self.courseSearch
        data = {
        "term": semesterCode,
        "studyPath": "",
        "studyPathText": "",
        "startDatepicker": "",
        "endDatepicker": "",
        "uniqueSessionId": sessionID 
        }
        session.post(serverSessionInitURL, data)
        return session

    def getCourseListInfo(self):
        r = self.getCourseListByRange()
        if not r:
            return
        return r.json()

    def getCourseListByRange(self, pageOffset = 0, pageMaxSize=10):
        if pageMaxSize > 500 or pageMaxSize < 1:
            print("pageMaxSize can not be greater then 500 or less then 1")
            return None
        if pageOffset < 0:
            print(f"pageOffset can not be less then 0 and can not be greater then {self.totalCourseCount}")
            return None
        courseSearchResultsURL= self.protocol+self.authority+self.courseSearchResults
        queryParameters= {
            "txt_term": self.currentSemester,
            "startDatepicker": "",
            "endDatepicker": "",
            "uniqueSessionId": self.uniqueSessionId,
            "pageOffset": pageOffset,
            "pageMaxSize": pageMaxSize,
            "sortColumn": "subjectDescription",
            "sortDirection": "asc"
        }
        return self.session.get(courseSearchResultsURL, params=queryParameters)

    def getCourseList(self):
        offset = 0
        data = []
        while offset < self.totalCourseCount:
            length = 100
            if (self.totalCourseCount-offset) < 100:
                length = self.totalCourseCount-offset
            print(f"starting search query with offset:{offset} and lenght:{length}")
            r = self.getCourseListByRange(offset, length)
            if not r:
                print("fail to get all course")
                return
            data += r.json()["data"]
            offset += length
            print("waiting 2")
            time.sleep(2)
        return data

    def getCourseDetails(self, subjectCourseCombo: str):
        URL= self.protocol+self.authority+self.courseDetailsEndpoint
        data=[]
        offset = 0
        pageMaxSize = 50
        while True:
            queryParameters= {
                "txt_subjectcoursecombo": subjectCourseCombo,
                "txt_term": self.currentSemester,
                "pageOffset": offset,
                "pageMaxSize": pageMaxSize,
                "sortColumn": "subjectDescription",
                "sortDirection": "asc"
            }
            r= self.session.get(URL, params=queryParameters).json()
            if not r:
                    print("invalid course detailes json")
                    return
            if not r["success"]:
                print("failed to get course detailes: api return false")
                return 
            offset += pageMaxSize 
            data+=r["data"]
            if offset > r["totalCount"]:
                break
        return data
            
    
    def getLinkedCourses(self, crn: int):
        URL = self.protocol+self.authority+self.linkedCouresEndpoint
        queryParameters={
            "term":  self.currentSemester,
            "courseReferenceNumber": crn
        }
        r = self.session.get(URL, params=queryParameters)
        if not r:
            print(f"failed to get linked courses for crn:{crn}")
            return
        return r.json()["linkedData"]
        
    def resetDataFrom(self):
        URL = self.protocol+self.authority+self.resetDataFromEndpoint
        data = {
            "resetCourses": False,
            "resetSections": True
        }
        r = self.session.post(URL,data= data)
        return


