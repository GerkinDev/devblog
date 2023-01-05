$cachePath = Join-Path $PSScriptRoot ".cache"
if(!(Test-Path -Path $cachePath)){
  New-Item -ItemType Directory $cachePath
}

iex @"
docker run --rm -it ``
  -v $($PSScriptRoot):/src ``
  -v $($cachePath):/tmp ``
  -p "1313:1313" ``
  --name hugo-devblog ``
  "klakegg/hugo:ext-alpine" ``
  server -DEF --disableFastRender
"@
