import sys
import os

lang = sys.argv[1]

os.system(f"python3 full.py test.{lang} 0 {lang}_test")
