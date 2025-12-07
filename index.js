// server.js (Corrigido para Render)

const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('./db/db.json')
  
// Para permitir que os dados sejam alterados, altere a linha abaixo
// colocando o atributo readOnly como false.
// Manter noCors: true garante que o JSON Server não bloqueie requisições.
const middlewares = jsonServer.defaults({ noCors: true }) 
server.use(middlewares)
server.use(router)

// Define a porta usando a variável de ambiente PORT (fornecida pelo Render),
// ou usa a porta 3000 como um fallback para testes locais.
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`JSON Server is running na porta ${port}`)
})