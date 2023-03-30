from pytamaro import (
    Graphic, Color,
    rgb_color, transparent,
    circular_sector, rectangle, empty_graphic,
    pin, compose, rotate, beside,
    bottom_left, bottom_center, bottom_right, top_left, top_center,
    show_graphic, save_graphic
)


LEAF_COLOR = rgb_color(51, 102, 45)


def semicircle(radius: float, color: Color) -> Graphic:
    assert radius >= 0
    return circular_sector(radius, 180, color)

def heart(size: float, color: Color) -> Graphic:
    assert size >= 0
    curve_1 = pin(bottom_left, semicircle(size, color))
    curve_2 = rotate(90, pin(bottom_right, semicircle(size, color)))
    square = pin(top_left, rectangle(size * 2, size * 2, color))
    return rotate(-45, compose(curve_2, compose(curve_1, square)))

def leaf(leaf_radius: float) -> Graphic:
    assert leaf_radius >= 0
    return pin(bottom_center, heart(leaf_radius, LEAF_COLOR))

def stem(size: float) -> Graphic:
    assert size >= 0
    return pin(top_center, rectangle(size / 4, size * 4, LEAF_COLOR))


def clover(leaf_radius: float, four_leaves: bool) -> Graphic:
    leaf_num = 4 if four_leaves else 3
    rotation_angle = 360 / leaf_num
    result = empty_graphic()
    for i in range(leaf_num):
        result = compose(result, rotate(rotation_angle * i, pin(bottom_center, leaf(leaf_radius))))
    return compose(pin(top_center, stem(leaf_radius)), result)


# code to show result
result = beside(clover(30, False), clover(30, True))
show_graphic(result)

save_graphic("clover.svg", beside(clover(30, False), beside(rectangle(5, 0, transparent), clover(30, True))))