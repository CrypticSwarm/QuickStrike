QStrike = (function () {
  var QStrike = {}
  QStrike.Widgets = {}
  var ns = QStrike.Widgets
  var bucket
  vms = {}
  var defaultType
  var defaultValues

  QStrike.generateId = function generateId() {
    var ret = ''
    , vals = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f']
    , i
    for (i = 0; i < 10; ++i) ret += vals[Math.floor(Math.random() * 16)]
    return ret
  }

  function getDefaults(id, type) {
    var obj = {}
    obj.id = id
    obj.type = type
    return obj
  }

  QStrike.CreateType = function CreateType(type, propName) {
    return function create() {
      var id = QStrike.generateId()
        , obj = getDefaults(id, type)
      obj.parent = this.id
      obj.parentProp = propName
      vm = new ns[type](obj, true)
      vms[id] = vm
      vms[id].update()
    }
  }


  // Use a prebuilt event emitter
  // Basic Eventemitter
  function EEOnce() {
    this.events = {}
  }
  EEOnce.prototype = {
    on: function on(name, fn) {
      if (!Array.isArray(this.events[name])) this.events[name] = []
      this.events[name].push(fn)
    },
    emit: function emit(name, params) {
      var fns = this.events[name]
      if (!Array.isArray(fns)) return
      fns.forEach(function (fn) {
        fn.apply(null, params || [])
      })
      delete this.events[name]
    }
  }
  var createEE = new EEOnce()


  QStrike.CreateIncoming = function CreateIncoming(info) {
    var vm = new ns[info.type](info)
    return vm
  }

  QStrike.Closable = function () {
    if (this.parent() == null) return
    this.parent(null)
    // May want to clear out this object from the bucket?
  }

  function makeQStrike(name, props, methods) {
    methods = methods || {}
    var noupdate = false
    var obsKeys = []
    if (props.sync != null) {
      for (var key in props.sync) {
        obsKeys.push(key)
      }
    }
    function makeType(info, useDefaults) {
      var vm = this
      var parent = info.parent
      vm.type = name
      vm.id = info.id
      vm.local = local
      vm.update = update
      vm.notify = notify
      vm.parent = ko.observable(parent)
      vm.parentProp = info.parentProp
      vm.parent.subscribe(propagateUpdate)

      vm.parent.subscribe(function clearParent(newVal) {
        if (parent === newVal) return
        var parentVM = vms[parent]
        if (parentVM) {
          var index = parentVM[vm.parentProp].indexOf(vm)
          parentVM[vm.parentProp].splice(index, 1)
        }
      })
      obsKeys.forEach(function (name) {
        vm[name] = useDefaults ? ko.observable(props.sync[name])
                 : ko.observable(info[name])
        vm[name].subscribe(propagateUpdate)
      })
      if (props.subob != null) props.subob.forEach(function (name) {
        vm[name] = ko.observableArray()
      })
      if (vm.parent()) {
        ;(function parentVM() {
          var parentVM = vms[vm.parent()]
          if (parentVM) parentVM[vm.parentProp].push(vm)
          else createEE.on(vm.parent(), function (parentVM) {
            parentVM[vm.parentProp].push(vm)
          })
        })()
      }
      function propagateUpdate(newVal) {
        if (noupdate) return
        vm.update()
      }
    }

    function update() {
      bucket.update(this.id)
    }

    function local() {
      var vm = this
      var ret = { type: vm.type, id: vm.id, parentProp: vm.parentProp, parent: vm.parent() }
      obsKeys.forEach(function (name) {
        ret[name] = vm[name]()
      })
      return ret
    }

    function notify(obj) {
      var vm = this
      noupdate = true
      vm.parent(obj.parent)
      obsKeys.forEach(function (name) {
        vm[name](obj[name])
      })
      noupdate = false
    }
    makeType.prototype = methods
    makeType.props = props
    QStrike.Widgets[name] = makeType
    return makeType
  }

  function shallowMerge(base) {
    var others = Array.prototype.slice.call(arguments, 1)
    others.forEach(function (other) {
      Object.keys(other).forEach(function (key) {
        base[key] = other[key]
      })
    })
    return base
  }

  function composeQStrike(base, name, props, methods) {
    var p = shallowMerge({}, base.props, props)
      , m = shallowMerge({}, base.prototype, methods)
    return makeQStrike(name, p, m)
  }


  QStrike.compose = composeQStrike
  QStrike.make = makeQStrike

  function setupKOBindings() {
    var widCache = {}
      , widgets = document.getElementById('widgets')

    if (widgets) {
      widgets.parentNode.removeChild(widgets)
      Array.prototype.forEach.call(widgets.childNodes, function (elem) {
        widCache[elem.className] = elem
      })
    }
    ko.bindingHandlers.dispatch = {
      init: function dispatchOnType(elem, valF, notUsed, vm) {
        var type = ko.utils.unwrapObservable(valF())
        if (widCache[type]) {
          elem.appendChild(widCache[type].cloneNode(true))
        }
      }
    }
    ko.bindingHandlers.stream = {
      init: function streamText(elem, valF, notUsed, vm) {
        elem.addEventListener('keyup', function () {
          var prop = ko.utils.unwrapObservable(valF())
          vm[prop](elem.value)
        })
      }
    }
  }

  function ready() {
    if (vms.toplevel == null) {
      vms.toplevel = new ns[defaultType](getDefaults('toplevel', defaultType))
      vms.toplevel.update()
    }
    defaultType = null
    defaultValues = null
    ko.applyBindings(vms.toplevel)
  }

  function local(id) {
    return vms[id] != null ? vms[id].local()
         : {}
  }

  function notify(id, data) {
    if (vms[id] != null) {
      return vms[id].notify(data)
    }
    vms[id] = QStrike.CreateIncoming(data)
    createEE.emit(id, [vms[id]])
  }

  QStrike.start = function (opts) {
    var simperium = new Simperium(opts.appName, {token: opts.token});
    var b = simperium.bucket(opts.bucket);
    bucket = b
    defaultType = opts.defaultType
    defaultValues = opts.defaultValues
    bucket.on('notify', notify)
    bucket.on('local', local)
    bucket.on('ready', ready)
    window.onload = function () {
      setupKOBindings()
      //right now always use same bucket.
      bucket.start()
    }
  }
  return QStrike

}())
