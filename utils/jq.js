(function() {
  var jq = function(el) {
    if (el instanceof Node) {
      this.el = el
    } else {
      this.el = document.querySelector(el)
    }
  }

  jq.prototype.hasClass = function(c) {
    if (this.el.classList) {
      return this.el.classList.contains(c)
    } else {
      return new RegExp("^\\s*" + c + "\\s*&").test(this.el.className)
    }
  }

  jq.prototype.addClass = function(c) {
    if (this.el.classList) {
			this.el.classList.add(c)
		} else if (!this.hasClass(c)) {
			el.className += '' + c
		}
  }

  jq.prototype.removeClass = function(c) {
    if (this.el.classList) {
      this.el.classList.remove(c)
    } else if (this.hasClass(c)) {
      this.el.className = this.el.className.replace(new RegExp("^\\s*" + c + "\\s*$"), " ")
    }
  }

  jq.prototype.delegate = function(eventType, selector, callback) {
    var self = this
    this.el.addEventListener(eventType, function(e) {
      var t = e.target 
      while (!t.matches(selector)) {
        if (t === self.el) {
          t = null
          break
        }
        t = t.parentElement
      }
      t && callback(e, t)
    })
  }

  window.jq = jq
})()