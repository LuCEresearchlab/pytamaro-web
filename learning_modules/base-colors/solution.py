from pytamaro import (
    Graphic, 
    Color, 
    ellipse,
    beside, 
    above, 
    red, 
    green,
    blue, 
    cyan, 
    magenta,
    yellow, 
    rectangle,
    transparent,
    show_graphic
)


def circle(diameter: float, color: Color) -> Graphic:
    assert diameter >= 0
    return ellipse(diameter, diameter, color)

def square(side: float, color: Color) -> Graphic:
    assert side >= 0
    return rectangle(side, side, color)

def rgb_dots(diameter: float) -> Graphic:
    assert diameter >= 0
    return beside(
        circle(diameter, red),
        beside(
            circle(diameter, green),
            circle(diameter, blue)
        )
    )

def cmy_squares(side: float) -> Graphic:
    assert side >= 0
    return beside(
        square(side, cyan),
        beside(
            square(side, magenta),
            square(side, yellow)
        )
    )


# code to show result
SIZE = 120
result = above(
    rgb_dots(SIZE),
    above(
        rectangle(0, SIZE / 4, transparent),
        cmy_squares(SIZE)
    )
)
show_graphic(result)