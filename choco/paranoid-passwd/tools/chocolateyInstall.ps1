$ErrorActionPreference = 'Stop'
$packageName  = 'paranoid-passwd'
$toolsDir     = "$(Split-Path -parent $MyInvocation.MyCommand.Definition)"
$url64        = 'https://github.com/jbcom/paranoid-passwd/releases/download/paranoid-passwd-v3.7.0/paranoid-passwd-3.7.0-windows-amd64.zip'
$checksum64   = 'fae9ae7906ab4b6e33c03c5cb93686f9d1b3a673e9085e3274ea296ac80d2298'

$packageArgs = @{
  packageName   = $packageName
  unzipLocation = $toolsDir
  url64bit      = $url64
  checksum64    = $checksum64
  checksumType64= 'sha256'
}

Install-ChocolateyZipPackage @packageArgs
