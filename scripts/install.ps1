# Install script for installing the various Clinical Trial Matching Service
# files under Windows.
param (
    # The install path for CTMS and its various software
    [string]$InstallPath = "",
    # Name of a CA file to automatically use (path is relative to where the
    # script is run or the script file itself if not found there)
    [string]$ExtraCAs = "CA.cer",
    # Name of wrappers to install. If set to just "default" will install default wrappers.
    [string[]]$Wrappers = @("default"),
    # If $true, skip all install steps (and assume software is available)
    [switch]$NoInstall = $false,
    # If $true, don't attempt to update files
    [switch]$NoGitPull = $false,
    # If $true, skip the build step
    [switch]$NoBuild = $false,
    # If $true, don't attempt to configure the web apps
    [switch]$NoConfigureWebapps = $false,
    # If $true, skip anything that would involve network access. Currently this
    # only affects the JS script portion
    [switch]$NoNetwork = $false
)

# Config for various prereqs, moved here to make updating them easier
# (these values will get overridden later, they're only for making populating the config easier)
$GIT_VERSION = "2.43.0.windows.1"
$NODE_VERSION = "18.19.1"

$global:PREREQ_CONFIG = @{
  "git" = @{
    "version" = "git version $GIT_VERSION";
    # This is weird, but basically, .windows.1 becomes empty, while
    # .windows.(anything else) keeps the variant in the final download
    # So first remove .windows.1 if it exists, and then remove .windows if it
    # exists.
    "url" = "https://github.com/git-for-windows/git/releases/download/v$GIT_VERSION/Git-$(($GIT_VERSION -replace '.windows.1', '') -replace '.windows', '')-64-bit.exe"
  };
  "node" = @{
    "version" = "v$NODE_VERSION";
    "url" = "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-x64.msi"
  }
}

class CTMSPreReq {
    [System.Uri]$Uri
    [string]$Name
    [string]$Filename
    [string]$Path
    [string]$Version
    [string]$CurrentVersion
    [string]$Inf

    CTMSPreReq([string]$Uri, [string]$Name, [string]$Version) {
        $this.Init($Uri, $Name, $Version, "", "")
    }

    CTMSPreReq([string]$Uri, [string]$Name, [string]$Version, [string]$CurrentVersion) {
        $this.Init($Uri, $Name, $Version, $CurrentVersion, "")
    }

    CTMSPreReq([string]$Uri, [string]$Name, [string]$Version, [string]$CurrentVersion, [string]$Inf) {
        $this.Init($Uri, $Name, $Version, $CurrentVersion, $Inf)
    }

    hidden Init([string]$Uri, [string]$Name, [string]$Version, [string]$CurrentVersion, [string]$Inf) {
        $this.Uri = [System.Uri]::New($Uri)
        $this.Name = $Name
        $this.Version = $Version
        $this.CurrentVersion = $CurrentVersion
        $this.Inf = $Inf
        $file_name = $this.Uri.AbsolutePath
        # This will always work because if not found, it returns -1, which means
        # it will ask for the substring starting at 0, which is everything.
        $this.Filename = $file_name.substring($file_name.LastIndexOf("/") + 1)
        # Quick pre-check to make sure we know what to do with this
        if (-Not ($file_name.EndsWith(".msi") -or $file_name.EndsWith(".exe"))) {
            throw "Unable to handle file $file_name - unknown extension."
        }
    }

    [void]Install([CTMSInstaller]$Installer) {
        $Installer.StartActivity("Install $($this.Name) $($this.Version)...")
        if ($this.Version -eq $this.CurrentVersion) {
            $Installer.Info("$($this.Name) $($this.Version) appears to already be installed. Skipping download/install.")
            return
        }
        $dest = "$($Installer.InstallersPath)\$($this.Filename)"
        if (Test-Path -Path $dest) {
            $Installer.Info("$($this.Filename) exists, not re-downloading.")
        } else {
            $Installer.StartSubtask("Downloading $($this.Name) $($this.Version)...")
            try {
                Invoke-WebRequest -Uri $this.Uri -OutFile $dest
            } catch {
                Write-Error "Failed to install prerequiste: $_"
                if ($_.ToString() -match "Could not establish trust relationship") {
                    Write-Host "It looks like there may be a MITM proxy between this server and the public Internet. To automatically install that certificate and use it within the system, add a file named $($Installer.CACerts) in the same directory as this script."
                }
                # And rethrow
                throw $_
            }
        }
        $installer.StartSubtask("Installing $($this.Name) $($this.Version)...")
        if ($this.Filename.EndsWith(".msi")) {
            # Start the MSI
            Start-Process msiexec "/i $dest /qn" -NoNewWindow -Wait
        }
        if ($this.Filename.EndsWith(".exe")) {
            if ($this.Inf.Length -gt 0) {
                # Have an INF file that needs to be given
                $inf_file = New-TemporaryFile
                $this.Inf | Out-File -FilePath $inf_file
                Start-Process $dest "/SP- /LOADINF=""$inf_file"" /SILENT /NOCANCEL" -NoNewWindow -Wait
                Remove-Item $inf_file
            } else {
                Start-Process $dest -NoNewWindow -Wait
            }
        }
    }
}

