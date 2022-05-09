#!/bin/bash

#this will not necessarily work outside of my computer :-p, but useful for quick development iteration extending checkmate as I build this app ;-)

pushd ../checkmate

goreleaser build --config .goreleaser-mac.yml --rm-dist --snapshot

popd

cp ../checkmate/dist/checkmate_darwin_amd64_v1/checkmate checkmate-binary/darwin
