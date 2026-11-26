$ErrorActionPreference = 'Stop'
$shirtSizes = @('S', 'M', 'L', 'XL', '2XL', '3XL')
$links = @()
foreach ($shirtSize in $shirtSizes) {
    $response = & npm.cmd exec --yes --package=@stripe/cli -- stripe payment_links create --live `
        -d 'line_items[0][price]=price_1Ug84PBdM1yyoXdtSt9pj8fZ' `
        -d 'line_items[0][quantity]=1' `
        --name-collection.individual.enabled=true --name-collection.individual.optional=false `
        -d 'custom_fields[0][key]=shirtsize' `
        -d 'custom_fields[0][label][type]=custom' `
        -d 'custom_fields[0][label][custom]=Shirt size' `
        -d 'custom_fields[0][type]=text' `
        -d 'custom_fields[0][optional]=false' `
        -d "custom_fields[0][text][default_value]=$shirtSize" `
        --custom-text.submit.message 'One shirt per order, 25 USD. Pickup at the 2027 Turkey Bowl game at Newton Park on November 25, 2027. No shipping.' `
        --after-completion.type hosted_confirmation `
        --after-completion.hosted-confirmation.custom-message 'Thank you! Pick up your shirt at Newton Park on November 25, 2027. Bring your receipt. Payment must be confirmed before pickup. Questions? Contact AJ at 224-660-5288.' `
        -d 'metadata[event]=turkey_bowl_2027' -d "metadata[shirt_size]=$shirtSize" `
        --idempotency "turkey-bowl-2027-shirt-size-$shirtSize-v1"
    if ($LASTEXITCODE -ne 0) { throw "Could not create checkout for size $shirtSize" }
    $link = ($response | Out-String) | ConvertFrom-Json
    if (-not $link.url) { throw "Stripe returned no checkout URL for size $shirtSize" }
    if ($link.custom_fields[0].text.default_value -ne $shirtSize) { throw "Stripe did not prefill size $shirtSize" }
    $links += [PSCustomObject]@{ size = $shirtSize; id = $link.id; url = $link.url }
    Write-Host "Ready: size $shirtSize"
}
$links | ConvertTo-Json
