class Tool {
  constructor(board) {
    this.board = board
    this.positions = []
  }

  install() {
    this.initEvents()
  }

  initEvents() {
    this.isMouseDown = false
    this.isClicked = false
    this.mouseDownHandler = (ev) => { this.onMouseDown(ev) } 
    this.mouseMoveHandler = (ev) => { this.onMouseMove(ev) } 
    this.mouseUpHandler = (ev) => { this.onMouseUp(ev) } 
    window.addEventListener("mousedown", this.mouseDownHandler)
    window.addEventListener("mousemove", this.mouseMoveHandler)
    window.addEventListener("mouseup", this.mouseUpHandler)
  }

  unInstall() {
    window.removeEventListener("mousedown", this.mouseDownHandler)
    window.removeEventListener("mousemove", this.mouseMoveHandler)
    window.removeEventListener("mouseup", this.mouseUpHandler)
  }

  getPos(ev) {
    // 鼠标事件在文档上的坐标
    var pageX = ev.pageX
    var pageY = ev.pageY
    var x = pageX - this.board.offsetX
    var y = pageY - this.board.offsetY
    return {x, y}
  }

  addPos(pos) {
    this.positions.push(pos)
  }

  clearPos() {
    this.positions = []
  }

  makeCommand() {}

  getCommandContext() {
    return {
      ctx: this.board.mainCtx,
      color: this.board.color,
      lineWidth: this.board.lineWidth,
      positions: this.getPositions()
    }
  }

  setCommand(cmd) {
    this.board.setHistory(cmd)
  }

  execCommand(cmd) {
    cmd.execute()
  }

  getPositions() {
    return JSON.parse(JSON.stringify(this.positions))
  }

  onMouseDown(ev) {
    this.mouseDownPos = this.getPos(ev) 
    this.isMouseDown = true
    this.isClicked = false
    this.outOfRange = false
  }

  onMouseMove(ev) {
    this.mouseMovePos = this.getPos(ev)
  }

  _pointInCanvasRange(pos) {
    var w = this.board.W
    var h = this.board.H
    return pos.x > 0 && pos.x < w && pos.y > 0 && pos.y < h
  }

  onMouseUp(ev) {
    this.mouseUpPos = this.getPos(ev)
    this.isMouseDown = false
    var pos1 = this.mouseDownPos
    var pos2 = this.mouseUpPos
    if (Math.abs(pos2.x - pos1.x) < 3 && Math.abs(pos2.y - pos1.y) < 3) {
      this.isClicked = true
    }
    if (this._pointInCanvasRange(pos1) && this._pointInCanvasRange(pos2)) {
      this.outOfRange = false
    } else {
      this.outOfRange = true
    }
  }


  drawOn() {
    var cmd = this.makeCommand()
    this.setCommand(cmd)
    this.execCommand(cmd)
  }

  clearUI() {
    this.board.uiCtx.clearRect(0, 0, this.board.W, this.board.H)
  }

  clearMain() {
    this.board.mainCtx.clearRect(0, 0, this.board.W, this.board.H)
  }
}

class PenTool extends Tool {
  constructor(board) {
    super(board)
    this.toolType = PEN
  }

  makeCommand() {
    var context = this.getCommandContext()
    return new PenDrawCommand(context)
  }

  onMouseDown(ev) {
    super.onMouseDown(ev)
    this.addPos(this.mouseDownPos)
  }

  onMouseMove(ev) {
    super.onMouseMove(ev)
    if (!this.isMouseDown) {
      return
    }
    if (!this.lastPos) {
      this.lastPos = {
        ...this.mouseDownPos
      }
    }
    this.drawTmpLines()
    this.lastPos = {
      ...this.mouseMovePos
    }
    this.addPos(this.mouseMovePos)
  }

  drawTmpLines() {
    var ctx = this.board.uiCtx
    ctx.save()
    ctx.strokeStyle = this.board.color
    ctx.lineWidth = this.board.lineWidth
    Graphic.drawLine(ctx, this.lastPos, this.mouseMovePos)
    ctx.restore()
  }


