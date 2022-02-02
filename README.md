# screen share app

[xiaohai-huang.net](https://xiaohai-huang.net)

## build

```bash
docker build -t xiaohaihuang/screen-share .
```

## run

```bash
docker run --name screen-share-app -p 8080:3000 -it --rm xiaohaihuang/screen-share
```
