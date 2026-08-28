# Casamento Maria e Sergio

Projeto Next.js para a pagina do casamento.

## Requisitos

- Node.js `>=20.19.0`
- pnpm `10.24.0`

Para conferir no terminal:

```bash
node -v
pnpm -v
```

Neste projeto, o gerenciador declarado em `package.json` e `pnpm@10.24.0`.

## Importante: Windows e Linux/WSL

Nao compartilhe o mesmo `node_modules` entre Windows e Linux/WSL.

Se voce instalou dependencias no Ubuntu/WSL e depois tenta rodar no Windows, o Windows pode nao encontrar comandos como `next`, porque os binarios locais podem ter sido criados para Linux. O inverso tambem pode acontecer.

Regra pratica:

- Vai rodar no Ubuntu/WSL: instale as dependencias pelo Ubuntu/WSL.
- Vai rodar no Windows nativo: apague `node_modules` e instale as dependencias pelo Windows.

## Rodar no Windows nativo

Abra `cmd.exe` ou PowerShell na pasta do projeto:

```cmd
cd /d "C:\Users\Pedro\Downloads\Monograma Maria y Sergio\Pagina Web"
```

Se o caminho real estiver com acento, use o caminho real:

```cmd
cd /d "C:\Users\Pedro\Downloads\Monograma Maria y Sergio\Página Web"
```

Limpe dependencias criadas por outro ambiente:

```cmd
rmdir /s /q node_modules
rmdir /s /q .pnpm-store
```

Ative/ajuste o pnpm, se necessario:

```cmd
corepack enable
corepack prepare pnpm@10.24.0 --activate
```

Instale:

```cmd
pnpm install --frozen-lockfile
```

Levante o servidor:

```cmd
pnpm dev
```

Abra:

```text
http://localhost:3000
```

### Se no Windows aparecer `spawn EPERM`

Este erro costuma ser bloqueio do Windows/antivirus/permissoes ao executar processos filhos do Node, nao necessariamente erro do codigo da aplicacao.

Neste ambiente foi visto em dois momentos:

- durante o postinstall de `sharp`;
- durante o `next dev`, quando Next tenta iniciar um processo filho.

Tente nesta ordem:

```cmd
rmdir /s /q node_modules
rmdir /s /q .pnpm-store
pnpm install --frozen-lockfile --ignore-scripts
pnpm dev
```

Se `pnpm dev` ainda falhar com `spawn EPERM`, use uma destas saidas:

- rode o projeto pelo Ubuntu/WSL, que e o caminho mais estavel para esta pasta;
- copie o projeto para uma pasta Windows sem sincronizacao/antivirus agressivo e reinstale as dependencias;
- reinicie o terminal como usuario normal, confira se o antivirus nao esta bloqueando `node.exe`, `pnpm` ou arquivos dentro de `node_modules`.

## Rodar no Ubuntu/WSL

Entre na pasta montada. Exemplo:

```bash
cd "/mnt/c/Users/Pedro/Downloads/Monograma Maria y Sergio/Página Web"
```

Se voce acabou de usar o projeto no Windows, limpe as dependencias do Windows antes de instalar pelo Linux:

```bash
rm -rf node_modules .pnpm-store
```

Instale:

```bash
corepack enable
corepack prepare pnpm@10.24.0 --activate
pnpm install --frozen-lockfile
```

Levante:

```bash
pnpm dev
```

Abra:

```text
http://localhost:3000
```

## Comandos uteis

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
```

O build gera imagens antes de compilar:

```bash
pnpm build
```

equivale a:

```bash
node scripts/generate-hero-images.mjs
node scripts/generate-gift-images.mjs
next build
```
