from pytamaro import (
    Graphic, Color,
    rgb_color,
    empty_graphic, circular_sector, rectangle,
    rotate, overlay, above, beside,
    show_graphic, save_graphic,
)

POSITIVE_COLOR = rgb_color(244, 0, 100)
NEGATIVE_COLOR = rgb_color(127, 0, 72)


def tile(rotation: int, positive: bool, size: float) -> Graphic:
    return overlay(
        rotate(rotation, circular_sector(size, 90, POSITIVE_COLOR if positive else NEGATIVE_COLOR)),
        rectangle(size, size, NEGATIVE_COLOR if positive else POSITIVE_COLOR)
    )

TILE_CONSTRUCTORS = [
    [
        lambda size: tile(0, True, size),
        lambda size: tile(270, False, size),
        lambda size: tile(180, False, size),
        lambda size: tile(90, True, size),
    ],
    [
        lambda size: tile(90, False, size),
        lambda size: tile(180, True, size),
        lambda size: tile(270, True, size),
        lambda size: tile(0, False, size),
    ],
    [
        lambda size: tile(180, False, size),
        lambda size: tile(90, True, size),
        lambda size: tile(0, True, size),
        lambda size: tile(270, False, size),
    ],
    [
        lambda size: tile(270, True, size),
        lambda size: tile(0, False, size),
        lambda size: tile(90, False, size),
        lambda size: tile(180, True, size),
    ],
]

def circle_wave_pattern(cols: int, rows: int, size: float) -> Graphic:
    pattern = empty_graphic()
    for r in range(rows):
        row = empty_graphic()
        for c in range(cols):
            mark = TILE_CONSTRUCTORS[r % 4][c % 4](size)
            row = beside(row, mark)
        pattern = above(pattern, row)
    return pattern

    
def example() -> Graphic:
    """Create an example circle_wave_pattern..."""
    return circle_wave_pattern(12, 8, 50)

show_graphic(example())
save_graphic("circle-wave-pattern.svg", example())
save_graphic("circle-wave-pattern.png", example())
