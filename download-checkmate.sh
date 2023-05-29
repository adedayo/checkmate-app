#!/bin/bash

# Download latest checkmate binaries. Requires curl and jq to be available

binaryDir="checkmate-binary"
downloadDir="${binaryDir}/releases"
darwinDir="${binaryDir}/darwin"
linuxDir="${binaryDir}/linux"
windowsDir="${binaryDir}/windows"

# mkdir -p "${darwinDir}/plugins"
# mkdir -p "${linuxDir}/plugins"
# mkdir -p "${windowsDir}/plugins"
# mkdir -p "${downloadDir}/plugins"


mkdir -p "${darwinDir}"
mkdir -p "${linuxDir}"
mkdir -p "${windowsDir}"
mkdir -p "${downloadDir}"

# if [ ! -f "${darwinDir}/checkmate" ]; then #remove this constraint. This is only done during release
#Only do this if we don't have a darwin executable

rm -rf "${downloadDir}"
mkdir -p "${downloadDir}"

artefacts=$(curl -s https://api.github.com/repos/adedayo/checkmate/releases/latest | jq -r ".assets[].browser_download_url")


for x in $artefacts; do
  if [[ "$x" == *darwin* || "$x" == *linux_amd64* ]]; then
    # echo "$x"
    os=$(uname | tr '[:upper:]' '[:lower:]')
    xx=$(echo "$x" | tr '[:upper:]' '[:lower:]')
    if [[ "$xx" == *"$os"* ]]; then #only download for current OS

      # echo "Our OS = ${os}"
      # echo "XX = ${xx}"

      IFS='/'
      read -a xs <<<"$x"
      gzFile="${xs[${#xs[@]}-1]}"

      if [ ! -f "${downloadDir}/${gzFile}" ]; then

          pushd "${downloadDir}"
          curl -O -L "$x"
          tar xvfz "${gzFile}"
          # ls
          popd

          if [[ "$x" == *darwin* ]]; then
            mv "${downloadDir}/checkmate" "${binaryDir}/darwin/"
          fi
          if [[ "$x" == *linux* ]]; then
            mv "${downloadDir}/checkmate" "${binaryDir}/linux/"
          fi
          if [[ "$x" == *windows* ]]; then
            mv "${downloadDir}/checkmate.exe" "${binaryDir}/windows/"
          fi

      fi
    fi

    # ls -alshR "${binaryDir}"

    IFS=' '
   fi
done
# fi
