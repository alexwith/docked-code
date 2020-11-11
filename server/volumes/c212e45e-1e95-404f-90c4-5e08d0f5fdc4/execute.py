#! /usr/bin/env python
import os
import sys
import time
import subprocess

root = sys.argv[1]
command = sys.argv[2]

started = int(time.time() * 1000)
root_location = "/code/project/" + root


def compile_code():
    if (command == "java"):
        os.system("javac " + root_location)


def run():
    if (command == "java"):
        root_location = "-cp ./code/project Main"
    os.system(command + " " + root_location +
              " < /code/stdin.txt > /code/stdout.txt 2> /code/stderr.txt")


compile_code()
run()

ended = int(time.time() * 1000)

post = open("code/post.txt", "w")
post.write("time-" + str(ended - started))
post.close()
