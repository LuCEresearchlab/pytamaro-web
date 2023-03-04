from pytamaro import(
    Graphic,
    Color,
    ellipse,
    rectangle,
    rgb_color,
    overlay,
    white,
    show_graphic
)


JAPANESE_FLAG_RED = rgb_color(237, 27, 46)


def circle(radius: float, color: Color) -> Graphic:
    return ellipse(radius, radius, color)

def japanese_flag(height: float) -> Graphic:
    assert height >= 0
    return overlay(
        circle(height / 5 * 3, JAPANESE_FLAG_RED),
        rectangle(height / 2 * 3, height, white)
    )


# code to show result
result = japanese_flag(300)
show_graphic(result)