if [[ $ENV != 'product' ]];then
  PRERELEASE="--prerelease $ENV"
else
  PRERELEASE=""
fi

cortex bundle --help > /dev/null
if [ "$?" = "1" ]; then
	echo "npm install cortex-bundle -g"
	npm install cortex-bundle -g
fi

if [ -z "$ENV" ]; then
	echo "cortex bundle -o ./demo/standalone.js --path http://s1.i{n}.dpfile.com/mod/"
	cortex bundle -o ./demo/standalone.js --path http://i{n}.dpfile.com/mod/
	exit 0
fi

echo "cortex bundle --built-root $CORTEX_DEST $PRERELEASE -o $CORTEX_DEST/$CORTEX_PACKAGE_NAME/$CORTEX_PACKAGE_VERSION/standalone.js --path http://s1.i{n}.dpfile.com/mod/"
cortex bundle --built-root $CORTEX_DEST $PRERELEASE -o $CORTEX_DEST/$CORTEX_PACKAGE_NAME/$CORTEX_PACKAGE_VERSION/standalone.js --path http://s1.i{n}.dpfile.com/mod/