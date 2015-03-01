if [ -z "$ENV" ]; then
	echo "ENV not export, just exit."
	exit 0
fi

cortex bundle --help > /dev/null
if [ "$?" = "1" ]; then
	echo "npm install cortex-bundle -g"
	npm install cortex-bundle -g
fi
cortex bundle -o $CORTEX_DEST/$CORTEX_PACKAGE_NAME/$CORTEX_PACKAGE_VERSION/standalone.js
