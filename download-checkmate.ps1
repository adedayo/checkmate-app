$Response = Invoke-WebRequest -UseBasicParsing -Uri https://api.github.com/repos/adedayo/checkmate/releases/latest

$artefacts = $Response.Content | jq -r ".assets[].browser_download_url"

$artefacts | ForEach-Object -Process {
  if ($_ -like '*windows*') {
     Remove-Item "checkmate-binary" -Filter * -Recurse -ErrorAction Ignore
     New-Item -ItemType Directory -Path "checkmate-binary\windows"
     Invoke-WebRequest -Uri $_ -OutFile "checkmate.tar.gz" -ErrorAction SilentlyContinue
     tar -xvzf ".\checkmate.tar.gz"
     Move-Item -Path .\checkmate.exe -Destination .\checkmate-binary\windows
  }

}

