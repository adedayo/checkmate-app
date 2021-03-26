#!/bin/bash

#this will not necessarily work outside of my computer :-p, but useful for quick development iteration extending checkmate as I build this app ;-)

pushd ../../go/src/github.com/adedayo/checkmate

goreleaser build --config .goreleaser-mac.yml --rm-dist --snapshot

popd

cp ../../go/src/github.com/adedayo/checkmate/dist/checkmate_darwin_amd64/checkmate checkmate-binary/darwin
