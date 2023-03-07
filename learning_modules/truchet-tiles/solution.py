from pytamaro import (
    Graphic,
    rgb_color, black,
    empty_graphic, 
    circular_sector, rectangle,
    overlay, beside, above, rotate,
    compose, pin,
    bottom_left, top_right,
    show_graphic, save_graphic,
)
from random import choice

YELLOW = rgb_color(245, 195, 3)
RED = rgb_color(224, 28, 37)
WHITE = rgb_color(223, 200, 205)
BLACK = black

PIPE = RED
BACKGROUND = YELLOW
#PIPE = rgb_color(217, 217, 217)
#BACKGROUND = rgb_color(128, 128, 128)

def curve(size: float) -> Graphic:
    corner_stack = [
        circular_sector(size * (0.5 - 0.1 - 0.02), 90, BACKGROUND),
        circular_sector(size * (0.5 - 0.1), 90, BLACK),
        circular_sector(size * (0.5 + 0.1), 90, PIPE),
        circular_sector(size * (0.5 + 0.1 + 0.02), 90, BLACK),
    ]
    corner = empty_graphic()
    for c in corner_stack:
        corner = compose(corner, pin(bottom_left, c))
    return compose(
        pin(top_right, rotate(180, corner)),
        pin(top_right, 
            compose(
                pin(bottom_left, corner),
                pin(bottom_left, rectangle(size, size, BACKGROUND))
            )
        )
    )

def cross(size: float) -> Graphic:
    hbar = above(
        rectangle(size, size * 0.02, BLACK),
        above(
            rectangle(size, size * 0.2, PIPE),
            rectangle(size, size * 0.02, BLACK),
        )
    )
    return overlay(
        overlay(
            hbar,
            rotate(90, hbar),
        ),
        rectangle(size, size, BACKGROUND)
    )

save_graphic("bridge.png", cross(80))
save_graphic("curve-tl.png", curve(80))
save_graphic("curve-tr.png", rotate(90, curve(80)))

def truchet_tiles(tile_size: float, width: int, height: int) -> Graphic:
    cr = cross(tile_size)
    tl = curve(tile_size)
    tr = rotate(90, tl)
    result = empty_graphic()
    for r in range(height):
        row = empty_graphic()
        for c in range(width):
            tile = choice([cr, tl, tr])
            row = beside(row, tile)
        result = above(result, row)
    return result

def example():
    return truchet_tiles(80, 24, 16)

show_graphic(example())
save_graphic("truchet-tiles.svg", example())
save_graphic("truchet-tiles.png", example())
