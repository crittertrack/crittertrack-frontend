$lines = Get-Content app.jsx

# Function to add toggle
function Add-Toggle {
    param($lineIdx, $key, $label)
    
    $global:lines[$lineIdx-2] = '                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">'
    $global:lines[$lineIdx-1] = '                                <div className="flex justify-between items-center">'
    $global:lines[$lineIdx] = "                                    <h3 className=`"text-lg font-semibold text-gray-700`">$label</h3>"
    
    $newLines = @(
        '                                    <button',
        "                                        onClick={() => toggleSectionPrivacy(animal?.id_public, '$key')}",
        '                                        className="px-3 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer"',
        '                                        style={{',
        "                                            backgroundColor: sectionPrivacy[animal?.id_public]?.$key ? '#f3f4f6' : '#dbeafe',",
        "                                            color: sectionPrivacy[animal?.id_public]?.$key ? '#374151' : '#1e40af'",
        '                                        }}',
        '                                        title="Toggle public visibility"',
        '                                    >',
        "                                        <span>{sectionPrivacy[animal?.id_public]?.$key ? '🔒 Private' : '🌍 Public'}</span>",
        '                                    </button>',
        '                                </div>'
    )
    
    $global:lines = $global:lines[0..$lineIdx] + $newLines + $global:lines[($lineIdx+1)..($global:lines.Length-1)]
    Write-Output "$label added at line $lineIdx"
}

# Add all toggles (line numbers are 0-based array indices)
Add-Toggle 2572 'origin' 'Origin'

# Save file
$lines | Set-Content app.jsx
Write-Output "All toggles added!"
