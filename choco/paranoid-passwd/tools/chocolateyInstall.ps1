$ErrorActionPreference = 'Stop'
$packageName  = 'paranoid-passwd'
$toolsDir     = "$(Split-Path -parent $MyInvocation.MyCommand.Definition)"
$url64        = 'https://github.com/jbcom/paranoid-passwd/releases/download/paranoid-passwd-v3.6.5/paranoid-passwd-3.6.5-windows-amd64.zip'
$checksum64   = 'a585b2660d0e09b9edb4a8de27a3021b663b49e9e0717b90f56996d9df3b4d0d'

$packageArgs = @{
  packageName   = $packageName
  unzipLocation = $toolsDir
  url64bit      = $url64
  checksum64    = $checksum64
  checksumType64= 'sha256'
}

Install-ChocolateyZipPackage @packageArgs
