var Task = QStrike.make('Task', { obs: ['done', 'title'] }
            , { close: QStrike.Closable('tasks') })
  , TaskDefaults = { title: "", done: false }
  , TaskList = QStrike.compose(Task
            , 'TaskList'
            , { subob: ['tasks'] }
            , { addTaskList: QStrike.CreateType('TaskList', 'tasks', TaskDefaults)
              , addTask: QStrike.CreateType('Task', 'tasks', TaskDefaults)
              })

QStrike.start({ appName: 'inventory-measure-727'
              , token: 'b7830f312bb64f2db14c349717fe3fa5'
              , bucket: 'todo'
              , defaultType: 'TaskList'
              , defaultValues: TaskDefaults })
