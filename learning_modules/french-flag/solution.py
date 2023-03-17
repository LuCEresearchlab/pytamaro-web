from pytamaro import (
    Graphic, Color,
    rgb_color, white,
    rectangle,
    beside,
    show_graphic, save_graphic
)


FRENCH_BLUE = rgb_color(0, 85, 164)
FRENCH_RED = rgb_color(239, 65, 53)


def stripe(height: float, color: Color) -> Graphic:
    assert height >= 0
    return rectangle(height / 2, height, color)

def french_flag(height: float) -> Graphic:
    assert height >= 0
    return beside(
        stripe(height, FRENCH_BLUE),
        beside(
            stripe(height, white),
            stripe(height, FRENCH_RED)
        )
    )


# code to show result
result = french_flag(300)
show_graphic(result)
# save_graphic("french-flag.svg", result, False)