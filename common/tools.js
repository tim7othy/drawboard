class Tool {
  constructor(board) {
    this.board = board
  }

  install() {
    this.initEvents()
  }

  initEvents() {
    var uiCanvas = this.board.uiCanvas
    this.isMouseDown = false
    this.isClicked = false
    this.mouseDownHandler = (ev) => { this.onMouseDown(ev) } 
    this.mouseMoveHandler = (ev) => { this.onMouseMove(ev) } 
    this.mouseUpHandler = (ev) => { this.onMouseUp(ev) } 
    uiCanvas.addEventListener("mousedown", this.mouseDownHandler)
    uiCanvas.addEventListener("mousemove", this.mouseMoveHandler)
    uiCanvas.addEventListener("mouseup", this.mouseUpHandler)
  }

  unInstall() {
    var uiCanvas = this.board.uiCanvas
    uiCanvas.removeEventListener("mousedown", this.mouseDownHandler)
    uiCanvas.removeEventListener("mousemove", this.mouseMoveHandler)
    uiCanvas.removeEventListener("mouseup", this.mouseUpHandler)
  }

  getPos(ev) {
    var x = ev.offsetX
    var y = ev.offsetY
    return {x, y}
  }

  onMouseDown(ev) {
    this.mouseDownPos = this.getPos(ev) 
    this.isMouseDown = true
    this.isClicked = false
  }

  onMouseMove(ev) {
    this.mouseMovePos = this.getPos(ev)
  }

  onMouseUp(ev) {
    this.mouseUpPos = this.getPos(ev)
    this.isMouseDown = false
    var x1 = this.mouseDownPos.x
    var y1 = this.mouseDownPos.y
    var x2 = this.mouseUpPos.x
    var y2 = this.mouseUpPos.y
    if (Math.abs(x2 - x1) < 3 && Math.abs(y2 - y1) < 3) {
      this.isClicked = true
    }
  }

  drawLine(ctx, pos1, pos2) {
    ctx.save()
    ctx.lineWidth = this.board.lineWidth
    ctx.strokeStyle = this.board.color
    ctx.beginPath()
    ctx.moveTo(pos1.x, pos1.y)
    ctx.lineTo(pos2.x, pos2.y)
    ctx.stroke()
    ctx.restore()
  }

  drawRect(ctx, pos1, pos2) {
    var w = pos2.x - pos1.x
    var h = pos2.y - pos1.y
    ctx.save()
    ctx.lineWidth = this.board.lineWidth
    ctx.strokeStyle = this.board.color
    ctx.beginPath()
    ctx.moveTo(pos1.x, pos1.y)
    ctx.lineTo(pos1.x + w, pos1.y)
    ctx.lineTo(pos1.x + w, pos1.y + h)
    ctx.lineTo(pos1.x, pos1.y + h)
    ctx.closePath()
    ctx.stroke()
    ctx.restore()
  }

  drawCircle(ctx, center, radius) {
    ctx.save()
    ctx.lineWidth = this.board.lineWidth
    ctx.strokeStyle = this.board.color
    ctx.beginPath()
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  drawOn() {
    return new Promise((resolve, reject) => {
      // ui绘制层canvas生成图片
      var dataURL = this.board.uiCanvas.toDataURL()
      var img = new Image()
      img.onload = () => {
        // 将ui层生成的图片绘制到主画板上
        this.board.mainCtx.drawImage(img, 0, 0) 
        // 清空ui canvas层的动态绘制内容
        this.board.uiCtx.clearRect(0, 0, this.board.W, this.board.H)
        this.saveHistory()
        resolve()
      }
      img.src = dataURL
    })
  }

  saveHistory() {
    var t = this.board.mainCanvas.toDataURL()
    this.board.setHistory(t)
  }
}

class PenTool extends Tool {
  constructor(board) {
    super(board)
    this.toolType = PEN
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
    this.drawLine(this.board.uiCtx, this.lastPos, this.mouseMovePos)
    this.lastPos = {
      ...this.mouseMovePos
    }
  }

  onMouseUp(ev) {
    super.onMouseUp(ev)
    this.lastPos = null
    this.drawOn()
  }
}

class RectTool extends Tool {
  constructor(board) {
    super(board)
    this.toolType = RECT
  }

  onMouseMove(ev) {
    super.onMouseMove(ev)
    if (!this.isMouseDown) {
      return
    }
    this.board.uiCtx.clearRect(0, 0, this.board.W, this.board.H)
    this.drawRect(this.board.uiCtx, this.mouseDownPos, this.mouseMovePos)
  }

  onMouseUp(ev) {
    super.onMouseUp(ev)
    this.drawOn()
  }

}

class EraserTool extends Tool {
  constructor(board) {
    super(board)
    this.toolType = ERASER
  }

  drawEraserBorder(x, y, w, h) {
    var ctx = this.board.uiCtx
    var pos1 = {x, y}
    var pos2 = {x:x+w, y:y+h}
    ctx.clearRect(0, 0, this.board.W, this.board.H)
    this.drawRect(ctx, pos1, pos2)
  }

  onMouseDown(ev) {
    super.onMouseDown(ev)
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
    this.drawEraserBorder(x, y, eraserWidth, eraserHeight)
    if (!this.isMouseDown) {
      return
    }
    this.board.mainCtx.clearRect(x, y, eraserWidth, eraserHeight)
  }

  onMouseUp(ev) {
    super.onMouseUp(ev)
    this.saveHistory()
  }
}

class LineTool extends Tool {
  constructor(board) {
    super(board)
    this.toolType = LINE
  }

  onMouseMove(ev) {
    super.onMouseMove(ev)
    if (!this.isMouseDown) {
      return
    }
    this.board.uiCtx.clearRect(0, 0, this.board.W, this.board.H)
    this.drawLine(this.board.uiCtx, this.mouseDownPos, this.mouseMovePos)
  }

  onMouseUp(ev) {
    super.onMouseUp(ev)
    this.drawOn()
  }
}

class CircleTool extends Tool {
  constructor(board) {
    super(board)
    this.toolType = CIRCLE
  }

  onMouseMove(ev) {
    super.onMouseMove(ev)
    if (!this.isMouseDown) {
      return
    }
    var pos1 = this.mouseDownPos
    var pos2 = this.mouseMovePos
    var radius = Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2))
    this.board.uiCtx.clearRect(0, 0, this.board.W, this.board.H)
    this.drawCircle(this.board.uiCtx, this.mouseDownPos, radius)
  }

  onMouseUp(ev) {
    super.onMouseUp(ev)
    this.drawOn()
  }
}

