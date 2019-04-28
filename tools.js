class Tool {
  constructor(board) {
    this.board = board
    this.color = "#fff"
    this.lineWidth = 1.5
    this.fontsize = 25
    this.dashOffset = 0
  }

  install() {
    this.initEvents()
  }

  initEvents() {
    var uiCanvas = this.board.uiCanvas
    this.isMouseDown = false
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
  }

  onMouseMove(ev) {
    this.mouseMovePos = this.getPos(ev)
  }

  onMouseUp(ev) {
    this.mouseUpPos = this.getPos(ev)
    this.isMouseDown = false
  }

  drawLine(ctx, pos1, pos2) {
    ctx.save()
    ctx.lineWidth = this.lineWidth
    ctx.strokeStyle = this.color
    ctx.beginPath()
    ctx.moveTo(pos1.x, pos1.y)
    ctx.lineTo(pos2.x, pos2.y)
    ctx.stroke()
    ctx.restore()
  }

  drawRect(ctx, pos1, pos2, options) {
    var w = pos2.x - pos1.x
    var h = pos2.y - pos1.y
    ctx.save()
    ctx.lineWidth = this.lineWidth
    ctx.strokeStyle = this.color
    if (options && options.dashed) {
      ctx.setLineDash([5, 15])
      if (options.flow) {
        ctx.lineDashOffset = this.dashOffset
        this.dashOffset++
        if (this.dashOffset > 16) {
          this.dashOffset = 0
        }
      }
    }
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
    ctx.lineWidth = this.lineWidth
    ctx.strokeStyle = this.color
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

class Pen extends Tool {
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

class Rect extends Tool {
  constructor(board) {
    super(board)
    this.toolType = RECT
  }

  onMouseMove(ev) {
    super.onMouseMove(ev)
    if (!this.isMouseDown) {
      return
    }
    log(this.board)
    this.board.uiCtx.clearRect(0, 0, this.board.W, this.board.H)
    this.drawRect(this.board.uiCtx, this.mouseDownPos, this.mouseMovePos)
  }

  onMouseUp(ev) {
    super.onMouseUp(ev)
    this.drawOn()
  }

}

class Eraser extends Tool {
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
    var eraserWidth = 20
    var eraserHeight = 20
    var x = this.mouseDownPos.x - eraserWidth / 2
    var y = this.mouseDownPos.y - eraserHeight / 2
    this.board.mainCtx.clearRect(x, y, 20, 20)
  }

  onMouseMove(ev) {
    super.onMouseMove(ev)
    var eraserWidth = 20
    var eraserHeight = 20
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

class Line extends Tool {
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

class Circle extends Tool {
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

class Text extends Tool {
  constructor(board) {
    super(board)
    this.textWidth = 300
    this.textHeight = 200
    this.fontsize = 25
    this.inputHandler = (ev) => { this.onInput(ev) }
  }
  
  drawText(pos, text) {
    var ctx = this.board.uiCtx
    ctx.clearRect(0, 0, this.board.W, this.board.H)
    ctx.save()
    ctx.font = `${this.fontsize}px sans-serif`;
    ctx.fillStyle = this.color
    var lines = []
    var line = ""
    var headIndex = 0
    for (var i = 0; i < text.length; i++) {
      line += text[i]
      var obj = ctx.measureText(line)
      if (obj.width > (this.textWidth - this.fontsize)) {
        lines.push(text.substring(headIndex, i))
        line = ""
        headIndex = i
      }
    }
    if (line !== "") {
      lines.push(line)
    }
    for (var j = 0; j < lines.length; j++) {
      if ((j+1)*this.fontsize < this.textHeight) {
        ctx.fillText(lines[j], pos.x, pos.y + (j + 1) * this.fontsize)
      }
    }
    ctx.restore()
  }

  drawTextarea(pos) {
    var pos2 = {
      x: pos.x + this.textWidth,
      y: pos.y + this.textHeight
    }
    this.board.uiCtx.clearRect(0, 0, this.board.W, this.board.H)
    this.drawRect(this.board.uiCtx, pos, pos2, {dashed: true, flow: true})
  }

  onInput(ev) {
    this.value = this.board.input.value
    this.drawText(this.mouseUpPos, this.value)
  }

  finishInput() {
    // 去掉文本框的虚线框
    // this.board.cacel()
    this.drawOn().then(() => {
      this.board.input.value = ""
      this.drawTextarea(this.mouseDownPos)
    })
  }

  onMouseDown(ev) {
    super.onMouseDown(ev)
    if (this.board.input.value !== "") {
      this.finishInput()
    } else {
      this.drawTextarea(this.mouseDownPos)
    }
  }

  onMouseMove(ev) {
    super.onMouseMove(ev)
    if (!this.isMouseDown) {
      return
    }
    this.drawTextarea(this.mouseMovePos)
  }

  onMouseUp(ev) {
    super.onMouseUp(ev)
    this.drawTextarea(this.mouseUpPos)
    this.drawOn()
    this.board.input.focus()
    this.board.input.addEventListener("input", this.inputHandler)
  }
}