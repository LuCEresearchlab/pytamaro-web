from pytamaro import (
    Graphic, Color,
    black, white, blue, yellow,
    rectangle, ellipse, circular_sector, empty_graphic,
    rotate, overlay, above, beside,
    pin, bottom_left, compose,
    show_graphic, save_graphic
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
SIZE = 15

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

def char_to_tile(c: str) -> Graphic:
    if c == "-":
        return STRAIGHT_TILE_H
    elif c == "|":
        return STRAIGHT_TILE_V
    elif c == "d":
        return CORNER_TILE_0
    elif c == "r":
        return CORNER_TILE_90
    elif c == "u":
        return CORNER_TILE_180
    elif c == "l":
        return CORNER_TILE_270
    elif c == ".":
        return FLOOR_TILE_DOT
    elif c == "0":
        return FLOOR_TILE_PILL
    elif c == "P":
        return PACMAN_TILE
    else:
        return FLOOR_TILE_EMPTY
    
def string_to_maze(maze: list[str]) -> Graphic:
    result = empty_graphic()
    for row in maze:
        r = empty_graphic()
        for c in row:
            r = beside(r, char_to_tile(c))
        result = above(result, r)
    return result

maze = [
    "r------------dr------------d" ,
    "|............||.......0....|",
    "|.r--d.r---d.||.r---d.r--d.|",
    "|.|  |.|   |.||.|   |.|  |.|",
    "|.u--l.u---l.ul.u---l.u--l.|",
    "|...0......................|",
    "|.r--d.rd.r------d.rd.r--d.|",
    "|.u--l.||.u--dr--l.||.u--l.|",
    "|......||....||....||......|",
    "u----d.|u--d.||.r--l|.r----l",
    "     |.|r--l.ul.u--d|.|     ",
    "     |.||..........||.|     ",
    "     |.||.r--  --d.||.|     ",
    "-----l.ul.|      |.ul.u-----",
    "..........|      |....0.....",
    "-----d.rd.|      |.rd.r-----",
    "     |.||.u------l.||.|     ",
    "     |.||..........||.|     ",
    "     |.||.r------d.||.|     ",
    "r----l.ul.u--dr--l.ul.u----d",
    "|......P.....||............|",
    "|.r--d.r---d.||.r---d.r--d.|",
    "|.u-d|.u---l.ul.u---l.|r-l.|",
    "|.0.||................||...|",
    "u-d.||.rd.r------d.rd.||.r-l",
    "r-l.ul.||.u--dr--l.||.ul.u-d",
    "|......||....||....||......|",
    "|.r----lu--d.||.r--lu----d.|",
    "|.u--------l.ul.u--------l.|",
    "|......................0...|",
    "u--------------------------l"
]

result = string_to_maze(maze)

show_graphic(result)
# save_graphic("pacman-maze.svg", result, False)
