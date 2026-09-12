# Estou chegando

Site estático de anúncio para a família, com uma surpresa, vídeo de ultrassom e áudio de batimentos.

## Executar localmente

Na pasta deste repositório, com Python 3 instalado:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Abra http://127.0.0.1:8000 no navegador. Para encerrar o servidor, pressione Ctrl+C no terminal.

Toque na **rolha da garrafa** para ouvir o destampar e ver a carta sair. Depois da animação, o ultrassom e as batidas começam em loop. O som depende da interação do usuário e das permissões de reprodução do navegador. O efeito de destampar é sintetizado com Web Audio; a trilha das batidas usa o arquivo enviado pela família. A preferência de movimento reduzido encurta a abertura.

## Estrutura

- `index.html`: conteúdo e estrutura da página.
- `style.css`: estilos, animações e layout responsivo.
- `app.js`: revelação e controles de reprodução.
- `assets/ultrassom-sem-audio.mp4`: vídeo.
- `assets/batidas.mp3`: áudio.
- `assets/glass-bottle.png`, `assets/cork.png` e `assets/message-scroll.png`: ilustrações da abertura, com laço dourado.
- `assets/open-parchment.png`: papel aberto da revelação.

Na abertura, **Ouvir o mar** ativa um ambiente de ondas sintetizado no navegador. Ele termina ao retirar a rolha. O botão permite iniciar o áudio com um gesto explícito, conforme as restrições de reprodução automática dos navegadores.

## Dependências e configuração

Não há pacotes para instalar, etapa de build, backend nem variáveis de ambiente. As fontes DM Sans e Lora são carregadas do Google Fonts; sem internet, o navegador usa as fontes alternativas definidas no CSS.

Para conferir a sintaxe do JavaScript, caso Node.js esteja instalado:

```powershell
node --check app.js
```

## Hospedagem

Sirva `index.html`, `style.css`, `app.js` e a pasta `assets/` em uma hospedagem estática, preservando os caminhos. Nenhum comando de build é necessário.
