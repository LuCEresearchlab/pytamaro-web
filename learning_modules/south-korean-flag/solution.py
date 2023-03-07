from pytamaro import (
    Graphic,
    rgb_color, white, black, transparent,
    ellipse, rectangle, circular_sector, empty_graphic,
    overlay, beside, above, rotate, compose, pin,
    center_left,
    show_graphic, save_graphic,
)
from math import sqrt, asin, pi

ANGLE = asin(2 / sqrt(3**2 + 2**2)) / 2 / pi * 360
RED = rgb_color(205, 46, 58)
BLUE = rgb_color(0, 71, 160)

def half_circles(diameter: float) -> Graphic:
    return above(
        rotate(0, circular_sector(diameter / 2, 180, RED)),
        rotate(180, circular_sector(diameter / 2, 180, BLUE))
    )

def wave(diameter: float) -> Graphic:
    return beside(
        ellipse(diameter / 2, diameter / 2, RED),
        ellipse(diameter / 2, diameter / 2, BLUE),
    )

def taegeuk(diameter: float) -> Graphic:
    return overlay(
        wave(diameter),
        half_circles(diameter),
    )

def trigram(solids: list[bool], unit: float) -> Graphic:
    bar_height = 12 * unit
    half_bar_height = 5.5 * unit
    bar_width = 2 * unit
    gap_size = unit
    trigram_from_center = (6 + 12) * unit
    hgap = rectangle(gap_size, 0, transparent)
    vgap = rectangle(0, gap_size, transparent)
    bar = rectangle(bar_width, bar_height, black)
    half_bar = rectangle(bar_width, half_bar_height, black)
    gapped_bar = above(half_bar, above(vgap, half_bar))
    result = rectangle(trigram_from_center, 0, transparent)
    for solid in solids:
        result = beside(result, beside(bar if solid else gapped_bar, hgap))
    return pin(center_left, result)

def south_korean_flag(height: float) -> Graphic:
    unit = height / 48
    diameter = 24 * unit

    marks = [
        rotate(180 - ANGLE, trigram([True, True, True], unit)),   # geon
        rotate(-ANGLE, trigram([False, False, False], unit)),     # gon
        rotate(ANGLE, trigram([False, True, False], unit)),       # gam
        rotate(180 + ANGLE, trigram([True, False, True], unit)),  # ri
        rotate(-ANGLE, taegeuk(diameter)),
    ]
    content = empty_graphic()
    for mark in marks:
        content = compose(content, mark)
    background = rectangle(2 * 36 * unit, 2 * 24 * unit, white)

    return overlay(
        content,
        background,
    )

show_graphic(south_korean_flag(400))
save_graphic("south-korean-flag.svg", south_korean_flag(400))
save_graphic("south-korean-flag.png", south_korean_flag(400))
