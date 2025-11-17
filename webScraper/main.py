from scraper import serachSession
 
session = serachSession(202610) 
cse = session.getCourseDetails("CSE031")
linkedCourses = session.getLinkedCourses(cse[0]["courseReferenceNumber"])
print(linkedCourses)

