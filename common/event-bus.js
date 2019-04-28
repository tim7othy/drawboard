class EventBus {
  constructor() {
    this.events = new Map()
  }

  on(eventName, handler) {
    var ev = this.events.get(eventName)
    if (!ev) {
      this.events.set(eventName, [handler])
    } else {
      for (var h in ev) {
        if (h === handler) {
          return
        }
      }
      ev.push(handler)
    }
  }

  emit(eventName, args) {
    if (this.events.has(eventName)) {
      this.events.get(eventName).forEach(h => {
        h(args)
      });
    }
  }
}

window.eventbus = new EventBus()