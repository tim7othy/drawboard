(function() {
  window.log = console.log.bind(console)
  window.isFunc = function(func) {
    return Object.prototype.toString.call(func) === "[object Function]"
  }
  window.getRandom = function() {
    var r = Math.random()
    var d = new Date().getTime()
    return (d * r).toString().replace(".", "").slice(0, 10)
  }
})()