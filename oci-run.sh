! [ -d $(pwd)/.cache ] && mkdir $(pwd)/.cache
$(
  ( which podman &> /dev/null && echo 'podman' ) ||
  ( which docker &> /dev/null && echo 'docker' ) ||
  ( >&2 echo 'Missing podman or docker' && exit 1 )
) run --rm -it \
  -v $(pwd):/src \
  -v $(pwd)/.cache:/tmp \
  -p 1313:1313 \
  --name hugo-devblog \
  klakegg/hugo:ext-alpine \
  server -DEF --disableFastRender