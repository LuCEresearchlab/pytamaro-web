from pytamaro import (
    Graphic,
    Color,
    rectangle,
    ellipse,
    circular_sector,
    rotate,
    black,
    white,
    blue,
    yellow,
    pin,
    bottom_left,
    compose,
    overlay,
    above,
    beside,
    empty_graphic,
    show_graphic,
    save_graphic
)


def black_square(side: float) -> Graphic:
    return rectangle(side, side, black)

def white_circle(diameter: float) -> Graphic:
    return ellipse(diameter, diameter, white)

def pacman(radius: float, mouth_angle: float) -> Graphic:
    assert radius >= 0
    assert mouth_angle >= 0
    assert mouth_angle < 360
    return rotate(mouth_angle / 2, circular_sector(radius, 360 - mouth_angle, yellow))

def beside_many(graphics: list[Graphic]) -> Graphic:
    result = empty_graphic()
    for g in graphics:
        result = beside(result, g)
    return result

def above_many(graphics: list[Graphic]) -> Graphic:
    result = empty_graphic()
    for g in graphics:
        result = above(result, g)
    return result


# the blue line should be centered and 1/5 as thick as the tile's size
def straight_tile(size: float, horizontal: bool) -> Graphic:
    assert size >= 0
    blue_line = rectangle(size, 1/5 * size, blue)
    return overlay(
        blue_line if horizontal else rotate(90, blue_line),
        black_square(size)
    )

# the rotation parameter must be a multiple of 90
def corner_tile(size: float, rotation: float) -> Graphic:
    assert size >= 0
    assert rotation % 90 == 0
    result = compose(
        pin(bottom_left, circular_sector(1/2 * (size - 1/5 * size), 90, black)),
        compose(
            pin(bottom_left, circular_sector(1/2 * (size + 1/5 * size), 90, blue)),
            pin(bottom_left, black_square(size))
        )
    )
    return rotate(rotation, result)

# the parameter dot determines wether the tile should contain a dot
# the parameter pill determines wether the tile should contain a pill
# a tile cannot contain both a dot and a pill (my version will show a pacman)
def floor_tile(size: float, dot: bool, pill: bool) -> Graphic:
    assert size >= 0
    if dot and pill:
        return overlay(pacman(size / 2, 60), black_square(size))
    elif dot:
        return overlay(white_circle(1/5 * size), black_square(size))
    elif pill:
        return overlay(white_circle(size), black_square(size))
    else:
        return black_square(size)



# code to show result
SIZE = 30

STRAIGHT_TILE_H = straight_tile(SIZE, True)
STRAIGHT_TILE_V = straight_tile(SIZE, False)

CORNER_TILE_0 = corner_tile(SIZE, 0)
CORNER_TILE_90 = corner_tile(SIZE, 90)
CORNER_TILE_180 = corner_tile(SIZE, 180)
CORNER_TILE_270 = corner_tile(SIZE, 270)

FLOOR_TILE_EMPTY = floor_tile(SIZE, False, False)
FLOOR_TILE_DOT = floor_tile(SIZE, True, False)
FLOOR_TILE_PILL = floor_tile(SIZE, False, True)
PACMAN_TILE = floor_tile(SIZE, True, True)


FIRST_ROW = beside_many(
    [
        PACMAN_TILE,
        FLOOR_TILE_DOT,
        FLOOR_TILE_DOT,
        FLOOR_TILE_DOT,
        FLOOR_TILE_PILL,
        FLOOR_TILE_DOT,
        FLOOR_TILE_DOT,
        STRAIGHT_TILE_V,
        STRAIGHT_TILE_V,
        FLOOR_TILE_DOT,
        FLOOR_TILE_DOT,
    ]
)
SECOND_ROW = beside_many(
    [
        CORNER_TILE_0,
        FLOOR_TILE_DOT,
        CORNER_TILE_90,
        STRAIGHT_TILE_H,
        STRAIGHT_TILE_H,
        CORNER_TILE_0,
        FLOOR_TILE_DOT,
        STRAIGHT_TILE_V,
        STRAIGHT_TILE_V,
        FLOOR_TILE_DOT,
        CORNER_TILE_90
    ]
)
THIRD_ROW = beside_many(
    [
        STRAIGHT_TILE_V,
        FLOOR_TILE_DOT,
        CORNER_TILE_180,
        STRAIGHT_TILE_H,
        STRAIGHT_TILE_H,
        CORNER_TILE_270,
        FLOOR_TILE_DOT,
        CORNER_TILE_180,
        CORNER_TILE_270,
        FLOOR_TILE_EMPTY,
        STRAIGHT_TILE_V
    ]
)
FOURTH_ROW = beside_many(
    [
        STRAIGHT_TILE_V,
        FLOOR_TILE_DOT,
        FLOOR_TILE_DOT,
        FLOOR_TILE_DOT,
        FLOOR_TILE_DOT,
        FLOOR_TILE_DOT,
        FLOOR_TILE_DOT,
        FLOOR_TILE_EMPTY,
        FLOOR_TILE_EMPTY,
        FLOOR_TILE_EMPTY,
        STRAIGHT_TILE_V
    ]
)
TOP_BORDER = beside_many(
    [
        STRAIGHT_TILE_H,
        STRAIGHT_TILE_H,
        STRAIGHT_TILE_H,
        STRAIGHT_TILE_H,
        STRAIGHT_TILE_H,
        STRAIGHT_TILE_H,
        STRAIGHT_TILE_H,
        CORNER_TILE_0,
        CORNER_TILE_90,
        STRAIGHT_TILE_H,
        STRAIGHT_TILE_H
    ]
)
BOTTOM_BORDER = beside_many(
    [
        CORNER_TILE_180,
        STRAIGHT_TILE_H,
        CORNER_TILE_0,
        FLOOR_TILE_DOT,
        CORNER_TILE_90,
        STRAIGHT_TILE_H,
        CORNER_TILE_0,
        FLOOR_TILE_DOT,
        CORNER_TILE_90,
        STRAIGHT_TILE_H,
        CORNER_TILE_270
    ]
)
PIECE = above_many(
    [
        TOP_BORDER,
        FIRST_ROW,
        SECOND_ROW,
        THIRD_ROW,
        FOURTH_ROW,
        BOTTOM_BORDER
    ]
)
result = above(
    beside(PIECE, PIECE),
    rotate(180, beside(PIECE, PIECE))
)

show_graphic(result)
# save_graphic("pacman-maze.svg", result, False)