function Rebuild-Path {
    # Local path should be a combination of the Machine and User paths
    $MachinePath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
    $UserPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    $Path = $MachinePath
    if ($UserPath.Length -gt 0) {
        $Path = "$Path;$UserPath"
    }
    $Env:PATH = $Path
}

# Installer object, manages installing everything
class CTMSInstaller {
    [string]$InstallPath
    [string]$InstallersPath
    [string]$CACerts
    [string]$CACertsPEM
    [string[]]$WrapperNames
    [boolean]$HasExtraCerts
    [boolean]$SkipInstall
    [boolean]$SkipGitPull
    [boolean]$SkipBuild
    [boolean]$SkipWebappConfigure
    [boolean]$NoNetwork
    [string]$CurrentActivity
    [string]$CurrentStatus

    CTMSInstaller([string]$InstallPath, [string]$CACerts) {
        $this.InstallPath = $InstallPath
        $this.InstallersPath = "$InstallPath\installers"
        if ($CACerts.Length -gt 4) {
            $this.CACerts = $CACerts
        } else {
            $this.CACerts = ""
        }
        $this.HasExtraCerts = $false
        $this.SkipInstall = $false
        $this.SkipGitPull = $false
        $this.SkipBuild = $false
        $this.SkipWebappConfigure = $false
        $this.WrapperNames = @("default")
        $this.CurrentActivity = "Installing CTMS"
    }

    [void]StartActivity([string]$Activity) {
        $this.StartActivity($Activity, "Preparing...")
    }

    [void]StartActivity([string]$Activity, [string]$Status) {
        $this.CurrentActivity = $Activity
        $this.CurrentStatus = $Status
        Write-Host $Activity
        Write-Progress -Activity $Activity -Status $Status
    }

    [void]Done([string]$Status) {
        $this.StartActivity($this.CurrentActivity, $Status)
    }

    [void]StartSubtask([string]$Subtask) {
        $this.CurrentStatus = $Subtask
        Write-Host "  $Subtask"
        Write-Progress -Activity $this.CurrentActivity -Status $Subtask
    }

    [void]StartOperation([string]$Operation) {
        Write-Host "    $Operation"
        Write-Progress -Activity $this.CurrentActivity -Status $this.CurrentStatus -CurrentOperation $Operation
    }

    [void]Info([string]$Info) {
        Write-Host $Info
    }

    # Install IIS and required subfeatures. This is safe to do even if the
    # features are already installed - it won't do anything.
    [void]InstallIIS() {
        $features = @(
            "Web-Server",
            "Web-WebServer",
            "Web-Common-Http",
            "Web-Default-Doc",
            "Web-Dir-Browsing",
            "Web-Http-Errors",
            "Web-Static-Content",
            "Web-Health",
            "Web-Http-Logging",
            "Web-Performance",
            "Web-Stat-Compression",
            "Web-Security",
            "Web-Filtering",
            "Web-App-Dev",
            "Web-Net-Ext45",
            "Web-Asp-Net45",
            "Web-ISAPI-Ext",
            "Web-ISAPI-Filter",
            "Web-Mgmt-Tools",
            "Web-Mgmt-Console"
        )
        $this.StartActivity("Installing IIS and required features...", "Running installer...")
        Install-WindowsFeature -Name $features
    }

