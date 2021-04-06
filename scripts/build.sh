rm -r out/*
npx babel modules --out-dir out/modules --extensions .js,.ts --keep-file-extension --copy-files --source-maps &
npx babel datapacks --out-dir out/datapacks --extensions .js,.ts --keep-file-extension --copy-files --source-maps &
wait
npx sand build out/$1