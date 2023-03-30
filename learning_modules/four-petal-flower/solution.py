from pytamaro import (
    Graphic, Color,
    rgb_color,
    ellipse, circular_sector,
    above, rotate, overlay,
    show_graphic, save_graphic
)


PETAL_COLOR = rgb_color(255, 159, 208)
PISTIL_COLOR = rgb_color(255, 246, 159)


def circle(diameter: float, color: Color) -> Graphic:
    assert diameter >= 0
    return ellipse(diameter, diameter, color)

def four_petal_flower(size: float) -> Graphic:
    assert size >= 0
    petal = circle(size, PETAL_COLOR)
    pistil = circle(size, PISTIL_COLOR)
    vertical_petals = above(petal, petal)
    return overlay(
        pistil,
        overlay(
            vertical_petals,
            rotate(90, vertical_petals)
        )
    )


# code to show result
result = four_petal_flower(120)
show_graphic(result)
# save_graphic("four-petal-flower.svg", result, False)
