class ToolPane {
  constructor() {
    this.el = document.getElementById("toolPane")
    this.bindEvents()
  }

  bindEvents() {
    // 在工具条Dom上代理各个工具按钮的点击事件
    this.el.addEventListener("click", (ev) => {
      var elem = ev.target
      while (elem.classList[0] != "tool") {
        if (elem.id === "toolPane") {
          return
        }
        elem = elem.parentElement
      }
      // 根据点击的按钮包含的工具的类型，切换当前使用的工具
      var toolType = elem.dataset.name
      window.eventbus.emit("switch-tool", toolType)
    })
  }
}

new ToolPane()