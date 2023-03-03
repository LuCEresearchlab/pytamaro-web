from pytamaro import(
    Graphic,
    rgb_color,
    above,
    beside,
    pin,
    center_right,
    center_left,
    compose,
    rotate,
    rectangle,
    circular_sector,
    show_graphic
)


TICINO_RED = rgb_color(221, 77, 62)
TICINO_BLUE = rgb_color(0, 106, 177)


def coat_of_arms(radius: float) -> Graphic:
    assert radius >= 0
    top_part = compose(
        pin(center_right, rectangle(radius, radius * 7 / 5, TICINO_RED)),
        pin(center_left, rectangle(radius, radius * 7 / 5, TICINO_BLUE))
    )
    bottom_part = beside(
        rotate(180, circular_sector(radius, 90, TICINO_RED)),
        rotate(-90, circular_sector(radius, 90, TICINO_BLUE))
    )
    return above(top_part, bottom_part)


# code to show result
result = coat_of_arms(150)
show_graphic(result)