    [void]CheckExtraCerts() {
        if ($this.CACerts.Length -eq 0) {
            # No CA certs configured, ignore
            return
        }
        if (Test-Path -Path $this.CACerts -PathType "Leaf") {
            $this.StartActivity("Configuring extra CA certs...")
            $this.HasExtraCerts = $true
            $ca_filename = (Get-Item -Path $this.CACerts).Name
            $this.CACertsPEM = "$($this.InstallPath)\$($ca_filename.substring(0, $ca_filename.Length - 3))pem"
            # Install this certificate
            $this.StartSubtask("Automatically trusting $($this.CACerts)...")
            Import-Certificate -FilePath $this.CACerts -CertStoreLocation Cert:\LocalMachine\Root
            # Convert to PEM if necessary
            if (-Not (Test-Path -Path $this.CACertsPEM)) {
                $this.StartSubtask("Converting CER file to PEM...")
                certutil -encode $this.CACerts $this.CACertsPEM
                if ($LastExitCode -ne 0) {
                    throw "Failed to convert extra CA file to PEM"
                }
            }
            $this.StartSubtask("Automatically adding $($this.CACertsPEM) root certificate to NODE_EXTRA_CA_CERTS")
            $Env:NODE_EXTRA_CA_CERTS = $this.CACertsPEM
        }
    }

