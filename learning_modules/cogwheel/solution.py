from math import sin, cos, pi
from pytamaro import (
    Color, Graphic,
    rgb_color, transparent,
    empty_graphic, ellipse, rectangle, circular_sector,
    compose, rotate,
    pin,
    center_left, bottom_center,
    show_graphic, save_graphic,
)

def circle(diameter: int, color: Color) -> Graphic:
    return ellipse(diameter, diameter, color)


# Variant 1: Cogs as circular sectors
def sector(diameter: int, angle: int, color: Color) -> Graphic:
    return pin(center_left, rotate(angle // 2, circular_sector(diameter // 2, angle, color)))

def cogs1(diameter: int, tooth_count: int, color: Color) -> Graphic:
    tooth_angle = 360 // (2 * tooth_count)
    rotations = [rot for rot in range(0, 360, 360 // tooth_count)]
    composition = empty_graphic()
    for rotation in rotations:
        element = rotate(rotation, sector(diameter, tooth_angle, color))
        composition = compose(composition, element)
    return composition

# Variant 2: Cogs as rectangles
def tooth(inner_diameter: int, outer_diameter: int, angle: float, color: Color) -> Graphic:
    diameter = (inner_diameter + outer_diameter) / 2
    angle_rad = angle * 2 * pi / 360
    width = sin(angle_rad / 2) * diameter
    height = cos(angle_rad / 2) * outer_diameter / 2
    #print("tooth: width=" + str(width))
    return pin(bottom_center, rectangle(width, height, color))

def cogs2(inner_diameter: int, outer_diameter: int, tooth_count: int, color: Color) -> Graphic:
    #print(f'cogs2: tooth_count={tooth_count}')
    tooth_angle = 360 / (2 * tooth_count)
    #print(f'cogs2: tooth_angle={tooth_angle}')
    unrotated_tooth = tooth(inner_diameter, outer_diameter, tooth_angle, color)
    teeth = [rotate(rot, unrotated_tooth) for rot in range(0, 360, 360 // tooth_count)]
    composition = empty_graphic()
    for t in teeth:
        composition = compose(composition, t)
    return composition

def cogwheel(inner_diameter: int, outer_diameter: int, tooth_count: int, color: Color) -> Graphic:
    return compose(
        compose(
            circle(inner_diameter, color),
            cogs2(inner_diameter, outer_diameter, tooth_count, color)
        ),
        circle(outer_diameter, transparent)
    )


show_graphic(cogwheel(400, 480, 10, rgb_color(96, 96, 96)))
save_graphic('cogwheel.svg', cogwheel(400, 480, 10, rgb_color(96, 96, 96)))
save_graphic('cogwheel.png', cogwheel(400, 480, 10, rgb_color(96, 96, 96)))
