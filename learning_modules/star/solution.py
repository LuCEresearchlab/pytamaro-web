from pytamaro import(
    Graphic, Color,
    hsv_color, black, red, transparent,
    triangle, empty_graphic, rectangle, circular_sector,
    pin, compose, bottom_center, bottom_right, bottom_left,
    above, beside, rotate,
    show_graphic, save_graphic
)


STAR_COLOR = hsv_color(55, 1, 1)


def isosceles_triangle(side: float, angle: float, color: Color) -> Graphic:
    assert angle > 0
    assert side > 0
    return rotate(-90 - angle / 2, triangle(side, side, angle, color))

def star(n: int, size: float, angle: float) -> Graphic:
    assert n >= 3
    assert size > 0
    assert angle > 0
    assert angle < 360 / n
    rotation_angle = 180 - (180 * n - 360) / n
    
    result = empty_graphic()
    for i in range(n):
        vertex = isosceles_triangle(size, angle, angle > 360 / n, STAR_COLOR)
        result = compose(result, rotate(rotation_angle * i, pin(bottom_center, vertex)))
    return result


# code to show result

size = 160
result = star(5, size, 60, False)
show_graphic(result)
#save_graphic("star.svg", result, False)
