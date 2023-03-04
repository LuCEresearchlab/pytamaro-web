from pytamaro import (
    Graphic, 
    Color,
    triangle,
    rotate, 
    black, 
    beside, 
    above, 
    text, 
    show_graphic
)


def isosceles_triangle(side: float, angle: float, color: Color) -> Graphic:
    assert side >= 0
    return rotate(180 - angle + 90 + angle / 2, triangle(side, side, angle, color))

def diamond(side: float) -> Graphic:
    assert side >= 0
    top_part = isosceles_triangle(side, 70, black)
    bottom_part = rotate(180, top_part)
    return above(top_part, bottom_part)

def double_black_diamond(side: float) -> Graphic:
    assert side >= 0
    return beside(diamond(side), diamond(side))

def labeled_double_black_diamond(side: float) -> Graphic:
    assert side >= 0
    return above(
        double_black_diamond(side), 
        text("EXPERTS ONLY", "Helvetica", side / 2, black))


# code to show result
result = labeled_double_black_diamond(100)
show_graphic(result)