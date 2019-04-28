(function() {
  window.log = console.log.bind(console)
  window.isFunc = function(func) {
    return Object.prototype.toString.call(func) === "[object Function]"
  }
})()