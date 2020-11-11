#! /usr/bin/env python
import os
import sys
import subprocess

root = sys.argv[1]
volume = sys.argv[2]

result = subprocess.check_output(
    f"docker run --rm -d -it -v {volume}:/code docked_code /code/execute.py {root}", shell=True)
