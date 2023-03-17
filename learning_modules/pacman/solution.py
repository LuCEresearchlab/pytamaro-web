from pytamaro import (
    Graphic, 
    yellow, 
    circular_sector, 
    rotate, 
    show_graphic, save_graphic
)


def pacman(radius: float, mouth_angle: float) -> Graphic:
    assert radius >= 0
    assert mouth_angle >= 0
    assert mouth_angle < 180
    return rotate(mouth_angle / 2, circular_sector(radius, 360 - mouth_angle, yellow))


# code that shows result
result = pacman(200, 60)
show_graphic(result)
# save_graphic("pacman.svg", result, False)