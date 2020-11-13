#! /usr/bin/env python
import os
import sys
import time
import subprocess

root_location = f"/code/project/{sys.argv[1]}"
language = sys.argv[2]
command = sys.argv[3]
file_trail = sys.argv[4]

started = int(time.time() * 1000)


def final_prefix(language, command, trail):
    if (language == "java"):
        return "java -cp ./code/project Main"
    elif (language == "c++"):
        return "./a.out"
    elif (language == "c"):
        return "./a.out"
    elif (language == "go"):
        return f"./{trail}"
    elif (language == "typescript"):
        modified_trail = trail.replace(".ts", ".js")
        return f"{command} {modified_trail}"
    return f"{command} {trail}"


def compile_code(language, root_location):
    statement = None
    if (language == "java"):
        statement = f"javac {file_trail}"
    elif (language == "c++"):
        statement = f"g++ {root_location}"
    elif (language == "c"):
        statement = f"gcc {root_location}"
    elif (language == "typescript"):
        statement = f"tsc {root_location}"
    if (statement != None):
        os.system(statement)


def run(language, command, trail, final_prefix):
    os.system(
        f"{final_prefix(language, command, trail)} < /code/stdin.txt > /code/stdout.txt 2> /code/stderr.txt")


compile_code(language, root_location)
run(language, command, root_location, final_prefix)

ended = int(time.time() * 1000)

post = open("code/post.txt", "w")
post.write(f"time-{ended - started}")
post.close()
