class DrawBoard {
  constructor(parentId) {
    this.parentId = parentId
    this.setupCanvas()
    this.setupConfig()
    this.setupBackground()
    this.setupHistory(30)
    this.setupProjects()
  }

  setupProjects() {
    this.currProject = null
    var saveBtn = document.querySelector(".publish-btn")
    var deleteBtn = document.querySelector(".delete-btn")

    saveBtn.addEventListener("click", () => {
      var r = getRandom()
      var dataURL = this.mainCanvas.toDataURL()
      var project = {
        id: r,
        dataURL: dataURL
      }
      this.currProject = project
      window.eventbus.emit("save_project", project)
    })

    deleteBtn.addEventListener("click", () => {
      window.eventbus.emit("delete_project", this.currProject)
    })

    window.eventbus.on("load_project", (p) => {
      this.currProject = p
      var img = new Image()
      img.onload = () => {
        this.mainCtx.clearRect(0, 0, this.W, this.H)
        this.uiCtx.clearRect(0, 0, this.W, this.H)
        this.mainCtx.drawImage(img, 0, 0)
        this.setupHistory(30)
      }
      img.src = p.dataURL
    })

  }

  setupCanvas() {
    // 与用户动态交互的canvas层
    var uiLayer = new Canvas({
      id: "drawboard_ui_canvas",
      parentId: this.parentId,
    })
    this.uiCanvas = uiLayer.canvasElement
    this.uiCtx = uiLayer.canvasContext

    // 绘制控制图形的辅助线的canvas层
    var assistLayer = new Canvas({
      id: "drawboard_assist_canvas",
      parentId: this.parentId
    })
    this.assistCanvas = assistLayer.canvasElement
    this.assistCtx = assistLayer.canvasContext

    // 绘制主要画面的canvas层
    var mainLayer = new Canvas({
      id: "drawboard_main_canvas",
      parentId: this.parentId,
    })
    this.mainCanvas = mainLayer.canvasElement
    this.mainCtx = mainLayer.canvasContext

    // 很少变化的绘制背景的canvas层
    var bgLayer = new Canvas({
      id: "drawboard_bg_canvas",
      parentId: this.parentId,
    })
    this.bgCanvas = bgLayer.canvasElement
    this.bgCtx = bgLayer.canvasContext
    // 保存canvas的宽和高
    this.W = mainLayer.width
    this.H = mainLayer.height
  }

  setupConfig() {
    this.lineWidth = 1
    this.color = "#000"
    this.textWidth = 200
    this.textHeight = 100
    this.fontSize = 15 
    this.eraserSize = 20
    var eb = window.eventbus
    eb.on("board_line_width_change", (value) => {this.lineWidth = parseInt(value)})
    eb.on("board_color_change", (value) => {this.color = value})
    eb.on("board_text_width_change", (value) => {
      this.textWidth = parseInt(value)
      if (this.tool.toolType === TEXT) {
        this.tool.resize()
      }
    })
    eb.on("board_text_height_change", (value) => {
      this.textHeight = parseInt(value)
      if (this.tool.toolType === TEXT) {
        this.tool.resize()
      }
    })
    eb.on("board_font_size_change", (value) => {this.fontSize = parseInt(value)})
    eb.on("board_eraser_size_change", (value) => {this.eraserSize = parseInt(value)})
  }

  setupHistory(capacity) {
    this.history = {
      tail: 0,
      curr: 0,
      capacity: capacity,
      queue: Array(capacity)
    }
  }

  setHistory(item) {
    var h = this.history
    var next = h.curr + 1
    if (next < h.capacity) {
      h.queue[next] = item
    }
    h.curr = next
    h.tail = next
  }

  cancel() {
    var h = this.history
    if (h.curr === 0) return
    var next = h.curr - 1
    if (next > 0) {
      this.mainCtx.clearRect(0, 0, this.W, this.H)
      for (var i = 1; i < h.curr; i++) {
        h.queue[i].execute()
      }
      h.curr = next
    } else {
      this.mainCtx.clearRect(0, 0, this.W, this.H)
    }
  }

  redo() {
    var h = this.history
    if (h.curr === h.tail) return
    h.curr += 1
    this.mainCtx.clearRect(0, 0, this.W, this.H)
    for (var i = 1; i < h.curr + 1; i++) {
      h.queue[i].execute()
    }
  }

  setupBackground() {
    var bgCtx = this.bgCtx
    bgCtx.save()
    bgCtx.strokeStyle = "#369"
    bgCtx.fillStyle = "#fff"
    bgCtx.fillRect(0, 0, this.W, this.H)
    bgCtx.restore()
  }
}
