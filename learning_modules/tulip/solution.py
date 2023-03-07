from pytamaro import (
    Graphic,
    Color,
    hsv_color,
    circular_sector,
    pin,
    bottom_left, 
    bottom_right,
    compose,
    rotate,
    above,
    show_graphic,
    save_graphic
)


def tulip(diameter: float, hue: float) -> Graphic:
    assert diameter >= 0
    assert hue >= 0
    assert hue <= 360
    front_color = hsv_color(hue, 1, 0.8, 1)
    back_color = hsv_color(hue, 1, 1, 1)
    petal = pin(bottom_left, circular_sector(diameter / 2, 90, front_color))
    back = pin(bottom_left, circular_sector(diameter / 2, 180, back_color))
    top_part = compose(
        rotate(90, petal),
        pin(
            bottom_right,
            compose(
                petal,
                back
            )
        )
    )
    return above(
        top_part,
        rotate( 180, circular_sector(diameter/2, 180, front_color))
    )


# code to show result
result = tulip(200, 330)
show_graphic(result)
# save_graphic("tulip.svg", result, False)
