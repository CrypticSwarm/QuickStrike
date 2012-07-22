Quick-Strike
============

Quick Strike provides connections to Knockout to real time backends.  Currently implemented backends are Simperium and ShareJS.

## Rational

Realtime backends allow data to be synced up between many clients.  Often a lot of code is sacrifised to wiring up events to html changes and vice versa. Quick Strike takes a declarative approach.  You declare what data you want to be synced up and it wires up the events from the backend to knockout to form a bidirectional pipeline from a local users view directly to remote users views.

## API

### make

`QStrike.make` takes three parameters.

1. *name* (string) - The name of the data you are describing.
1. *props* (object) - Properties it has included.
1. *methods* (object) - Any functionality that should be included.

The props objects declares a list of types that the data will be.
The keys are the types then an array of data member names.
Currently there are two varieties.

1. obs - data that will be attached as a regular KO Observable.
1. subob - Allows data of different types to be injected (other view models created via `QStrike.make` or `QStrike.compose`). This data hold an array of child view models. 

The method object get attached as view model methods. These methods are used through the interface.
There are some prebuilt functions that can be included.
See prebuilt section for a list of what they do.

#### Example

```javascript
var Task = QStrike.make('Task', { props: ['completed'], text: ['name'] }
            , { close: QStrike.Closable('tasks') })
```

### compose

`QStrike.compose` is a way for items to be similar to one another but also add extra functionality.

This takes four parameters.

1. *base* (object) - This should be something that was previuosly made with `QStrike.make` or `QStrike.compose`
1. *name* (string) - The name of the data you are describing.
1. *props* (object) - Properties it has included.
1. *methods* (object) - Any functionality that should be included.

#### Example

Extending the previous example.

```javascript
var TaskDefaults = function (id, type) {
      return { name: "", completed: false }
    }
  , TaskList = QStrike.compose(Task
    , 'TaskList'
    , { subob: ['tasks'] }
    , { addTaskList: QStrike.CreateType('TaskList', 'tasks', TaskDefaults)
      , addTask: QStrike.CreateType('Task', 'tasks', TaskDefaults)
      })
```

### createType

`createType` creates a view model method that instantiates a sub view model of the specified type and inserts it into the specified property.

* *type* (string) - name of the type of view model that will be created.
* *prop* (string) - name of the location that the object should be injected into. This should match up with a name of a property listed as 'subob'
* *defaults* (function) - Function that will give the default values for the observables for that type.

### closable

`closable` acts as the opposite of createType.  It removes the current object from its parent viewmodel located in the specifed property.

* *prop* (string) - name of the property that it is located at in the parent viewmodel.

### start

`start` starts the realtime system. Credentials are passed to the start method to communicate with the backend.

* *init* (object) - an object that has required credentials and options.

* `init.defaultType` - The name of a view model type created by `make` or `compose`.
* `init.defaultValue` - The default values for the observables for that type.

If the bucket is empty then an viewmodel with type of `defaultType` is created and initialzed with `defaultValue` values.


#### Simperium

Simperium specific options include: `appName`, `token`, `bucket`.

#### Example

QStrike.start({ appName: '[appName]'
              , token: '[token]'
              , bucket: 'todo'
              , defaultType: 'TaskList'
              , defaultValues: TaskDefaults })
