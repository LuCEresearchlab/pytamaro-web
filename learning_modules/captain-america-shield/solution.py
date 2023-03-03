from pytamaro import (
    Graphic, 
    Color, 
    triangle, 
    ellipse, 
    pin, 
    bottom_center,
    compose, 
    rotate, 
    empty_graphic,
    overlay,
    white,
    red,
    blue,
    show_graphic
)


def isosceles_triangle(side: float, angle: float, color: Color) -> Graphic:
    assert side >= 0
    return triangle(side, side, angle, color)

def circle(diameter: float, color: Color) -> Graphic:
    assert diameter >= 0
    return ellipse(diameter, diameter, color)

def star_point(radius: float) -> Graphic:
    assert radius >= 0
    return pin(
        bottom_center, 
        rotate(72 + 180, isosceles_triangle(radius, 36, white)))

def pentagram(diameter: float) -> Graphic:
    assert diameter >= 0
    star = empty_graphic()
    for i in range(5):
        star = compose(star, rotate(i * 72, star_point(diameter / 2)))
    return star

def shield(diameter: float) -> Graphic:
    assert diameter >= 0
    star = pentagram(2 * diameter / 5)
    blue_circle = circle(2 * diameter / 5, blue)
    step1 = compose(star, blue_circle)  # do this otherwise overlay doesn't take pinning point of star
    return overlay(
        step1,
        overlay(
            circle(3 * diameter / 5, red),
            overlay(
                circle(4 * diameter / 5, white),
                circle(diameter, red)
            )
        )
    )
    


# code to show result
result = shield(300)
show_graphic(result)