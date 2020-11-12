#! /usr/bin/env python
import os
import sys
import time
import subprocess

root_location = "/code/project/" + sys.argv[1]
command = sys.argv[2]

started = int(time.time() * 1000)


def modify_trail(command, trail):
    if (command == "java"):
        return "-cp ./code/project Main"
    return trail


def compile_code(root_location):
    if (command == "java"):
        os.system("javac " + root_location)


def run(command, trail, modify_trail):
    modified_trail = modify_trail(command, trail)
    os.system(command + " " + modified_trail +
              " < /code/stdin.txt > /code/stdout.txt 2> /code/stderr.txt")


compile_code(root_location)
run(command, root_location, modify_trail)

ended = int(time.time() * 1000)

post = open("code/post.txt", "w")
post.write("time-" + str(ended - started))
post.close()
