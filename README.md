# Madeireira Tora Norte — site

Landing page do Grupo Tora Norte (Igarapé e São Joaquim de Bicas/MG). HTML, CSS e JavaScript puros, sem build.

## Rodar local

```bash
npm run dev
```

Abre em http://localhost:4174.

## Publicação

Hospedado numa VPS com EasyPanel, projeto `tora_norte`, serviço `site` (`nginx:1.27-alpine`), com duas montagens (Bind Mount):

- `/srv/tora_norte/site` → `/usr/share/nginx/html` (os arquivos do site)
- `/srv/tora_norte/nginx/default.conf` → `/etc/nginx/conf.d/default.conf` (o [`deploy/nginx.conf`](deploy/nginx.conf): gzip e cache)

O CSS e o JS são servidos com cache de um ano. Por isso, **depois de mexer em `styles.css` ou `script.js`, rode `npm run versionar`**: o script troca o `?v=` no `index.html` e força os navegadores a buscar a versão nova.

Para atualizar, envie os arquivos para a pasta do site. Não precisa implantar de novo:

```bash
npm run versionar
tar -cf - index.html styles.css script.js assets/fotos assets/*.webp | ssh <usuario>@<servidor> 'tar -xf - -C /srv/tora_norte/site'
```
