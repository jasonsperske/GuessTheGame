const StaticServer = require('static-server')
const server = new StaticServer({
  rootPath: './rootPath',
  port: 9000,
  cors: '*',
  templates: {
    index: 'index.html'
  }
})

server.start(() => {
  console.log('Server listening to 127.0.0.1:', server.port)
})
