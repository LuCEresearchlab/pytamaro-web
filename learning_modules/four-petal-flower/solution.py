from pytamaro import (
    Graphic,
    Color,
    rgb_color,
    ellipse,
    circular_sector,
    above,
    rotate,
    overlay,
    show_graphic,
    save_graphic
)


PETAL_COLOR = rgb_color(255, 159, 208)
CENTER_COLOR = rgb_color(255, 246, 159)


def circle(diameter: float, color: Color) -> Graphic:
    assert diameter >= 0
    return ellipse(diameter, diameter, color)

def four_petal_flower(size: float) -> Graphic:
    assert size >= 0
    petal = circle(size, PETAL_COLOR)
    center = circle(size, CENTER_COLOR)
    first_part = above(petal, petal)
    return overlay(
        center,
        overlay(
            first_part,
            rotate(90, first_part)
        )
    )


# code to show result
result = four_petal_flower(120)
show_graphic(result)
# save_graphic("four-petal-flower.svg", result, False)
