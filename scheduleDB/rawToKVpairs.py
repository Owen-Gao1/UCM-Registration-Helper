import json
import sys
#convert scraped data to subjectCode subjectNumber as key and data as value

def convert(input_path, output_path):
    kv = {}
    with open(input_path,'r') as file:
        data = json.load(file)

    for i in data:
        linkedCRN = []
        if "courseDetails" not in i.keys():
            i["courseDetails"] = None
            kv[i['subjectCode']+i['courseNumber']]=i
            continue
        for j in i['courseDetails']:
            print( j["courseReferenceNumber"])
            linkedCRN.append(j["courseReferenceNumber"])

        kv[i['subjectCode']+i['courseNumber']]=i
        kv[i['subjectCode']+i['courseNumber']]['linkedCRN']=linkedCRN



    with open(output_path, 'w') as file:
        json.dump(kv, file, indent=4)

if __name__ == "__main__":
    # simple check to ensure enough arguments are provided
    if len(sys.argv) < 3:
        print("Usage: python script.py <input.json> <output.json>")
    else:
        convert(sys.argv[1], sys.argv[2])
