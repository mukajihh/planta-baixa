# Planta Baixa

Ferramenta web interativa para desenhar e organizar a planta baixa de um espaço. Permite montar o layout dos ambientes diretamente no navegador, sem necessidade de instalar nenhum programa. Ao abrir, o projeto busca automaticamente algum layout salvo anteriormente no navegador; se não encontrar nenhum, carrega um exemplo de layout preenchido, que pode ser totalmente renomeado, movido e redimensionado conforme a sua necessidade.

## Acesse online

**https://mukajihh.github.io/planta-baixa/**

## Funcionalidades

- Definir as dimensões do galpão (largura × comprimento em metros)
- Adicionar, renomear, colorir, mover e redimensionar ambientes (arrastando com o mouse ou toque)
- Girar ambientes em 90°
- Copiar (Ctrl+C) e colar (Ctrl+V) um ambiente, criando uma cópia com o mesmo tamanho no canto superior esquerdo da grade e o nome "&lt;nome&gt; - cópia"
- Grade de referência com encaixe automático (snap) em incrementos de 0,5 m
- Zoom (roda do mouse ou botões +/−) e mover a visualização (arrastar o fundo da grade), com botão para redefinir
- Cálculo automático de área do galpão, área ocupada e área livre/circulação
- Legenda com a lista de ambientes cadastrados
- Exportar a planta como imagem **PNG**
- Salvar o projeto no navegador (`localStorage`), com carregamento automático desses dados sempre que a página é aberta
- Salvamento automático das alterações a cada 2 minutos, sem precisar clicar em nada
- Baixar o projeto em um arquivo **JSON** e reabri-lo depois (em qualquer navegador/dispositivo) para continuar editando
- Limpar os dados salvos no navegador e restaurar o exemplo padrão
- Desfazer (Ctrl+Z / Cmd+Z) as últimas 5 alterações — mover, redimensionar, renomear, recolorir, adicionar/excluir ambientes, mudar as dimensões do galpão, abrir um arquivo ou limpar os dados
- Layout responsivo, com painel lateral colapsável em telas menores

## Como usar

1. Abra o link de acesso acima.
2. Ajuste as dimensões do galpão no topo da tela.
3. Toque em um ambiente para editar nome, cor e medidas no painel lateral.
4. Arraste o ambiente para movê-lo e use a alça no canto inferior direito para redimensionar.
5. Use a roda do mouse (ou os botões **+**/**−** no canto inferior direito da grade) para dar zoom, e arraste o fundo da grade para mover a visualização. Clique no percentual para redefinir o zoom e a posição.
6. Com um ambiente selecionado, use **Copiar** (Ctrl+C) e depois **Colar** (Ctrl+V) para duplicá-lo — a cópia mantém o tamanho original e sempre aparece no canto superior esquerdo da grade.
7. Use **Salvar** para gravar o projeto no navegador (isso também acontece automaticamente a cada 2 minutos). Ao reabrir a página, o último projeto salvo é carregado automaticamente.
8. Use **Baixar** para exportar o arquivo `.json` do projeto e **Abrir** para carregar um projeto salvo anteriormente a partir de um arquivo.
9. Use **PNG** para exportar a planta finalizada como imagem.
10. Use **Limpar** para apagar os dados salvos no navegador e voltar ao exemplo padrão (pede confirmação antes de aplicar).
11. Errou algo? Pressione **Ctrl+Z** (ou **Cmd+Z** no Mac) para desfazer — funciona para as últimas 5 alterações feitas na sessão.

Como o salvamento no navegador usa `localStorage`, os dados ficam disponíveis apenas naquele navegador/dispositivo — use **Baixar** para criar um backup do projeto ou para transferi-lo para outro computador.

O projeto é 100% estático, hospedado via GitHub Pages a partir da raiz deste repositório: [`index.html`](index.html) (estrutura), [`styles.css`](styles.css) (estilos) e [`app.js`](app.js) (lógica).
