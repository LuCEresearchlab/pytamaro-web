from math import sqrt
from pytamaro import (
    Graphic, Color,
    white, black, transparent, hsv_color,
    empty_graphic, rectangle, triangle,
    compose, rotate, above, beside,
    pin,
    bottom_left, bottom_center, bottom_right, center,
    show_graphic, save_graphic,
)

COLOR = white
LINE_COLOR = black
MARGIN_FRACTION = 0 #0.02

def equilateral_triangle(side: float, color: Color) -> Graphic:
    return triangle(side, side, 60, color)

def cell(side: float, color: Color) -> Graphic:
    if MARGIN_FRACTION:
        # triangles are not pinned in their centroid point
        # thus we cannot use `overlay` here
        height = side * sqrt(3) / 2
        margin = height * MARGIN_FRACTION
        return compose(
            pin(bottom_center,
                above(
                    equilateral_triangle(side * (1 - 3 * MARGIN_FRACTION), color),
                    rectangle(1, margin, transparent)
                )
            ),
            pin(bottom_center, equilateral_triangle(side, LINE_COLOR)), 
        )
    else:
        return equilateral_triangle(side, color)

def line_duo(size: float, left_color: Color, right_color: Color) -> Graphic:
    return beside(
        rotate(90, cell(size, left_color)),
        rotate(270, cell(size, right_color))
    )

def point_duo(size: float, left_color: Color, right_color: Color) -> Graphic:
    return beside(
        rotate(270, cell(size, left_color)),
        rotate(90, cell(size, right_color))
    )

def bar(height: int, size: float, hue: float, saturation: float) -> Graphic:
    top_color = hsv_color(hue, saturation, 1)
    left_color = hsv_color(hue, saturation, 0.9)
    right_color = hsv_color(hue, saturation, 0.8)
    result = line_duo(size, top_color, top_color)
    for _ in range(height):
        result = compose(pin(bottom_center, result), pin(center, point_duo(size, left_color, right_color)))
        result = compose(pin(bottom_center, result), pin(center, line_duo(size, left_color, right_color)))
    return result
        
def bar_series(configs: list[tuple[int,float,float]], size: float) -> Graphic:
    result = empty_graphic()
    for [height, hue, saturation] in configs:
        result = compose(
            pin(bottom_right, result),
            pin(bottom_left, bar(height, size, hue, saturation))
        )
    return result

def bar_diamond(configs: list[list[tuple[int,float,float]]], size: float) -> Graphic:
    spacer = rectangle(1, size / 2, transparent)
    result = empty_graphic()
    for row_config in configs:
        result = compose(
            pin(bottom_center, bar_series(row_config, size)),
            pin(bottom_center, above(result, spacer)),
        )
    return result

def square_to_diamond(square: list[list[tuple]]) -> list[list[tuple]]:
    """Convert a square list of lists into a list of diagonals"""
    diagonals = [[] for _ in range(len(square) * 2 - 1)]
    for col in range(len(square)):
        for row in range(len(square)):
            diagonals[row + col].append(square[row][col])
    return diagonals


def generate_data(n: int, base_saturation: float) -> list[list[tuple]]:
    return [[(2 * n - 1 - (x + y), x * 360 / n, base_saturation + 0.5 * y / n) for x in range(n)] for y in range(n)]

def example() -> Graphic:
    """Create an example isometric_bar"""
    #return bar(5, 100, 120, 0.5)
    #return bar_series([(5, 120, 0.5), (3, 240, 0.5), (2, 0, 0.5)], 100)
    # return bar_diamond([
    #     [(4, 0, 0.5)],
    #     [(2, 30, 0.5), (3, 60, 0.5)],
    #     [(1, 90, 0.5), (2, 120, 0.5), (1, 150, 0.5)],
    #     [(0, 180, 0.5), (0, 210, 0.5)],
    #     [(0, 240, 0.5)],
    # ], 100)
    return bar_diamond(square_to_diamond(generate_data(10, 0.5)), 10)

show_graphic(example())
save_graphic("isometric-bars.svg", example())
save_graphic("isometric-bars.png", example())
