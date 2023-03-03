from pytamaro import(
    Graphic, 
    Color, 
    overlay,
    ellipse, 
    black, 
    white, 
    beside,
    show_graphic
)

def circle(diameter: float, color: Color) -> Graphic:
    assert diameter >= 0
    return ellipse(diameter, diameter, color)

def eye(diameter: float) -> Graphic:
    assert diameter >= 0
    return overlay(circle(diameter / 2, black), circle(diameter, white))

def eyes(diameter: float) -> Graphic:
    assert diameter >= 0
    return beside(eye(diameter), eye(diameter))

# code to show the result
result = eyes(200)
show_graphic(result)