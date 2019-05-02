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

  window.hasClass = function(el, c) {
    if (el.classList) {
      return el.classList.contains(c)
    } else {
      return new RegExp("^\\s*" + c + "\\s*&").test(el.className)
    }
  }

  var _addClass = function(el, c) {
    if (el.classList) {
			el.classList.add(c)
		} else if (!hasClass(el, c)) {
			el.className += '' + c
		}
  }

  window.addClass = function(el, c) {
    if (Array.isArray(el)) {
      for (var i = 0; i < el.length; i++) {
        _addClass(el[i], c)
      }
    } else {
      _addClass(el, c)
    }
  }

  var _removeClass = function(el, c) {
    if (el.classList) {
      el.classList.remove(c)
    } else if (hasClass(c)) {
      el.className = el.className.replace(new RegExp("^\\s*" + c + "\\s*$"), " ")
    }
  }

  window.removeClass = function(el, c) {
    if (Array.isArray(el)) {
      for (var i = 0; i < el.length; i++) {
        _removeClass(el[i], c)
      }
    } else {
      _removeClass(el, c)
    }
  }

  window.delegate = function(el, eventType, selector, callback) {
    el.addEventListener(eventType, function(e) {
      var t = e.target 
      while (!t.matches(selector)) {
        if (t === el) {
          t = null
          break
        }
        t = t.parentElement
      }
      t && callback(e, t)
    })
  }

  window.siblings = function(el) {
    var parent = el.parentElement
    var sibs = []
    if (parent) {
      var children = parent.children
      for (var i = 0; i<children.length; i++) {
        if (children[i] !== el) {
          sibs.push(children[i])
        }
      }
    } 
    return sibs
  }

})()