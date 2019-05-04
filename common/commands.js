class Command {
  constructor(receiver) {
    this.receiver = receiver
  }

  execute() {}
}

class PenDrawCommand extends Command {
  execute() {
    var {ctx, color, lineWidth, positions} = this.receiver
    ctx.save()
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.beginPath()
    for (var i = 0; i < positions.length; i++) {
      var p = positions[i]
      if (i === 0) {
        ctx.moveTo(p.x, p.y)
      } else {
        ctx.lineTo(p.x, p.y)
      }
    }
    ctx.stroke()
    ctx.restore()
  }
}

class RectDrawCommand extends Command {
  execute() {
    var {ctx, color, lineWidth, positions} = this.receiver
    var pos1 = positions[0]
    var pos2 = positions[1]
    ctx.save()
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    Graphic.drawRect(ctx, pos1, pos2)
    ctx.restore()
  }
}

class LineDrawCommand extends Command {
  execute() {
    var {ctx, color, lineWidth, positions} = this.receiver
    var pos1 = positions[0]
    var pos2 = positions[1]
    ctx.save()
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    Graphic.drawLine(ctx, pos1, pos2)
    ctx.restore()
  }
}

class CircleDrawCommand extends Command {
  execute() {
    var {ctx, color, lineWidth, positions} = this.receiver
    var pos1 = positions[0]
    var pos2 = positions[1]
    ctx.save()
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    Graphic.drawCircle(ctx, pos1, pos2)
    ctx.restore()
  }
}

class EraserDrawCommand extends Command {
  execute() {
    var {ctx, width, height, positions} = this.receiver
    for (var i = 0; i < positions.length; i++) {
      var p = positions[i]
      ctx.clearRect(p.x - width / 2, p.y - height / 2, width, height)
    }
  }
}

class TextDrawCommand extends Command {
  execute() {
    var {ctx, pos, text, color, fontSize, textWidth, textHeight} = this.receiver
    ctx.save()
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillStyle = color
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
        if (obj.width > (textWidth)) {
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
      if ((j+1)*fontSize < textHeight) {
        ctx.fillText(lines[j], pos.x, pos.y + (j + 1) * fontSize)
      }
    }

  }
}