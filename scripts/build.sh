rm -rf dist/*
npx babel lib --out-dir dist/lib --extensions .js,.ts --keep-file-extension --copy-files --source-maps &
npx babel datapacks --out-dir dist/datapacks --extensions .js,.ts --keep-file-extension --copy-files --source-maps &
wait
npx sand build dist/$1