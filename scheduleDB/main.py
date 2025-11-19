from scraper import serachSession
import json
 
session = serachSession(202610) 
with open('allcourseListing.json') as json_data:
    d = json.load(json_data)
index = 0
offset = 100

for i in d:
    print(f"geting {i["subjectCode"]+i["courseNumber"]}")
    r = session.getCourseDetails(i["subjectCode"]+i["courseNumber"])
    ij= 1
    if not r:
        print(f"error at index {index}")
        session.resetDataFrom()
        index+=1
        continue 
    for j in r:
        linkedData = session.getLinkedCourses(j["courseReferenceNumber"])
        session.resetDataFrom()
        print(f"geting linkedData for {i["subjectCode"]+i["courseNumber"]} {ij} times")
        j["linkedData"] = linkedData
        ij+=1
    i["courseDetails"] = r
    print(f"reached index:{index} waiting")
    session.resetDataFrom()
    index+=1



with open("fullData.json", "w") as f:
    f.write(json.dumps(d))
