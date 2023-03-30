from functools import reduce
from pytamaro import Graphic, Color, hsv_color, rectangle, beside, show_graphic, save_graphic


def hue_to_tile(width: float, height: float, hue: float) -> Graphic:
    assert hue >= 0
    assert hue < 360
    return rectangle(width, height, hsv_color(hue, 1.0, 1.0))

def hues_to_tiles(tile_width: float, tile_height: float, hues: list[float]) -> list[Graphic]:
    return list(map(lambda x: hue_to_tile(tile_width, tile_height, x), hues))

def hue_bar(tile_width: float, tile_height: float) -> Graphic:
    tiles = hues_to_tiles(tile_width, tile_height, [x for x in range(360)])
    return reduce((lambda x, y: beside(x, y)), tiles)


# code to show result
result = hue_bar(3, 40)
show_graphic(result)
# save_graphic("hue-bar.svg", result, False)
