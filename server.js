// server.js - Versão Otimizada para Hospedagem no Render

const jsonServer = require('json-server');
const express = require('express'); // Necessário para servir arquivos estáticos
const server = jsonServer.create();
const router = jsonServer.router('./db/db.json');

// --- 1. Configuração de Middlewares e CORS ---
// O jsonServer.defaults() inclui o Body Parser e o Logger.
// noCors: false permite que o frontend em um subdomínio diferente acesse a API.
const middlewares = jsonServer.defaults({ noCors: false }); 
server.use(middlewares);

// --- 2. Servir Arquivos Estáticos ---
// Usa o Express para servir todo o conteúdo da pasta './public'
// Seus arquivos HTML, CSS e JS devem estar aqui.
server.use(express.static('./public'));

// --- 3. Configuração do Roteamento (API) ---
// Opcional: Garante que as requisições que não forem API (ex: '/' ou '/sobre') 
// sejam servidas pelo index.html (útil para Single Page Applications - SPAs)
// server.use(jsonServer.rewriter({
//   "/": "/index.html" 
// }));

server.use(router); // O roteador deve ser o último middleware a ser usado

// --- 4. Inicialização do Servidor ---
// Usa a porta fornecida pelo ambiente (Render) ou 3000 localmente.
const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log(`JSON Server rodando na porta ${port}`);
});