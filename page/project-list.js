class ProjectList {
  constructor(parentId) {
    this.parentId = parentId
    this.parentElement = document.getElementById(parentId)
    this.infoElement = this.parentElement.querySelector(".project-list-info")
    this.projects = new Map()
    this.loadProjects()
    this.bindEvents()
  }

  loadProjects() {
    var projects = localStorage.getItem("drawboard_projects")
    if (!projects) {
      this.infoElement.classList.add("active")
      return
    }
    this.infoElement.classList.remove("active")
    projects = JSON.parse(projects)
    for (var k of Object.keys(projects)) {
      var p = projects[k]
      this.projects.set(k, p)
      this.parentElement.insertAdjacentHTML("beforeend", `
        <li data-projectid="${p.id}" class="project-item">
          <img class="project-thumb" src="${p.dataURL}"> 
          <div class="project-operations">
            <span>下载</span>
            <span>删除</span>
          </div>
        </li> 
      `)
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
    })
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