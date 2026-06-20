# Service Desk Acadêmico

Aplicativo web estático feito em HTML, CSS e JavaScript para demonstrar versionamento de código em aula.

## Como abrir sem servidor

Este projeto não precisa de servidor local, Node.js, Python ou instalação de dependências.

Opção mais simples:

1. Dê dois cliques no arquivo `abrir-service-desk.bat`.
2. O navegador padrão abrirá o arquivo `index.html`.

Também é possível abrir diretamente o arquivo `index.html` com dois cliques.

## Funcionalidades

- Tela do usuário para abrir chamados.
- Painel do analista para selecionar chamados.
- Alteração de status.
- Alteração de prioridade.
- Registro de correção.
- Histórico dos chamados.
- Persistência simples usando `localStorage`.

## Arquivos principais

- `index.html`: estrutura das telas.
- `styles.css`: aparência do aplicativo.
- `app.js`: regras de interação e persistência local.
- `abrir-service-desk.bat`: atalho para abrir o app no navegador sem subir servidor.

## Bugs corrigidos

1. A geração de ID não cria mais chamados com `#-Infinity` quando a base local está vazia ou possui IDs inválidos.
2. A busca do painel do analista agora localiza chamados por ID, título, solicitante, e-mail e datas.
3. As alterações de status, prioridade e correção agora são persistidas no `localStorage`.
4. O botão "Limpar base local" limpa a lista de chamados e exibe uma mensagem compatível com a ação.
5. O histórico geral exibe os eventos registrados em cada chamado, não apenas o estado atual.
6. O formulário impede a criação de chamados com campos obrigatórios preenchidos apenas com espaços.
7. O painel de detalhes acompanha o chamado visível na busca, evitando mostrar detalhes de um item fora do filtro.
8. O histórico mostra uma mensagem amigável quando não há chamados registrados.
9. Dados antigos ou inválidos no `localStorage` são normalizados ao carregar o aplicativo.
10. Erro ortográfico corrigido: "Correcao" → "Correção" nas mensagens de histórico de eventos.
11. Layout da tabela de histórico melhorado: removida estrutura `<ul>` inválida dentro de `<td>` e substituída por `<div>` para melhor visualização.
12. Exibição de eventos do histórico normalizada com renderização adequada em tabela HTML semântica.

## Sugestão didática

Crie um commit inicial com esta versão, depois peça para os alunos corrigirem um bug por commit. Assim eles conseguem praticar mensagens de commit, comparação de versões, histórico e reversão de mudanças.
