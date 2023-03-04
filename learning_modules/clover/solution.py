from pytamaro import (
    Graphic,
    Color,
    rgb_color,
    circular_sector,
    rectangle,
    pin,
    bottom_left,
    bottom_center, 
    bottom_right,
    top_left,
    top_center,
    compose,
    rotate,
    beside,
    show_graphic,
)


LEAF_COLOR = rgb_color(0, 128, 0)


def semicircle(radius: float, color: Color) -> Graphic:
    assert radius >= 0
    return circular_sector(radius, 180, color)

def heart(size: float, color: Color) -> Graphic:
    assert size >= 0
    curve_1 = pin(bottom_left, semicircle(size, color))
    curve_2 = rotate(90, pin(bottom_right, semicircle(size, color)))
    square = pin(top_left, rectangle(size * 2, size * 2, color))
    return rotate(-45, compose(curve_2, compose(curve_1, square)))

def leaf(leaf_radius: float) -> Graphic:
    assert leaf_radius >= 0
    return pin(bottom_center, heart(leaf_radius, LEAF_COLOR))

def stem(size: float) -> Graphic:
    assert size >= 0
    return pin(top_center, rectangle(size / 4, size * 4, LEAF_COLOR))

def three_leaf_clover(leaf_radius: float) -> Graphic:
    assert leaf_radius >= 0
    leaf1 = leaf(leaf_radius)
    leaf2 = rotate(120, leaf1)
    leaf3 = rotate(-120, leaf1)
    return compose(
        stem(leaf_radius),
        compose(
            leaf1, compose(leaf2, leaf3)
        )
    )

def four_leaf_clover(leaf_radius: float) -> Graphic:
    assert leaf_radius >= 0
    leaf1 = leaf(leaf_radius)
    leaf2 = rotate(90, leaf1)
    leaf3 = rotate(180, leaf1)
    leaf4 = rotate(270, leaf1)
    return compose(
        stem(leaf_radius),
        rotate(
            45,
            compose(
                leaf1,
                compose(
                    leaf2,
                    compose(
                        leaf3,
                        leaf4
                    )
                )
            )
        )
    )

def clover(leaf_radius: float, four_leaves: bool) -> Graphic:
    assert leaf_radius >= 0
    return four_leaf_clover(leaf_radius) if four_leaves else three_leaf_clover(leaf_radius)


# code to show result
result = beside(clover(30, False), clover(30, True))
show_graphic(result)

