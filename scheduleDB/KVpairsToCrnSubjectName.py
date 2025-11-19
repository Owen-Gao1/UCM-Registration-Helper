import json
import sys

def convert(input_filePath, output_filePath):
    kv = {}
    with open(input_filePath, "r") as input:
        data = json.load(input)


    for key, val in data.items():
        if val["courseDetails"] is None:
            continue
        for i in val["linkedCRN"]:
            kv[i] = key 



    with open(output_filePath, "w") as output:
        json.dump(kv,output,indent=4)




if __name__ == "__main__":
    # simple check to ensure enough arguments are provided
    if len(sys.argv) < 3:
        print("Usage: python script.py <input.json> <output.json>")
    else:
        convert(sys.argv[1], sys.argv[2])
