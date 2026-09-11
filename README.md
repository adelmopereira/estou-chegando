# Estou chegando

Site estático de anúncio para a família, com uma surpresa, vídeo de ultrassom e áudio de batimentos.

## Executar localmente

Na pasta deste repositório, com Python 3 instalado:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Abra http://127.0.0.1:8000 no navegador. Para encerrar o servidor, pressione Ctrl+C no terminal.

Clique em **Descobrir a surpresa** para iniciar o vídeo e o áudio. O som depende da interação do usuário e das permissões de reprodução do navegador.

## Estrutura

- `index.html`: conteúdo e estrutura da página.
- `style.css`: estilos, animações e layout responsivo.
- `app.js`: revelação e controles de reprodução.
- `assets/ultrassom-sem-audio.mp4`: vídeo.
- `assets/batidas.mp3`: áudio.

## Dependências e configuração

Não há pacotes para instalar, etapa de build, backend nem variáveis de ambiente. As fontes DM Sans e Lora são carregadas do Google Fonts; sem internet, o navegador usa as fontes alternativas definidas no CSS.

Para conferir a sintaxe do JavaScript, caso Node.js esteja instalado:

```powershell
node --check app.js
```

## Hospedagem

Sirva `index.html`, `style.css`, `app.js` e a pasta `assets/` em uma hospedagem estática, preservando os caminhos. Nenhum comando de build é necessário.
