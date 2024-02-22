# This script exists pretty much solely to pass off to the "real" test script
# But it makes running it on Windows easier
param (
  # Name of wrappers to install
  [string[]]$Wrappers = @(),
  [string]$Protocol = "http",
  [string]$Hostname = "localhost"
)

node "clinical-trial-matching-app\scripts\test.js" --protocol $Protocol --hostname $Hostname --wrappers ($Wrappers -join ",")
