if [ -z "$ENV" ]; then
	echo "cortex bundle -o ./dest/standalone.js --path http://s1.i{n}.dpfile.com/mod/"
	cortex bundle -o ./dest/standalone.js --path http://i{n}.dpfile.com/mod/
	exit 0
fi

cortex bundle --help > /dev/null
if [ "$?" = "1" ]; then
	echo "npm install cortex-bundle -g"
	npm install cortex-bundle -g
fi

echo "cortex bundle --built-root $CORTEX_DEST --prerelease $ENV -o $CORTEX_DEST/$CORTEX_PACKAGE_NAME/$CORTEX_PACKAGE_VERSION/standalone.js --path http://s1.i{n}.dpfile.com/mod/"
cortex bundle --built-root $CORTEX_DEST --prerelease $ENV -o $CORTEX_DEST/$CORTEX_PACKAGE_NAME/$CORTEX_PACKAGE_VERSION/standalone.js --path http://s1.i{n}.dpfile.com/mod/