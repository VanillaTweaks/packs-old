rm -r out/*
npx babel lib --out-dir out/lib --extensions .js,.ts --keep-file-extension --copy-files --source-maps --watch &
npx babel datapacks --out-dir out/datapacks --extensions .js,.ts --keep-file-extension --copy-files --source-maps --watch &
(sleep 3s; npx sand watch out/$1) &
wait