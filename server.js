var connect = require('connect')
connect.createServer(connect.static(__dirname, { maxAge: 86400000 })).listen(10291)
