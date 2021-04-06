rm -r out/*
npx babel modules --out-dir out/modules --extensions .js,.ts --keep-file-extension --copy-files --source-maps --watch &
npx babel datapacks --out-dir out/datapacks --extensions .js,.ts --keep-file-extension --copy-files --source-maps --watch &
npx sand watch out/$1 &
wait