# BH Places Discovery - HTML/CSS/JS

Site de descoberta de lugares em Belo Horizonte desenvolvido com HTML, CSS e JavaScript puro.

## 📋 Características

- **HTML puro** - Sem frameworks ou bibliotecas complexas
- **CSS responsivo** - Design adaptável para desktop e mobile
- **JavaScript vanilla** - Sem dependências externas
- **JSON como banco de dados** - Dados armazenados em arquivo JSON
- **LocalStorage** - Sistema de favoritos persistente
- **Mapa interativo** - Integração com Leaflet/OpenStreetMap

## 🚀 Funcionalidades

### Página Principal (index.html)
- Listagem de lugares em destaque
- Sistema de busca em tempo real
- Filtros por categoria (Cafés, Dates, Turma, Amigos)
- Sistema de favoritos com persistência
- Cards informativos com imagens, avaliações e descrições

### Página de Detalhes (details.html)
- Informações completas do local
- Mapa interativo com marcador
- Avaliações e votos
- Botões de compartilhamento
- Sugestões de locais similares

## 📁 Estrutura de Arquivos

```
bh_places_html/
├── index.html          # Página principal
├── details.html        # Página de detalhes
├── styles.css          # Estilos CSS
├── app.js              # JavaScript da página principal
├── details.js          # JavaScript da página de detalhes
├── lugares.json        # Banco de dados JSON
└── README.md           # Este arquivo
```

## 🎨 Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **CSS3** - Estilização moderna com variáveis CSS, Grid e Flexbox
- **JavaScript ES6+** - Lógica de negócio e interatividade
- **Font Awesome 6.4.0** - Ícones
- **Leaflet 1.9.4** - Mapas interativos
- **OpenStreetMap** - Dados de mapas

## 🔧 Como Usar

### Opção 1: Servidor HTTP Python
```bash
cd bh_places_html
python3 -m http.server 8080
```
Acesse: http://localhost:8080

### Opção 2: Servidor HTTP Node.js
```bash
cd bh_places_html
npx http-server -p 8080
```
Acesse: http://localhost:8080

### Opção 3: Live Server (VS Code)
1. Instale a extensão "Live Server" no VS Code
2. Clique com o botão direito em `index.html`
3. Selecione "Open with Live Server"

## 📊 Estrutura do JSON

O arquivo `lugares.json` contém um array de objetos com a seguinte estrutura:

```json
{
  "lugares": [
    {
      "id": 1,
      "nome": "Nome do Local",
      "categoria": "Cafés",
      "endereco": "Endereço completo",
      "descricao": "Descrição detalhada",
      "imagem": "URL da imagem",
      "latitude": -19.9191,
      "longitude": -43.9386,
      "destaque": true,
      "avaliacao": 4.8,
      "votos": 245
    }
  ]
}
```

## ✨ Funcionalidades Implementadas

### Sistema de Busca
- Busca em tempo real por nome, categoria ou localização
- Filtro por categoria com tabs
- Resultados dinâmicos

### Sistema de Favoritos
- Adicionar/remover favoritos com um clique
- Persistência usando LocalStorage
- Seção dedicada para favoritos
- Ordenação: favoritos aparecem primeiro

### Navegação
- Navegação entre páginas
- Parâmetros de URL para detalhes
- Botão voltar funcional

### Responsividade
- Layout adaptável para diferentes tamanhos de tela
- Grid responsivo
- Menu mobile-friendly

## 🎯 Melhorias Futuras

- [ ] Sistema de avaliações funcional
- [ ] Filtros avançados (distância, avaliação)
- [ ] Modo escuro/claro
- [ ] Compartilhamento em redes sociais
- [ ] Comentários e reviews
- [ ] Integração com APIs de mapas
- [ ] PWA (Progressive Web App)

## 📝 Notas

- O site foi desenvolvido para funcionar sem necessidade de backend
- Todos os dados são estáticos e armazenados no arquivo JSON
- Os favoritos são salvos apenas no navegador do usuário
- Para adicionar novos lugares, edite o arquivo `lugares.json`

## 🌐 Compatibilidade

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 Licença

Projeto desenvolvido para fins educacionais.