    [void]InstallGit() {
        try {
            $git_version = git --version
        } catch {
            $git_version = ""
        }
        [CTMSPreReq]::New($global:PREREQ_CONFIG["git"]["url"], "Git", $global:PREREQ_CONFIG["git"]["version"], $git_version, @"
[Setup]
Lang=default
Dir=$([System.Environment]::GetFolderPath("ProgramFiles"))\Git
Group=Git
NoIcons=0
SetupType=default
Components=ext,ext\shellhere,ext\guihere,gitlfs,assoc,assoc_sh,scalar
Tasks=
EditorOption=Notepad
CustomEditorPath=
DefaultBranchOption=
PathOption=Cmd
SSHOption=OpenSSH
TortoiseOption=false
CURLOption=WinSSL
CRLFOption=LFOnly
BashTerminalOption=MinTTY
GitPullBehaviorOption=Merge
UseCredentialManager=Enabled
PerformanceTweaksFSCache=Enabled
EnableSymlinks=Disabled
EnablePseudoConsoleSupport=Disabled
EnableFSMonitor=Disabled
"@).Install($this)
    }

    [void]InstallNode() {
        try {
            $node_version = node --version
        } catch {
            $node_version = ""
        }

        [CTMSPreReq]::New($global:PREREQ_CONFIG["node"]["url"], "Node.js", $global:PREREQ_CONFIG["node"]["version"], $node_version).Install($this)
        # These installs will have updated PATH but we won't have the new
        # version, so copy that over
        Rebuild-Path

        try {
            $npm_version = npm --version
        } catch {
            throw "NPM does not appear to be installed. It should have been installed along with Node.js."
        }
    }

    [void]InstallIISNode() {
        # Don't know how to check for the existance of the current version right now
        [CTMSPreReq]::New("https://github.com/Azure/iisnode/releases/download/v0.2.26/iisnode-core-v0.2.26-x64.msi", "IISNode", "0.2.26").Install($this)
    }

    [void]InstallURLRewrite() {
        # Don't know how to check for the existance of the current version right now
        [CTMSPreReq]::New("https://download.microsoft.com/download/1/2/8/128E2E22-C1B9-44A4-BE2A-5859ED1D4592/rewrite_amd64_en-US.msi", "URL Rewrite", "2.1").Install($this)
    }

    [void]CopyInstallJS() {
        $this.StartActivity("Copying install files to destination...")
        # Copy the scripts to the install directory
        if (-Not (Test-Path -Path "$($this.InstallPath)\wrappers.json" -PathType "Leaf")) {
            # Copy wrapper configuration over
            Copy-Item -Path "$PSScriptRoot\wrappers.json" -Destination "$($this.InstallPath)\wrappers.json"
        }
        if (-Not (Test-Path -Path "$($this.InstallPath)\wrappers.local.json" -PathType "Leaf")) {
            if (Test-Path -Path "$PSScriptRoot\wrappers.local.json" -PathType "Leaf") {
                # Copy local wrapper configuration over
                Copy-Item -Path "$PSScriptRoot\wrappers.local.json" -Destination "$($this.InstallPath)\wrappers.local.json"
            }
        }
        if (-Not (Test-Path -Path "$($this.InstallPath)\clinical-trial-matching-app\scripts\install.js")) {
            # If the script does not exist, we need to clone it.
            Push-Location $this.InstallPath
            try {
                git clone 'https://github.com/mcode/clinical-trial-matching-app.git'
                if ($LastExitCode -ne 0) {
                    throw 'Failed to clone webapp directory (could not bootstrap remaining install)'
                }
            } finally {
                Pop-Location
            }
        }
    }

    [void]InvokeJSInstallScript() {
      # Copy the scripts to the install directory
      $this.CopyInstallJS()
      # Hide the progress bar for the duration of the Node.js process
      Write-Progress -Activity "done" -Status "done" -Completed
      # Force color output in the install script
      $Env:FORCE_COLOR = 1
      $args = @("$($this.InstallPath)\clinical-trial-matching-app\scripts\install.js", "--install-dir", $this.InstallPath, "--target-server", "IIS")
      if ($this.HasExtraCerts) {
        $args += "--extra-ca-certs"
        $args += $this.CACertsPEM
      }
      if ($this.SkipGitPull) {
        $args += "--no-git-pull"
      }
      if ($this.SkipBuild) {
        $args += "--no-build"
      }
      if ($this.SkipWebappConfigure) {
        $args += "--no-webapp-configure"
      }
      if ($this.NoNetwork) {
        $args += "--no-network"
      }
      if (($this.WrapperNames.Length -ne 1) -Or ($this.WrapperNames[0] -ne "default")) {
        $args += "--wrappers"
        $args += """$($this.WrapperNames)"""
      }
      # And run it
      Start-Process -FilePath "node.exe" -ArgumentList $args -Wait -NoNewWindow | Out-Host
    }

    [void]RestartIIS() {
        # IIS needs to be restarted to pull in PATH changes from the Node.js install
        $this.StartActivity("Restarting IIS and starting website...", "Restarting IIS...")
        & IISReset /RESTART | Out-Host
        if ($LastExitCode -ne 0) {
            throw "Unable to restart IIS."
        }
        $this.StartSubtask("Starting CTMS website...")
        Start-Website "CTMS"
        $this.Done("Website started.")
    }

    # Runs through the entire install process.
    [void]Install() {
        # Make sure the install path exists and CD into it
        if (-Not (Test-Path -Path $this.InstallPath -PathType "Container")) {
            New-Item -ItemType "directory" -Path $this.InstallPath | Out-Null
        }
        if (-Not (Test-Path -Path $this.InstallersPath -PathType "Container")) {
            New-Item -ItemType "directory" -Path $this.InstallersPath | Out-Null
        }
        Push-Location $this.InstallPath
        try {
            if (-Not $this.SkipInstall) {
                $this.InstallIIS()
            }
            $this.CheckExtraCerts()
            if (-Not $this.SkipInstall) {
                $this.InstallGit()
                $this.InstallNode()
                $this.InstallIISNode()
                $this.InstallURLRewrite()
            }
            $this.InvokeJSInstallScript()
            # Restart IIS to pull in changes
            $this.RestartIIS()
            # If here, everything succeeded
        } finally {
            # And return to wherever the script was originally run from
            Pop-Location
        }
    }
}

Write-Host "Running CTMS Installer..."

if ($InstallPath -eq "") {
  # If it's blank, use a default
  # Check to see if we're already in an install directory
  if ((Test-Path -Path "$PSScriptRoot\clinical-trial-matching-app\scripts\install.js" -PathType "Leaf") -and (Test-Path -Path "$PSScriptRoot\installers" -PathType "Container")) {
    $InstallPath = $PSScriptRoot
  } else {
    $InstallPath = "C:\CTMS"
  }
}

Write-Host "  Installing into $InstallPath"

$ca_file = ""
if (Test-Path -Path $ExtraCAs -PathType "Leaf") {
  $ca_file = $ExtraCAs
} elseif (Test-Path -Path "$PSScriptRoot\$ExtraCAs" -PathType "Leaf") {
  $ca_file = "$PSScriptRoot\$ExtraCAs"
}

try {
  $installer = [CTMSInstaller]::New($InstallPath, $ca_file)
  $installer.SkipInstall = $NoInstall
  $installer.SkipGitPull = $NoGitPull
  $installer.SkipBuild = $NoBuild
  $installer.NoNetwork = $NoNetwork
  $installer.SkipWebappConfigure = $NoConfigureWebapps
  $installer.WrapperNames = $Wrappers
  $installer.Install()
} catch {
  Write-Error "The CTMS system failed to install: $_"
  throw $_
}