  onMouseUp(ev) {
    super.onMouseUp(ev)
    if (!this.outOfRange) {
      this.drawOn()
    }
    this.clearUI()
    this.lastPos = null
    this.clearPos()
  }
}

class RectTool extends Tool {
  constructor(board) {
    super(board)
    this.toolType = RECT
  }

  makeCommand() {
    return new RectDrawCommand(this.getCommandContext())
  }

  onMouseDown(ev) {
    super.onMouseDown(ev)
    this.addPos(this.mouseDownPos)
  }

  onMouseMove(ev) {
    super.onMouseMove(ev)
    if (!this.isMouseDown) {
      return
    }
    this.clearUI()
    this.drawTmpRect()
  }


  onMouseUp(ev) {
    super.onMouseUp(ev)
    this.addPos(this.mouseUpPos)
    if (!this.outOfRange) {
      this.drawOn()
    }
    this.clearUI()
    this.clearPos()
  }

  drawTmpRect() {
    var ctx = this.board.uiCtx
    ctx.save()
    ctx.strokeStyle = this.board.color
    ctx.lineWidth = this.board.lineWidth
    Graphic.drawRect(ctx, this.mouseDownPos, this.mouseMovePos)
    ctx.restore()
  }

}

class EraserTool extends Tool {
  constructor(board) {
    super(board)
    this.toolType = ERASER
  }

  makeCommand() {
    return new EraserDrawCommand(this.getCommandContext())
  }

  getCommandContext() {
    return {
      ctx: this.board.mainCtx,
      width: this.board.eraserSize,
      height: this.board.eraserSize,
      positions: this.getPositions()
    }
  }

  drawEraserBorder(x, y, w, h) {
    var ctx = this.board.uiCtx
    var pos1 = {x, y}
    var pos2 = {x:x+w, y:y+h}
    this.clearUI()
    Graphic.drawRect(ctx, pos1, pos2)
  }

  onMouseDown(ev) {
    super.onMouseDown(ev)
    this.addPos(this.mouseDownPos)
    var eraserWidth = this.board.eraserSize
    var eraserHeight = this.board.eraserSize
    var x = this.mouseDownPos.x - eraserWidth / 2
    var y = this.mouseDownPos.y - eraserHeight / 2
    this.board.mainCtx.clearRect(x, y, eraserWidth, eraserHeight)
  }

  onMouseMove(ev) {
    super.onMouseMove(ev)
    var eraserWidth = this.board.eraserSize
    var eraserHeight = this.board.eraserSize
    var x = this.mouseMovePos.x - eraserWidth / 2
    var y = this.mouseMovePos.y - eraserHeight / 2
    if (this.isMouseDown) {
      this.addPos(this.mouseMovePos)
      this.board.mainCtx.clearRect(x, y, eraserWidth, eraserHeight)
    }
    this.drawEraserBorder(x, y, eraserWidth, eraserHeight)
  }

  onMouseUp(ev) {
    super.onMouseUp(ev)
    if (this.outOfRange) {
      this.clearPos()
      return
    }
    var cmd = this.makeCommand()
    this.setCommand(cmd)
    this.clearPos()
  }
}

class LineTool extends Tool {
  constructor(board) {
    super(board)
    this.toolType = LINE
  }

  makeCommand() {
    return new LineDrawCommand(this.getCommandContext())
  }

  onMouseDown(ev) {
    super.onMouseDown(ev)
    this.addPos(this.mouseDownPos)
  }

  onMouseMove(ev) {
    super.onMouseMove(ev)
    if (!this.isMouseDown) {
      return
    }
    this.clearUI()
    this.drawTmpLine()
  }

  onMouseUp(ev) {
    super.onMouseUp(ev)
    this.addPos(this.mouseUpPos)
    if (!this.outOfRange) {
      this.drawOn()
    }
    this.clearUI()
    this.clearPos()
  }

