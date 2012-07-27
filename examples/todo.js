var Task = QStrike.make('Task', { sync: { done: false, title: "" } }
              , { close: QStrike.Closable })
var TaskList = QStrike.compose(Task, 'TaskList', { subob: ['tasks'] }
              , { addTaskList: QStrike.CreateType('TaskList', 'tasks')
                , addTask: QStrike.CreateType('Task', 'tasks') })

QStrike.start({ appName: 'inventory-measure-727'
              , token: 'b7830f312bb64f2db14c349717fe3fa5'
              , bucket: 'todo'
              , defaultType: 'TaskList' })
