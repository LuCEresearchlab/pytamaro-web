from pytamaro import(
    Graphic,
    Color,
    above,
    circular_sector,
    rectangle,
    pin,
    bottom_right,
    bottom_left,
    compose,
    rotate,
    rgb_color,
    show_graphic
)


LOVE_RED = rgb_color(222, 0, 0)

def semicircle(diameter: float, color: Color) -> Graphic:
    return circular_sector(diameter / 2, 180, color)

def heart(size: float, color: Color) -> Graphic:
    ventricles = rectangle(size, size, color)
    atrium = semicircle(size, color)
    rotated_heart = compose(pin(bottom_right, above(atrium, ventricles)), pin(bottom_left, rotate(-90, atrium)))
    return rotate(45, rotated_heart)

show_graphic(heart(200, LOVE_RED))