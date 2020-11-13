import requests
import base64
import json
import sys
import os

url = "http://localhost:3001/execute/"
headers = {"Content-type": "application/json"}

root = sys.argv[1]
stdin = sys.argv[2]
directory = sys.argv[3]


def make_request():
    data = {
        "root": f"{root}",
        "stdin": f"{stdin}",
        "files": [
        ]
    }
    for file_name in os.listdir(f"{os.getcwd()}/{directory}"):
        array = file_name.split(".")
        extension = array[len(array) - 1]
        name = file_name.replace(f".{extension}", "")
        with open(f"{os.getcwd()}/{directory}/{file_name}") as file:
            raw_content = file.read()
            content = base64.b64encode(
                raw_content.encode("ascii")).decode("ascii")

        data["files"].append(
            {
                "name": f"{name}",
                "extension": f"{extension}",
                "content": f"{content}"
            }
        )
    request = requests.post(url, data=json.dumps(data), headers=headers)
    print(json.dumps(request.json(), indent=2))


make_request()
