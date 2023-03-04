from pytamaro import (
    Graphic,
    Color,
    ellipse,
    rotate,
    pin,
    center_right,
    compose,
    overlay,
    beside,
    black,
    white,
    show_graphic
)


PUPIL_SIZE_FRACTION = 1 / 2
PUPIL_OFFSET_FRACTION = 1/ 6


def circle(diameter: float, color: Color) -> Graphic:
    assert diameter >= 0
    return ellipse(diameter, diameter, color)

def eye(diameter: float, pupil_angle: float) -> Graphic:
    assert diameter >= 0
    pupil_diameter = diameter * PUPIL_SIZE_FRACTION 
    pupil_container_diameter = diameter * (1 - PUPIL_OFFSET_FRACTION)
    return rotate(
        pupil_angle,
        overlay(
            compose(
                pin(center_right, circle(pupil_diameter, black)),
                pin(center_right, circle(pupil_container_diameter, white))
            ),
            circle(diameter, white)
        )
    )

def eyes(diameter: float, left_angle: float, right_angle:float) -> Graphic:
    assert diameter >= 0
    return beside(
        eye(diameter, left_angle),
        eye(diameter, right_angle)
    )


# code to show result
result = eyes(200, 135, 135)
show_graphic(result)
