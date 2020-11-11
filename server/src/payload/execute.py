#! /usr/bin/env python
import os
import sys
import time
import subprocess

root = sys.argv[1]

started = int(time.time() * 1000)

os.system("python -u /code/project/" +
          root + " < /code/stdin.txt > /code/stdout.txt 2> /code/stderr.txt")

ended = int(time.time() * 1000)

post = open("code/post.txt", "w")
post.write("time-" + str(ended - started))
post.close()
