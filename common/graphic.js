class Graphic {

}

Graphic.drawLine = function(ctx, pos1, pos2) {
  ctx.beginPath()
  ctx.moveTo(pos1.x, pos1.y)
  ctx.lineTo(pos2.x, pos2.y)
  ctx.closePath()
  ctx.stroke()
}

Graphic.drawRect = function(ctx, pos1, pos2) {
    var w = pos2.x - pos1.x
    var h = pos2.y - pos1.y
    ctx.beginPath()
    ctx.moveTo(pos1.x, pos1.y)
    ctx.lineTo(pos1.x + w, pos1.y)
    ctx.lineTo(pos1.x + w, pos1.y + h)
    ctx.lineTo(pos1.x, pos1.y + h)
    ctx.closePath()
    ctx.stroke()
}

Graphic.drawCircle = function(ctx, pos1, pos2) {
  var center = pos1
  var radius = Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2))
  ctx.beginPath()
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2)
  ctx.stroke()
}