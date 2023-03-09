from pytamaro import (
    Graphic,
    Color,
    circular_sector,
    rotate,
    yellow,
    beside,
    empty_graphic,
    show_graphic,
    save_graphic
)


def pacman(radius: float, mouth_angle: float) -> Graphic:
    assert radius >= 0
    assert mouth_angle >= 0
    assert mouth_angle < 180
    return rotate(mouth_angle / 2, circular_sector(radius, 360 - mouth_angle, yellow))

def pacman_film(radius: float, first_mouth_angle: float, last_mouth_angle: float, number_of_pacmans: int) -> Graphic:
    assert first_mouth_angle >= 0
    assert last_mouth_angle >= 0
    assert first_mouth_angle < 180
    assert last_mouth_angle < 180
    assert last_mouth_angle >= first_mouth_angle
    assert number_of_pacmans >= 0

    step_angle = (last_mouth_angle - first_mouth_angle) / number_of_pacmans
    result = empty_graphic()
    for i in range(number_of_pacmans):
        result = beside(result, pacman(radius, first_mouth_angle + i * step_angle))
    return result


# code to show result
result = pacman_film(70, 20, 120, 6)
show_graphic(result)
# save_graphic("pacman-film.svg", result, False)