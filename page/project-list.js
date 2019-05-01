class ProjectList {
  constructor(parentId) {
    this.parentId = parentId
    this.$listPane = new jq("#" + parentId)
    this.$infoPane = new jq(".project-list-info")
    this.parentElement = document.getElementById(parentId)
    this.infoElement = this.parentElement.querySelector(".project-list-info")
    this.projects = new Map()
    this.loadProjects()
    this.bindEvents()
  }

  loadProjects() {
    var projects = localStorage.getItem("drawboard_projects")
    if (projects) {
      projects = JSON.parse(projects)
      if (Object.keys(projects).length === 0) {
        this.infoElement.classList.add("active")
      } else {
        this.infoElement.classList.remove("active")
        for (var k of Object.keys(projects)) {
          var p = projects[k]
          this.projects.set(k, p)
          this.parentElement.insertAdjacentHTML("beforeend", `
            <li data-projectid="${p.id}" class="project-item">
              <img class="project-thumb" src="${p.dataURL}"> 
            </li> 
          `)
        }
      }
    }
  }

  saveLocal() {
    var obj = {}
    for (var [k, v] of this.projects.entries()) {
      obj[k] = v
    }
    localStorage.setItem("drawboard_projects", JSON.stringify(obj))
  }

  bindEvents() {
    window.eventbus.on("save_project", (p) => {
      this.projects.set(p.id, p)
      this.saveLocal()
      var lst = this.infoElement.classList
      if (lst.contains("active")) {
        lst.remove("active")
      }
      this.parentElement.insertAdjacentHTML("beforeend", `
        <li data-projectid="${p.id}" class="project-item">
          <img class="project-thumb" src="${p.dataURL}"> 
        </li> 
      `)
      var t = this.parentElement.querySelector(`li[data-projectid="${p.id}"]`)
      t.classList.add("active")
      var items = this.parentElement.querySelectorAll(".project-item")
      for (var i of items) {
        if (i !== t && i.classList.contains("active")) {
          i.classList.remove("active")
        }
      }
    })
    window.eventbus.on("delete_project", (p) => {
      this.projects.delete(p.id)
      this.saveLocal()
      this.parentElement.querySelector(`li[data-projectid="${p.id}"]`).remove()
    })

    // this.$listPane.delegate("click", ".project-item", (ev, el) => {
    //   var $el = new jq(el)
    //   $el.addClass("active")
    // })
    this.parentElement.addEventListener("click", (ev) => {
      var t = ev.target
      while (!t.classList.contains("project-item")) {
        if (t.classList.contains("project-list")) {
          return
        }
        t = t.parentElement
      }
      if (!t.classList.contains("active")) {
        t.classList.add("active")
        var items = this.parentElement.querySelectorAll(".project-item")
        for (var i of items) {
          if (i !== t && i.classList.contains("active")) {
            i.classList.remove("active")
          }
        }
      }
      var pid = t.dataset.projectid
      var project = this.projects.get(pid)
      window.eventbus.emit("load_project", project)
    })
  }

}

new ProjectList("board_project_list")