param([Parameter(Mandatory = $true)][string]$f)

$ErrorActionPreference = 'Stop'
$b = [System.IO.File]::ReadAllBytes((Resolve-Path -LiteralPath $f))
$script:littleEndian = $false
$script:restartInterval = $null
$script:restartOffset = $null

function Assert-Range([long]$offset, [long]$length) {
    if ($offset -lt 0 -or $length -lt 0 -or $offset + $length -gt $script:b.Length) {
        throw "Invalid JPEG/EXIF range: offset=$offset length=$length fileLength=$($script:b.Length)"
    }
}

function Read-U16([long]$offset) {
    Assert-Range $offset 2
    if ($script:littleEndian) {
        return [long]$script:b[$offset] + ([long]$script:b[$offset + 1] * 256)
    }
    return ([long]$script:b[$offset] * 256) + [long]$script:b[$offset + 1]
}

function Read-U32([long]$offset) {
    Assert-Range $offset 4
    if ($script:littleEndian) {
        return [long]$script:b[$offset] +
            ([long]$script:b[$offset + 1] * 256) +
            ([long]$script:b[$offset + 2] * 65536) +
            ([long]$script:b[$offset + 3] * 16777216)
    }
    return ([long]$script:b[$offset] * 16777216) +
        ([long]$script:b[$offset + 1] * 65536) +
        ([long]$script:b[$offset + 2] * 256) +
        [long]$script:b[$offset + 3]
}

function Find-ExifTiffOffset {
    if ($script:b.Length -lt 4 -or $script:b[0] -ne 0xFF -or $script:b[1] -ne 0xD8) {
        throw 'Input is not a JPEG file (missing SOI marker)'
    }

    $script:foundTiffOffset = -1
    $offset = 2
    while ($offset -lt $script:b.Length) {
        if ($script:b[$offset] -ne 0xFF) {
            throw "Invalid JPEG marker at offset $offset"
        }
        while ($offset -lt $script:b.Length -and $script:b[$offset] -eq 0xFF) { $offset++ }
        Assert-Range $offset 1
        $marker = [int]$script:b[$offset]
        $offset++

        if ($marker -eq 0xD9 -or $marker -eq 0xDA) { break }
        if ($marker -eq 0x01 -or ($marker -ge 0xD0 -and $marker -le 0xD8)) { continue }

        $segmentLength = Read-U16 $offset
        if ($segmentLength -lt 2) { throw "Invalid JPEG segment length at offset $offset" }
        $dataOffset = $offset + 2
        $segmentEnd = $offset + $segmentLength
        Assert-Range $offset $segmentLength

        if ($marker -eq 0xDD -and $segmentLength -ge 4) {
            $script:restartInterval = Read-U16 $dataOffset
            $script:restartOffset = $offset - 2
        }

        if ($marker -eq 0xE1 -and $segmentLength -ge 8) {
            $signature = [System.Text.Encoding]::ASCII.GetString($script:b, $dataOffset, 6)
            if ($signature -ceq "Exif`0`0" -and $script:foundTiffOffset -lt 0) {
                $script:foundTiffOffset = $dataOffset + 6
            }
        }
        $offset = $segmentEnd
    }
    return $script:foundTiffOffset
}

function Parse-IFD([long]$relativeOffset, [string]$name) {
    $ifdOffset = $script:tiffOffset + $relativeOffset
    Assert-Range $ifdOffset 2
    $count = Read-U16 $ifdOffset
    $entriesEnd = $ifdOffset + 2 + ($count * 12)
    Assert-Range $ifdOffset (2 + ($count * 12) + 4)
    Write-Host "--- $name : $count entries at absolute offset $ifdOffset ---"

    for ($i = 0; $i -lt $count; $i++) {
        $entryOffset = $ifdOffset + 2 + ($i * 12)
        $tag = Read-U16 $entryOffset
        $type = Read-U16 ($entryOffset + 2)
        $itemCount = Read-U32 ($entryOffset + 4)
        $valueOffset = $entryOffset + 8
        $unitSize = switch ($type) {
            1 { 1 }
            2 { 1 }
            3 { 2 }
            4 { 4 }
            5 { 8 }
            7 { 1 }
            9 { 4 }
            10 { 8 }
            default { 0 }
        }

        if ($unitSize -eq 0 -or $itemCount -eq 0) {
            $value = 'unsupported/empty'
        } else {
            $byteLength = [long]$unitSize * $itemCount
            if ($byteLength -le 4) {
                $dataOffset = $valueOffset
            } else {
                $dataOffset = $script:tiffOffset + (Read-U32 $valueOffset)
            }
            Assert-Range $dataOffset $byteLength

            if ($type -eq 2) {
                $textLength = [int][Math]::Min($byteLength, 60)
                $value = [System.Text.Encoding]::ASCII.GetString($script:b, $dataOffset, $textLength).TrimEnd([char]0)
            } elseif ($type -eq 3 -and $itemCount -eq 1) {
                $value = Read-U16 $dataOffset
            } elseif (($type -eq 4 -or $type -eq 9) -and $itemCount -eq 1) {
                $value = Read-U32 $dataOffset
            } elseif ($type -eq 1 -or $type -eq 7) {
                $hexLength = [int][Math]::Min($byteLength, 32)
                $value = [BitConverter]::ToString($script:b, $dataOffset, $hexLength)
            } else {
                $value = "data@$dataOffset bytes=$byteLength"
            }
        }
        Write-Host ("  tag=0x{0:X4} type={1} count={2} value={3}" -f $tag, $type, $itemCount, $value)
    }

    $nextIfdRelativeOffset = Read-U32 $entriesEnd
    Write-Host "  next-IFD relative offset -> $nextIfdRelativeOffset"
    return $nextIfdRelativeOffset
}

$script:tiffOffset = Find-ExifTiffOffset
if ($script:restartInterval -ne $null) {
    Write-Host "DRI at $script:restartOffset restart interval = $script:restartInterval"
}
if ($script:tiffOffset -lt 0) {
    Write-Host 'No EXIF APP1 segment found'
    exit 0
}

Assert-Range $script:tiffOffset 8
if ($b[$script:tiffOffset] -eq 0x49 -and $b[$script:tiffOffset + 1] -eq 0x49) {
    $script:littleEndian = $true
} elseif ($b[$script:tiffOffset] -ne 0x4D -or $b[$script:tiffOffset + 1] -ne 0x4D) {
    throw "Invalid TIFF byte-order marker at offset $script:tiffOffset"
}
if ((Read-U16 ($script:tiffOffset + 2)) -ne 42) {
    throw "Invalid TIFF magic value at offset $script:tiffOffset"
}

Write-Host ("Byte order: " + $(if ($script:littleEndian) { 'little' } else { 'big' }))
$ifd0RelativeOffset = Read-U32 ($script:tiffOffset + 4)
$ifd1RelativeOffset = Parse-IFD $ifd0RelativeOffset 'IFD0'
if ($ifd1RelativeOffset -gt 0) {
    Parse-IFD $ifd1RelativeOffset 'IFD1 (thumbnail)' | Out-Null
} else {
    Write-Host 'No IFD1 (no thumbnail)'
}
