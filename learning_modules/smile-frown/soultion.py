from pytamaro import(
    Graphic,
    Color,
    ellipse,
    pin,
    bottom_center,
    compose,
    circular_sector,
    yellow,
    black,
    overlay,
    beside,
    above,
    rotate,
    show_graphic
)


def circle(diameter: float, color: Color) -> Graphic:
    assert diameter >= 0
    return ellipse(diameter, diameter, color)

def mouth(width: float) -> Graphic:
    assert width >= 0
    return compose(
        pin(bottom_center, circular_sector(width / 2 * 0.8, 180, yellow)),
        pin(bottom_center, circular_sector(width / 2, 180, black))
    )

def eye(diameter: float) -> Graphic:
    assert diameter >= 0
    return overlay(
        circle(diameter * 0.7, black),
        circle(diameter, yellow)
    )

def eyes(diameter: float) -> Graphic:
    assert diameter >= 0
    return beside(
        eye(diameter),
        eye(diameter)
    )

def smiley(size: float, smile: bool) -> Graphic:
    assert size >= 0
    return overlay(
        above(
            eyes( size * 0.4),
            rotate(0 if smile else 180, mouth(size * 0.6))
        ),
        circle(size, yellow)
    )


# code that shows result
result = beside(
    smiley(220, True),
    smiley(220, False)
)
show_graphic(result)
