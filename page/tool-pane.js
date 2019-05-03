class ToolPane {
  constructor(board) {
    this.el = document.getElementById("toolPane")
    this.board = board
    this.setupTools()
    this.bindEvents()
  }

  setupTools() {
    this.tools = new Map([
      [PEN, new PenTool(this.board)],
      [ERASER, new EraserTool(this.board)],
      [RECT, new RectTool(this.board)],
      [LINE, new LineTool(this.board)],
      [CIRCLE, new CircleTool(this.board)],
      [TEXT, new TextTool(this.board)]
    ])
    // 默认工具为画笔
    this.tool = this.tools.get(PEN)
    // 在Dom节点上绑定当前工具相关事件
    this.tool.install()
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
      this.board.mainCtx.clearRect(0, 0, this.board.W, this.board.H)
    } else if (toolType === DOWNLOAD) {
      var image = this.board.mainCanvas.toDataURL("image/png")
      var save_link = document.createElement('a');
      save_link.href = image;
      save_link.download = new Date().toUTCString() + '.png';
      save_link.click()
    } else if (toolType === CANCEL) {
      this.board.cancel()
    } else if (toolType === REDO) {
      this.board.redo()
    }
  }

  bindEvents() {
    // 在工具条Dom上代理各个工具按钮的点击事件
    delegate(this.el, "click", ".tool", (ev, el) => {
      // 根据点击的按钮包含的工具的类型，切换当前使用的工具
      var toolType = el.dataset.name
      this.switchTool(toolType)
    })
  }
}