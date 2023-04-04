# See: https://stackoverflow.com/questions/44139441/inlining-svg-image-in-a-markdown-cell

#
# Usage:
#   python svg2clip.py <svg file>
#
# This will copy the svg file to the clipboard as a markdown image.
# You can then paste it into a markdown cell in a jupyter notebook.
#
from sys import argv
from urllib import parse
from subprocess import PIPE, Popen, TimeoutExpired

svg = open(argv[1]).read()
inlined = ('![svg image](data:image/svg+xml,' +
           parse.quote(svg) +
           ')'
           ).encode('utf8')
p = Popen(["pbcopy",],
          stdin=PIPE, stdout=PIPE)
try:
    p.communicate(inlined, timeout=0.020)
except TimeoutExpired:
    pass