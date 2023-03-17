from pytamaro import(
    Graphic, Color,
    hsv_color, white,
    circular_sector, empty_graphic, ellipse,
    pin, bottom_left, compose, rotate, overlay,
    show_graphic, save_graphic
)


def circle(diameter: float, color: Color) -> Graphic:
    return ellipse(diameter, diameter, color)

def hue_to_sector(radius: float, hue: float) -> Graphic:
    assert hue >= 0
    assert hue < 360
    return circular_sector(radius, 2, hsv_color(hue, 1.0, 1.0))

def hues_to_sectors(ring_radius: float, hues: list[float]) -> list[Graphic]:
    return list(map(lambda x: hue_to_sector(ring_radius, x), hues))

def hue_ring(outer_radius: float, inner_radius: float) -> Graphic:
    sectors = hues_to_sectors(outer_radius, [x for x in range(0, 360)])
    result = empty_graphic()
    for i in range(len(sectors)):
        result = compose(result, rotate(i, pin(bottom_left, sectors[i])))
    if inner_radius == 0:
        return result
    inner_circle = circle(2 * inner_radius, white)
    return overlay(inner_circle, result)


# code to show result
result = hue_ring(150, 120)
show_graphic(result)
#save_graphic("hue-ring.svg", result, False)