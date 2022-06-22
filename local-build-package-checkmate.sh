#!/bin/bash

#this will not necessarily work outside of my computer :-p, but useful for quick development iteration extending checkmate as I build this app ;-)

pushd ../checkmate

goreleaser build --config .goreleaser-mac.yml --rm-dist --snapshot

popd

cp ../checkmate/dist/checkmate_darwin_amd64_v1/checkmate checkmate-binary/darwin


#build and copy plugins
# pushd ../
# ./build_plugins.sh
# popd
# mkdir -p checkmate-binary/darwin/plugins
# cp ../plugins/dist/* checkmate-binary/darwin/plugins
# mkdir -p plugins
# cp ../plugins/dist/* plugins
