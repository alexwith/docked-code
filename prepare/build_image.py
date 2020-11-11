#! /usr/bin/env python
import os

print("Building the docker image for Docked Code...")
os.system("docker build --tag 'docked_code' - < prepare/Dockerfile")
