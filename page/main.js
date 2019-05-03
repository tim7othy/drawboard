(function(){
  var drawboard = new DrawBoard("drawboard_wrapper")
  new ToolPane(drawboard)
  new ProjectList("board_project_list")
  new BoardConfig()
})()