  drawTmpLine() {
    var ctx = this.board.uiCtx
    ctx.save()
    ctx.strokeStyle = this.board.color
    ctx.lineWidth = this.board.lineWidth
    Graphic.drawLine(ctx, this.mouseDownPos, this.mouseMovePos)
    ctx.restore()
  }
}

class CircleTool extends Tool {
  constructor(board) {
    super(board)
    this.toolType = CIRCLE
  }

  makeCommand() {
    return new CircleDrawCommand(this.getCommandContext())
  }

  onMouseDown(ev) {
    super.onMouseDown(ev)
    this.addPos(this.mouseDownPos)
  }

  onMouseMove(ev) {
    super.onMouseMove(ev)
    if (!this.isMouseDown) {
      return
    }
    this.clearUI()
    this.drawTmpCircle()
  }

  onMouseUp(ev) {
    super.onMouseUp(ev)
    this.addPos(this.mouseUpPos)
    if (!this.outOfRange) {
      this.drawOn()
    }
    this.clearUI()
    this.clearPos()
  }

  drawTmpCircle() {
    var ctx = this.board.uiCtx
    ctx.save()
    ctx.strokeStyle = this.board.color
    ctx.lineWidth = this.board.lineWidth
    Graphic.drawCircle(ctx, this.mouseDownPos, this.mouseMovePos)
    ctx.restore()
  }
}

class TextTool extends Tool {
  constructor(board) {
    super(board)
    this.setupConfigChange()
    this.setupInput()
    this.setupTextarea()
    this.toolType = TEXT
  }

  setupConfigChange() {
    window.eventbus.on("board_text_width_change", (value) => { this.resize() })
    window.eventbus.on("board_text_height_change", (value) => { this.resize() })
  }

  setupInput() {
    // 生成一个隐藏的输入框挂载到页面上
    var input = `<textarea id="drawboard_input">`
    this.board.uiCanvas.insertAdjacentHTML("afterend", input)
    this.input = document.getElementById("drawboard_input")
    this.input.blur()

    this.input.addEventListener("input", () => { 
      // 没有在输入中文时，直接渲染到canvas文本框中
      if (!this.onCompInput) {
        this.onInput() 
      }
    })
    this.input.addEventListener("compositionstart", () => { this.onCompInput = true})
    this.input.addEventListener("compositionend", () => { 
      this.onCompInput = false
      // 输入一句中文完成时才渲染到文本框
      this.onInput()
    })
  }
  
  makeCommand() {
    return new TextDrawCommand(this.getCommandContext())
  }

  getCommandContext() {
    return {
      ctx: this.board.mainCtx,
      pos: this.textareaPos,
      text: this.value,
      color: this.board.color,
      fontSize: this.board.fontSize,
      textWidth: this.board.textWidth,
      textHeight: this.board.textHeight
    }
  }

  onInput() {
    this.value = this.input.value
    this.clearUI()
    this.drawText(this.board.uiCtx, this.textareaPos, this.value)
  }

  drawText(ctx, pos, text) {
    ctx.save()
    ctx.font = `${this.board.fontSize}px sans-serif`;
    ctx.fillStyle = this.board.color
    var lines = []
    var line = ""
    var headIndex = 0
    for (var i = 0; i < text.length; i++) {
      if (text[i] === "\n") {
        lines.push(line)
        headIndex = i + 1
        line = ""
      } else {
        line += text[i]
        var obj = ctx.measureText(line)
        if (obj.width > (this.board.textWidth)) {
          lines.push(text.substring(headIndex, i))
          line = text[i]
          headIndex = i
        }
      }
    }
    if (line !== "") {
      lines.push(line)
    }
    for (var j = 0; j < lines.length; j++) {
      if ((j+1)*this.board.fontSize < this.board.textHeight) {
        ctx.fillText(lines[j], pos.x, pos.y + (j + 1) * this.board.fontSize)
      }
    }
    // const offsetX = this.board.fontSize * 0.1
    // const offsetY = this.board.fontSize * 0.2
    // var arrowX = offsetX + pos.x + lines[lines.length - 1].length * this.board.fontSize
    // var arrowY = offsetY + pos.y + (lines.length - 1) * this.board.fontSize
    // // 光标需要重新绘制，同一层的文本框也需要
    // this.board.assistCtx.clearRect(0, 0, this.board.W, this.board.H)
    // this.drawTextarea(this.textareaPos)
    // this.board.assistCtx.fillRect(arrowX, arrowY, 1, this.board.fontSize)
    // ctx.restore()
  }