class TextTool extends Tool {
  constructor(board) {
    super(board)
    this.setupInput()
    this.setupTextarea()
    this.toolType = TEXT
  }

  setupInput() {
    // 生成一个隐藏的输入框挂载到页面上
    var input = `<textarea id="drawboard_input" style="display:inline-block;">`
    document.body.insertAdjacentHTML("beforeend", input)
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
  
  onInput() {
    this.value = this.input.value
    this.drawText(this.textareaPos, this.value)
  }

  drawText(pos, text) {
    var ctx = this.board.uiCtx
    ctx.clearRect(0, 0, this.board.W, this.board.H)
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
    const offsetX = this.board.fontSize * 0.1
    const offsetY = this.board.fontSize * 0.2
    var arrowX = offsetX + pos.x + lines[lines.length - 1].length * this.board.fontSize
    var arrowY = offsetY + pos.y + (lines.length - 1) * this.board.fontSize
    // 光标需要重新绘制，同一层的文本框也需要
    this.board.assistCtx.clearRect(0, 0, this.board.W, this.board.H)
    this.drawTextarea(this.textareaPos)
    this.board.assistCtx.fillRect(arrowX, arrowY, 1, this.board.fontSize)
    ctx.restore()
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
    this.drawOn().then(() => {
      this.input.value = ""
    })
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