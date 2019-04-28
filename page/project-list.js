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
    for (var k in Object.keys(projects)) {
      var p = projects[k]
      this.projects.set(k, p)
      this.infoElement.classList.remove("active")
      this.parentElement.insertAdjacentHTML("beforeend", `
        <li data-projectid="${p.id}" class="project-item">${p.name}</li> 
      `)
    }
  }

  bindEvents() {
    window.eventbus.on("save_project", (p) => {
      this.projects.set(p.id, p)
      var lst = this.infoElement.classList
      if (lst.contains("active")) {
        lst.remove("active")
      }
      this.parentElement.insertAdjacentHTML("beforeend", `
        <li data-projectid="${p.id}" class="project-item">${p.name}</li> 
      `)
    })
    this.parentElement.addEventListener("click", (ev) => {
      var t = ev.target
      if (t.nodeName.toLowerCase() === "li") {
        var pid = t.dataset.projectid
        var project = this.projects.get(pid)
        window.eventbus.emit("load_project", project)
      }
    })
  }

}

new ProjectList("board_project_list")