  resize() {
    this.drawTextarea(this.textareaPos)
  }

  drawTextarea(pos) {
    var w = this.board.textWidth
    var h = this.board.textHeight
    var ctx = this.board.assistCtx
    ctx.save()
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 1
    ctx.font = "15px sans-serif"
    ctx.clearRect(0, 0, this.board.W, this.board.H)
    ctx.strokeRect(pos.x, pos.y, w, h)
    // 绘制确认按钮
    ctx.fillStyle = "RGB(18, 206, 102)"
    ctx.fillRect(pos.x, pos.y - this.btnH, this.btnW, this.btnH)
    ctx.fillStyle = "#fff"
    ctx.fillText("确认", pos.x + 10, pos.y - 10)
    // 绘制取消按钮
    ctx.fillStyle = "#456"
    ctx.fillRect(pos.x + this.btnW + 10, pos.y - this.btnH, this.btnW, this.btnH)
    ctx.fillStyle = "#fff"
    ctx.fillText("取消", pos.x + this.btnW + 20, pos.y - 10)
    ctx.restore()
  }

  setupTextarea() {
    this.isTextareaDrawn = false
    this.textareaPos = {x:0, y:0}
    this.btnW = 50
    this.btnH = 30
  }

  confirmInput(pos) {
    return (pos.x > this.textareaPos.x && pos.x < this.textareaPos.x + this.btnW
      && pos.y > this.textareaPos.y - this.btnH && pos.y < this.textareaPos.y)
  }

  cancelInput(pos) {
    return (pos.x > this.textareaPos.x + this.btnW + 10 && pos.x < this.textareaPos.x + 2*this.btnW + 10
      && pos.y > this.textareaPos.y - this.btnH && pos.y < this.textareaPos.y)
  }

  finishInput() {
    this.drawOn()
    this.clearUI()
    this.setCommand()
    this.input.value = ""
  }

  onMouseDown(ev) {
    super.onMouseDown(ev)
    if (!this.isTextareaDrawn) {
      this.drawTextarea(this.mouseDownPos)
    }
  }

  onMouseMove(ev) {
    super.onMouseMove(ev)
    if (!this.isMouseDown) {
      return
    }
    if (!this.isTextareaDrawn) {
      this.drawTextarea(this.mouseMovePos)
    }
  }

  onMouseUp(ev) {
    super.onMouseUp(ev)
    if (this.outOfRange) return
    if (this.isTextareaDrawn) {
      if (this.isClicked && this.confirmInput(this.mouseUpPos)) {
        this.board.assistCtx.clearRect(0, 0, this.board.W, this.board.H)
        if (this.input.value !== "") {
          this.finishInput()
        }
        this.isTextareaDrawn = false
        return
      } else if (this.isClicked && this.cancelInput(this.mouseUpPos)) {
        this.board.assistCtx.clearRect(0, 0, this.board.W, this.board.H)
        this.board.uiCtx.clearRect(0, 0, this.board.W, this.board.H)
        this.input.value = ""
        this.isTextareaDrawn = false
        return
      } else {
        this.input.focus()
      }
    } else {
      this.textareaPos.x = this.mouseUpPos.x
      this.textareaPos.y = this.mouseUpPos.y
      this.drawTextarea(this.textareaPos)
      this.isTextareaDrawn = true
      this.input.focus()
    }
  }
}