#!/bin/sh
cd dist/release
rm LICENSE
rm Renderer.js.LICENSE.txt
zip -r pack.zip *
mv pack.zip ../../
cd ../..
