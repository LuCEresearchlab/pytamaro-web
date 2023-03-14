from pytamaro import (
    Color, Graphic, 
    red, white,
    triangle, rectangle, 
    above, 
    show_graphic, save_graphic
)


def house(width: float, roof_color: Color, wall_color: Color) -> Graphic:
    assert width >= 0
    return above(
        triangle(width, width, 60, roof_color), 
        rectangle(width, width, wall_color)
    )

def standard_house(width: float) -> Graphic:
    assert width >= 0
    return house(width, red, white)


# code that shows result
result = standard_house(250)
show_graphic(result)
# save_graphic("house.svg", result, False)
