#Start-Process -NoNewWindow docker-volume-watcher

# --mount type=bind,src="$((pwd).Path)\",dst=/src `
docker run --rm -it `
  -v "${PWD}:/src" `
  -p 1313:1313 `
  --name hugo-devblog `
  klakegg/hugo:ext-alpine `
  server -DEF --disableFastRender