"""
Uses docker to execute the exported Python files and saves their output to `stdout.txt` and `stderr.txt`.
"""

import concurrent.futures
import json
import subprocess
from collections import Counter
from os import listdir
from pathlib import Path

from tqdm import tqdm

OUTPUT_DIR = 'out'

def execute_python_in_docker(args):
    docker_image, main_file, directory = args
    return subprocess.call(f'docker run --rm -v {directory}:/home/glot -w /home/glot {docker_image} sh -c \'python {main_file} > stdout.txt 2> stderr.txt\'', shell=True, stderr=subprocess.DEVNULL)

def main():
    events = []
    for event_dir in listdir(OUTPUT_DIR):
        with open(Path(OUTPUT_DIR, event_dir, 'event.json'), 'r') as f:
            event = json.load(f)
        events.append((event['dockerImage'], event['mainFile'], Path(OUTPUT_DIR, event_dir).resolve()))

    with concurrent.futures.ProcessPoolExecutor() as executor:
        exit_codes = list(tqdm(executor.map(execute_python_in_docker, events), total=len(events)))
    
    print("Exit codes")
    print(Counter(exit_codes))

if __name__ == '__main__':
    main()
