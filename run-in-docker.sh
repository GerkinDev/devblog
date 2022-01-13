docker run --rm -it \
  -v $(pwd):/src \
  -p 1313:1313 \
  --name hugo-devblog \
  klakegg/hugo:ext-alpine \
  server -DEF --disableFastRender