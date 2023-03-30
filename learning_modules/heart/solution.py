from pytamaro import(
    Graphic, Color,
    rgb_color,
    circular_sector, rectangle,
    pin, compose, rotate,
    bottom_right, bottom_left, top_left,
    show_graphic
)


LOVE_RED = rgb_color(222, 0, 0)


def semicircle(radius: float, color: Color) -> Graphic:
    assert radius >= 0
    return circular_sector(radius, 180, color)

def heart(size: float, color: Color) -> Graphic:
    assert size >= 0
    curve_1 = pin(bottom_left, semicircle(size, color))
    curve_2 = rotate(90, pin(bottom_right, semicircle(size, color)))
    square = pin(top_left, rectangle(size * 2, size * 2, color))
    return rotate(-45, compose(curve_2, compose(curve_1, square)))


# code to show result
result = heart(100, LOVE_RED)
show_graphic(result)