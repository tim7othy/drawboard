class BoardConfig {
  constructor() {
    this.bindEvents()
  }

  bindEvents() {
    // var lineWidthInput = document.getElementById("board_line_width")
    // var colorInput = document.getElementById("board_color")
    // var textWidthInput = document.getElementById("board_text_width")
    // var textHeightInput = document.getElementById("board_text_height")
    // var fontSizeInput = document.getElementById("board_font-size")
    // var eraserSizeInput = document.getElementById("board_eraser_size")
    // var eraserShapeInput = document.getElementById("board_eraser_shape")
    var detailPane = document.querySelector(".board-details-wrapper")
    detailPane.addEventListener("input", (ev) => {
      var t = ev.target
      while(!t.id || !t.id.startsWith("board_")) {
        if (t.classList.contains("board-detail-wrapper")) {
          return
        }
        t = t.parentElement
      }
      window.eventbus.emit(t.id + "_change", t.value)
    })
  }
}

new BoardConfig()