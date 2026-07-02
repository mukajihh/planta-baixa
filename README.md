# Planta Baixa

Ferramenta web interativa para desenhar e organizar a planta baixa de um espaço. Permite montar o layout dos ambientes diretamente no navegador, sem necessidade de instalar nenhum programa. Ao abrir, o projeto já vem com um exemplo de layout preenchido, que pode ser totalmente renomeado, movido e redimensionado conforme a sua necessidade.

## Acesse online

**https://mukajihh.github.io/planta-baixa/**

## Funcionalidades

- Definir as dimensões do galpão (largura × comprimento em metros)
- Adicionar, renomear, colorir, mover e redimensionar ambientes (arrastando com o mouse ou toque)
- Girar ambientes em 90°
- Grade de referência com encaixe automático (snap) em incrementos de 0,5 m
- Cálculo automático de área do galpão, área ocupada e área livre/circulação
- Legenda com a lista de ambientes cadastrados
- Exportar a planta como imagem **PNG**
- Salvar o projeto em um arquivo **JSON** e reabri-lo depois para continuar editando
- Layout responsivo, com painel lateral colapsável em telas menores

## Como usar

1. Abra o link de acesso acima.
2. Ajuste as dimensões do galpão no topo da tela.
3. Toque em um ambiente para editar nome, cor e medidas no painel lateral.
4. Arraste o ambiente para movê-lo e use a alça no canto inferior direito para redimensionar.
5. Use **Salvar** para baixar o arquivo `.json` do projeto e **Abrir** para carregar um projeto salvo anteriormente.
6. Use **PNG** para exportar a planta finalizada como imagem.

O arquivo é 100% estático (HTML/CSS/JavaScript), hospedado via GitHub Pages a partir do arquivo [`index.html`](index.html) na raiz deste repositório.
