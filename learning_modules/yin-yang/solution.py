from pytamaro import Color, Graphic, above, ellipse, circular_sector, overlay, save_graphic, show_graphic, white, black, beside, rotate

def circle(diameter: float, color: Color) -> Graphic:
    return ellipse(diameter, diameter, color)

def semi_circle(diameter: float, color: Color) -> Graphic:
    return circular_sector(diameter / 2, 180, color)

def yin_yang(diameter: float) -> Graphic:
    eyes = above(eye(diameter / 2, white, black), eye(diameter / 2, black, white))
    base = beside(
        rotate(90, semi_circle(diameter, white)),
        rotate(-90, semi_circle(diameter, black))
    )
    return overlay(eyes, base)

def eye(diameter: float, outer_color: Color, inner_color: Color) -> Graphic:
    return overlay(circle(diameter / 3, inner_color), circle(diameter, outer_color))

save_graphic("yinyang.svg", yin_yang(800))