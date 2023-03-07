from functools import reduce
from dataclasses import dataclass
from pytamaro import (
    Graphic,
    rgb_color, transparent,
    rectangle, triangle, empty_graphic,
    rotate, above, beside,
    show_graphic, save_graphic,
)

ON_COLOR = rgb_color(255, 255, 0)
OFF_COLOR = rgb_color(32, 32, 0)

def fold_graphics(fn, graphics: list[Graphic]) -> Graphic:
    return reduce(fn, graphics, empty_graphic())

def gap_square(size: float) -> Graphic:
    return rectangle(size, size, transparent)

def segment(width: float, on: bool) -> Graphic:
    color = ON_COLOR if on else OFF_COLOR
    r = rectangle(width, 3 * width, color)
    t = triangle(width, width, 60, color)
    return above(above(t, r), rotate(180, t))

DIGIT_TO_SEGMENTS = [
    [True, True, True, True, True, True, False], # 0
    [False, True, True, False, False, False, False], # 1
    [True, True, False, True, True, False, True], # 2
    [True, True, True, True, False, False, True], # 3
    [False, True, True, False, False, True, True], # 4
    [True, False, True, True, False, True, True], # 5
    [True, False, True, True, True, True, True], # 6
    [True, True, True, False, False, False, False], # 7
    [True, True, True, True, True, True, True], # 8
    [True, True, True, True, False, True, True], # 9
]

def decode(number: int) -> list[bool]:
    """Decode a number into a list of 7 booleans, one for each segment"""
    return DIGIT_TO_SEGMENTS[number]


# Implicit and imperative approach

LAYOUT = [
    [None, 0, None],
    [5, None, 1],
    [None, 6, None],
    [4, None, 2],
    [None, 3, None],
]

def seven_segment_display_implicit(segment_width: float, number: int) -> Graphic:
    segment_states = decode(number)
    display_graphic = empty_graphic()
    for (r, row) in enumerate(LAYOUT):
        row_graphic = empty_graphic()
        for (c, cell) in enumerate(row):
            if (r + c) % 2 == 0:
                cell_graphic = gap_square(segment_width if r % 2 == 0 else 5 * segment_width)
            else:
                rotate_segment = c % 2 == 0
                cell_graphic = rotate(0 if rotate_segment else 90, segment(segment_width, segment_states[cell]))
            row_graphic = beside(row_graphic, cell_graphic)
        display_graphic = above(display_graphic, row_graphic)
    return display_graphic


# Explicit and functional approach
#
# The orientation and size of pieces is implicitly encoded in the position,
# but where it is explicitly provided in the layout.
#
# I would consider this better than the above implementation.
# It uses comprehensions, folding, algebraic data types, and pattern matching.
# It doesn't use indices to reason about cell values
# (deriving cell values from indices is clever, but not trivial to understand).

@dataclass
class Gap:
    large: bool

@dataclass
class Segment:
    index: int
    vertical: bool

EXPLICIT_LAYOUT : list[list[Gap|Segment]] = [
    [Gap(False), Segment(0, False), Gap(False)],
    [Segment(5, True), Gap(True), Segment(1, True)],
    [Gap(False), Segment(6, False), Gap(False)],
    [Segment(4, True), Gap(True), Segment(2, True)],
    [Gap(False), Segment(3, False), Gap(False)],
]

def seven_segment_display_explicit(segment_width: float, number: int) -> Graphic:
    segment_states = decode(number)

    def piece(which: Gap|Segment) -> Graphic:
        match which:
            case Gap(large):
                return gap_square(5 * segment_width if large else segment_width)
            case Segment(index, vertical):
                return rotate(0 if vertical else 90, segment(segment_width, segment_states[index]))

    graphics = [[piece(cell) for cell in row] for row in EXPLICIT_LAYOUT] 
    return fold_graphics(above, [fold_graphics(beside, row) for row in graphics])


seven_segment_display = seven_segment_display_implicit



show_graphic(seven_segment_display(40, 6))
save_graphic("seven-segment-display.svg", seven_segment_display(40, 6))
save_graphic("seven-segment-display.png", seven_segment_display(40, 6))
