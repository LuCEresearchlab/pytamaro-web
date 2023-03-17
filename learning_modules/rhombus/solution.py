from pytamaro import(
    Graphic, Color,
    cyan,
    triangle,
    rotate, above,
    show_graphic, save_graphic
)


def rhombus(side: float, angle: float, color: Color) -> Graphic:
    assert side >= 0
    assert angle <= 180
    top_triangle = rotate(-90 - angle / 2, triangle(side, side, angle, color))
    return above(top_triangle, rotate(180, top_triangle))


# code to show result
result = rhombus(170, 80, cyan)
show_graphic(result)
# save_graphic("rhombus.svg", result, False)