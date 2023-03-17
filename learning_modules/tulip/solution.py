from pytamaro import (
    Graphic, Color,
    hsv_color,
    circular_sector,
    pin, bottom_left, bottom_right,compose,
    rotate, above,
    show_graphic, save_graphic
)


def semicircle(radius: float, color: Color) -> Graphic:
    return circular_sector(radius, 180, color)

def tulip(diameter: float, hue: float) -> Graphic:
    assert diameter >= 0
    assert hue >= 0
    assert hue <= 360
    front_color = hsv_color(hue, 1, 0.8, 1)
    back_color = hsv_color(hue, 1, 1, 1)
    petal = circular_sector(diameter / 2, 90, front_color)
    back_petal = semicircle(diameter / 2, back_color)
    top_petals = compose(
        rotate(90, pin(bottom_left, petal)),
        pin(
            bottom_right,
            compose(
                pin(bottom_left, petal),
                pin(bottom_left, back_petal)
            )
        )
    )
    return above(
        top_petals,
        rotate(180, semicircle(diameter/2, front_color))
    )


# code to show result
result = tulip(200, 330)
show_graphic(result)
# save_graphic("tulip.svg", result, False)
