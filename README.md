# Madeireira Tora Norte — site

Landing page do Grupo Tora Norte (Igarapé e São Joaquim de Bicas/MG). HTML, CSS e JavaScript puros, sem build.

## Rodar local

```bash
npm run dev
```

Abre em http://localhost:4174.

## Publicação

Hospedado na VPS Hostinger (EasyPanel), projeto `tora_norte`, serviço `site`, com o nginx servindo a pasta `/srv/tora_norte/site`, montada por Bind Mount.

Para atualizar, envie os arquivos para essa pasta. Não precisa implantar de novo:

```bash
tar -cf - index.html styles.css script.js assets/fotos assets/*.webp | ssh root@srv1510217.hstgr.cloud 'tar -xf - -C /srv/tora_norte/site'
```
