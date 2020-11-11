#! /usr/bin/env python
import os
import sys
import subprocess

volume = sys.argv[1]
root = sys.argv[2]
command = sys.argv[3]

result = subprocess.check_output(
    f"docker run --rm -d -it -v {volume}:/code docked_code /code/execute.py {root} {command}", shell=True)
