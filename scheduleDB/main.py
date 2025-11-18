from scraper import serachSession
import json
 
session = serachSession(202610) 
with open('allcourseListing.json') as json_data:
    d = json.load(json_data)
index = 0
offset = 100
print(d[0])

for i in d:
    r = session.getCourseDetails(i["subjectCode"]+i["courseNumber"])
    if not r:
        continue 
    for j in r:
        linkedData = session.getLinkedCourses(j["courseReferenceNumber"])
        j["linkedData"] = linkedData
    i["courseDetails"] = r
    print(f"reached index:{index} waiting")
    index+=1



with open("fullData.json", "w") as f:
    f.write(json.dumps(d))
