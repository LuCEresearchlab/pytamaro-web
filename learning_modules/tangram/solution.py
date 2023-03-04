from math import sqrt, pow
from pytamaro import(
    Graphic,
    Color,
    rgb_color,
    rectangle,
    triangle,
    rotate,
    pin,
    top_center,
    top_left,
    top_right,
    compose,
    empty_graphic,
    beside,
    above,
    show_graphic
)

# CONSTANTS
SQUARE_CONFIGURATION_SIDE_LENGTH = 250

YELLOW_TAN_COLOR = rgb_color(255, 189, 1)
ORANGE_TAN_COLOR = rgb_color(254, 122, 0)
RED_TAN_COLOR = rgb_color(240, 0, 4)
BLUE_TAN_COLOR = rgb_color(62, 112, 253)
LIGHT_BLUE_TAN_COLOR = rgb_color(118, 156, 237)
GREEN_TAN_COLOR = rgb_color(131, 197, 0)
PURPLE_TAN_COLOR = rgb_color(191, 66, 176)


# HELPERS
def length(length_exponent: int) -> float:
    return SQUARE_CONFIGURATION_SIDE_LENGTH * pow(sqrt(2) / 2, length_exponent)

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

def square(side: float, color: Color) -> Graphic:
     return rectangle(side, side, color)

def right_triangle(side1: float, side2: float, color: Color) -> Graphic:
    return triangle(side1, side2, 90, color)

def isosceles_right_triangle(leg: float, color: Color) -> Graphic:
    return right_triangle(leg, leg, color)

def triangle_tan(leg_length_exponent: int, color: Color) -> Graphic:
    return isosceles_right_triangle(length(leg_length_exponent), color)

# TANS
def light_blue_square_tan() -> Graphic:
    return square(length(3), LIGHT_BLUE_TAN_COLOR)

def green_rhomboid_tan(flipped: bool) -> Graphic:
    up_triangle = rotate(-90 - 45, triangle_tan(3, GREEN_TAN_COLOR))
    down_triangle = rotate(180, up_triangle)
    return compose(
        pin(top_center, down_triangle if flipped else up_triangle),
        pin(top_left, up_triangle if flipped else down_triangle)
    )

def yellow_large_triangle_tan() -> Graphic:
    return triangle_tan(1, YELLOW_TAN_COLOR)

def red_large_triangle_tan() -> Graphic:
    return triangle_tan(1, RED_TAN_COLOR)

def purple_medium_triangle_tan() -> Graphic:
    return triangle_tan(2, PURPLE_TAN_COLOR)

def blue_small_triangle_tan() -> Graphic:
    return triangle_tan(3, BLUE_TAN_COLOR)

def orange_small_triangle_tan() -> Graphic:
    return triangle_tan(3, ORANGE_TAN_COLOR)

# CONGIFURATIONS
def square_configuration() -> Graphic:
    step1 = above(
        rotate(90, yellow_large_triangle_tan()), 
        rotate(180, red_large_triangle_tan())
    )
    step2 = compose(
        pin(top_right, rotate(-90, orange_small_triangle_tan())),
        pin(top_right, rotate(45, green_rhomboid_tan(False)))
    )
    step3 = above_many(
        [
            blue_small_triangle_tan(),
            light_blue_square_tan(),
            step2
        ]
    )
    return beside_many(
        [
            step1,
            step3,
            rotate(-45 + 180, purple_medium_triangle_tan())
        ]
    )


# code to show result
result = square_configuration()
show_graphic(result)
