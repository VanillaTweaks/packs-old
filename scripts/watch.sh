rm -rf dist/*
npx babel lib --out-dir dist/lib --extensions .js,.ts --keep-file-extension --copy-files --source-maps --watch &
npx babel datapacks --out-dir dist/datapacks --extensions .js,.ts --keep-file-extension --copy-files --source-maps --watch &
(sleep 3s; npx sand watch dist/$1) &
wait