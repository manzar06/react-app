$urls = @(
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png",
    "https://raw.githubusercontent.com/Leaflet/Leaflet/master/dist/images/marker-icon-2x.png",
    "https://raw.githubusercontent.com/Leaflet/Leaflet/master/dist/images/marker-shadow.png"
)

foreach ($url in $urls) {
    $fileName = $url.Split("/")[-1]
    $outputPath = "public/markers/$fileName"
    Write-Host "Downloading $fileName..."
    Invoke-WebRequest -Uri $url -OutFile $outputPath
}

Write-Host "All files downloaded successfully!" 