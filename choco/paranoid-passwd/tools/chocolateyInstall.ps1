$ErrorActionPreference = 'Stop'
$packageName  = 'paranoid-passwd'
$toolsDir     = "$(Split-Path -parent $MyInvocation.MyCommand.Definition)"
$url64        = 'https://github.com/jbcom/paranoid-passwd/releases/download/paranoid-passwd-v3.5.2/paranoid-passwd-3.5.2-windows-amd64.zip'
$checksum64   = '44940bd8a88801e07b21dfa30588ea36937e45fc40bf6c48c5271e84784c54a7'

$packageArgs = @{
  packageName   = $packageName
  unzipLocation = $toolsDir
  url64bit      = $url64
  checksum64    = $checksum64
  checksumType64= 'sha256'
}

Install-ChocolateyZipPackage @packageArgs
