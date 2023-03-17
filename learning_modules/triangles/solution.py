from pytamaro import (
    Graphic,
    Color,
    triangle,
    cyan,
    magenta,
    yellow,
    pin,
    bottom_left,
    bottom_right,
    compose,
    show_graphic,
    save_graphic
)


def equilateral_triangle(side: float, color: Color) -> Graphic:
    assert side >= 0
    return triangle(side, side, 60, color)

def isosceles_triangle(side: float, angle: float, color: Color) -> Graphic:
    assert side >= 0
    return triangle(side, side, angle, color)

def right_triangle(side1: float, side2: float, color: Color) -> Graphic:
    assert side1 >= 0
    assert side2 >= 0
    return triangle(side1, side2, 90, color)


# code to show result
CYAN_TRIANGLE = equilateral_triangle(150, cyan)
MAGENTA_TRIANGLE = isosceles_triangle(150, 40, magenta)
YELLOW_TRIANGLE = right_triangle(170, 100, yellow)

result = compose(
    pin(bottom_left,YELLOW_TRIANGLE),
    pin(bottom_right,
        compose(
            pin(bottom_right, CYAN_TRIANGLE),
            pin(bottom_left, MAGENTA_TRIANGLE)
        )
    )
)
show_graphic(result)
# save_graphic("triangles.svg", result, False)