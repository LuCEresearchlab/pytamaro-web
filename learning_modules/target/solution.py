from pytamaro import(
    Graphic,
    Color,
    ellipse,
    overlay,
    black,
    white,
    show_graphic
)


def circle(diameter: float, color: Color) -> Graphic:
    assert diameter >= 0
    return ellipse(diameter, diameter, color)

def target(diameter: float) -> Graphic:
    assert diameter >= 0
    return overlay(
        circle(diameter * 0.2, black),
        overlay(
            circle(diameter * 0.4, white),
            overlay(
                circle(diameter * 0.6, black),
                overlay(
                    circle(diameter * 0.8, white),
                    circle(diameter, black)
                )
            )
        )
    )


# code to show result
result = target(400)
show_graphic(result)
