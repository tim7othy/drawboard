class BoardConfig {
  constructor() {
    this.bindEvents()
  }

  bindEvents() {
    var detailPane = document.querySelector(".board-details-wrapper")
    delegate(detailPane, "input", ".config-tool", (ev, el) => {
      window.eventbus.emit(el.id + "_change", el.value)
    })
  }
}

new BoardConfig()