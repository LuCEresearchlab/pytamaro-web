from pytamaro import (
    Graphic,
    rgb_color, black, white, transparent,
    rectangle, text, empty_graphic,
    above, beside, overlay, rotate,
    show_graphic, save_graphic,
)

WHITE = rgb_color(226, 191, 152)
BLACK = rgb_color(157, 94, 58)
#TEXT_COLOR = rgb_color(112, 67, 41)
TEXT_COLOR = rgb_color(226, 191, 152)
TEXT_BACKGROUND = rgb_color(80, 58, 47)

def row_header(square_size: float, top: bool) -> Graphic:
    result = empty_graphic()
    for r in ' abcdefgh ':
        label = text(r, "Arial", square_size / 2, TEXT_COLOR)
        cell = overlay(
            rotate(180, label) if top else label,
            rectangle(square_size, square_size, TEXT_BACKGROUND),
        )
        result = beside(result, cell)
    return result

def col_header(square_size: float, left: bool) -> Graphic:
    result = empty_graphic()
    for c in '12345678':
        label = text(c, "Arial", square_size / 2, TEXT_COLOR)
        cell = overlay(
            label if left else rotate(180, label),
            rectangle(square_size, square_size, TEXT_BACKGROUND),
        )
        result = above(cell, result)
    return result

def chessboard_body(square_size: float) -> Graphic:
    result = empty_graphic()
    for r in range(8):
        row = empty_graphic()
        for c in range(8):
            color = WHITE if (r + c) % 2 == 0 else BLACK
            cell = rectangle(square_size, square_size, color)
            row = beside(row, cell)
        result = above(result, row)
    return result

def chessboard(square_size: float) -> Graphic:
    return above(
        row_header(square_size, True),
        above(
            beside(
                col_header(square_size, True),
                beside(
                    chessboard_body(square_size),
                    col_header(square_size, False),
                ),
            ),
            row_header(square_size, False),
        ),
    )

show_graphic(chessboard(80))
save_graphic("chessboard.svg", chessboard(80))
save_graphic("chessboard.png", chessboard(80))
