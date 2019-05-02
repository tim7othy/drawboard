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
    if (projects) {
      projects = JSON.parse(projects)
      if (Object.keys(projects).length === 0) {
        addClass(this.infoElement, "active")
      } else {
        removeClass(this.infoElement, "active")
        // 将本地读取的所有项目保存到ProjectList中
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
      // 保存项目到内存和本地
      this.projects.set(p.id, p)
      this.saveLocal()
      // 插入项目预览图到项目列表
      this.parentElement.insertAdjacentHTML("beforeend", `
        <li data-projectid="${p.id}" class="project-item">
          <img class="project-thumb" src="${p.dataURL}"> 
        </li> 
      `)
      // 高亮当前保存的项目
      var t = this.parentElement.querySelector(`li[data-projectid="${p.id}"]`)
      addClass(t, "active")
      removeClass(siblings(t), "active")
    })

    window.eventbus.on("delete_project", (p) => {
      this.projects.delete(p.id)
      this.saveLocal()
      this.parentElement.querySelector(`li[data-projectid="${p.id}"]`).remove()
    })

    delegate(this.parentElement, "click", ".project-item", (ev, el) => {
      addClass(el, "active")
      removeClass(siblings(el), "active")
      var pid = el.dataset.projectid
      var project = this.projects.get(pid)
      window.eventbus.emit("load_project", project)
    })
  }
}

new ProjectList("board_project_list")