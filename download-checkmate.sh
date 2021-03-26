#!/bin/bash

# Download latest checkmate binaries. Requires curl and jq to be available

binaryDir="checkmate-binary"
downloadDir="${binaryDir}/releases"
darwinDir="${binaryDir}/darwin"
linuxDir="${binaryDir}/linux"
windowsDir="${binaryDir}/windows"
mkdir -p "${darwinDir}"
mkdir -p "${linuxDir}"
mkdir -p "${windowsDir}"
mkdir -p "${downloadDir}"

if [ ! -f "${darwinDir}/checkmate" ]; then
#Only do this if we don't have a darwin executable

artefacts=$(curl -s https://api.github.com/repos/adedayo/checkmate/releases/latest | jq -r ".assets[].browser_download_url")


for x in $artefacts; do
  if [[ "$x" == *x86_64* ]]; then
    echo "$x"

    IFS='/'
    read -a xs <<<"$x"
    gzFile="${xs[${#xs[@]}-1]}"

    if [ ! -f "${downloadDir}/${gzFile}" ]; then
      pushd "${downloadDir}"
      curl -O -L "$x"
      tar xvfz "${gzFile}"
      popd

      if [[ "$x" == *Darwin* ]]; then
        mv "${downloadDir}/checkmate" "${binaryDir}/darwin/"
      fi
      if [[ "$x" == *linux* ]]; then
        mv "${downloadDir}/checkmate" "${binaryDir}/linux/"
      fi
      if [[ "$x" == *windows* ]]; then
        mv "${downloadDir}/checkmate.exe" "${binaryDir}/windows/"
      fi
    fi
    IFS=' '
  fi
done
fi
