#! /usr/bin/env python
import os
import sys
import subprocess

volume = sys.argv[1]
root = sys.argv[2]
language = sys.argv[3]
command = sys.argv[4]
file_trail = sys.argv[5]

result = subprocess.check_output(
    f"docker run --rm -d -it -v {volume}:/code docked_code python3 /code/execute.py {root} {language} {command} '{file_trail}'", shell=True)

print(result.decode("ascii"))
