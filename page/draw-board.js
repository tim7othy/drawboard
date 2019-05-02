class DrawBoard {
  constructor(parentId) {
    this.parentId = parentId
    this.setupCanvas()
    this.setupConfig()
    this.setupBackground()
    this.setupTools()
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
        this.setupHistory()
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
      head: 0,
      tail: 0,
      curr: 0,
      capacity: capacity,
      queue: Array(capacity)
    }
  }

  setHistory(item) {
    var h = this.history
    var next = (h.curr + 1) % (h.capacity - 1)
    if (next !== h.head) {
      h.queue[next] = item
    } else {
      this.baseDataURL = h.queue[next]
      h.queue[next] = item
      h.head = (h.head + 1) % (h.capacity - 1)
    }
    h.curr = next
    h.tail = next
  }

  cancel() {
    var h = this.history
    if (h.curr === h.head) return
    var next = h.curr - 1 >= 0 ? h.curr - 1 : h.capacity - 1
    if (next !== h.head) {
      var lastDataURL = h.queue[next]
      var img = new Image()
      img.onload = () => {
        this.mainCtx.clearRect(0, 0, this.W, this.H)
        this.mainCtx.drawImage(img, 0, 0)
      }
      img.src = lastDataURL
    } else {
      this.mainCtx.clearRect(0, 0, this.W, this.H)
    }
    h.curr = next
  }

  redo() {
    var h = this.history
    if (h.curr === h.tail) return
    var next = (h.curr + 1) % (h.capacity - 1)
    h.curr = next
    var nextDataURL = h.queue[next]
    var img = new Image()
    img.onload = () => {
      this.mainCtx.clearRect(0, 0, this.W, this.H)
      this.mainCtx.drawImage(img, 0, 0)
    }
    img.src = nextDataURL
  }

  setupBackground() {
    var bgCtx = this.bgCtx
    bgCtx.save()
    bgCtx.strokeStyle = "#369"
    bgCtx.fillStyle = "#fff"
    bgCtx.fillRect(0, 0, this.W, this.H)
    // bgCtx.lineWidth = 1
    // bgCtx.fillRect(0, 0, this.W, this.H)
    // var w = this.gridWidth || 20
    // var h = this.gridHeight || 20
    // var cols = Math.floor(this.W / w)
    // var rows = Math.floor(this.H / h)
    // for (var i = 0; i <= cols; i++) {
    //   bgCtx.moveTo(w*i, 0)
    //   bgCtx.lineTo(w*i, this.H)
    // }
    // for (var i = 0; i <= rows; i++) {
    //   bgCtx.moveTo(0, h*i)
    //   bgCtx.lineTo(this.W, h*i)
    // }
    // bgCtx.stroke()
    bgCtx.restore()
  }

  setupTools() {
    this.tools = new Map([
      [PEN, new Pen(this)],
      [ERASER, new Eraser(this)],
      [RECT, new Rect(this)],
      [LINE, new Line(this)],
      [CIRCLE, new Circle(this)],
      [TEXT, new Text(this)]
    ])
    // 默认工具为画笔
    this.tool = this.tools.get(PEN)
    // 在Dom节点上绑定当前工具相关事件
    this.tool.install()

    window.eventbus.on("switch-tool", (toolType) => { this.switchTool(toolType) })
    
  }

  switchTool(toolType) {
    var tool = this.tools.get(toolType)
    if (tool && toolType !== this.tool.toolType) {
      // 取消当前工具在dom上绑定的事件
      this.tool.unInstall()
      // 切换工具
      this.tool = tool
      this.tool.install()
    } else if (toolType === CLEAR){
      this.mainCtx.clearRect(0, 0, this.W, this.H)
    } else if (toolType === DOWNLOAD) {
      var image = this.mainCanvas.toDataURL("image/png")
      var save_link = document.createElement('a');
      save_link.href = image;
      save_link.download = new Date().toUTCString() + '.png';
      save_link.click()
    } else if (toolType === CANCEL) {
      this.cancel()
    } else if (toolType === REDO) {
      this.redo()
    }
  }
}

new DrawBoard("drawboard_wrapper")