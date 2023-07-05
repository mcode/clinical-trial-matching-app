# Install script for installing the various Clinical Trial Matching Service
# files under Windows.
param (
    # The install path for CTMS and its various software
    [string]$InstallPath = "C:\CTMS",
    # Name of a CA file to automatically use (path is relative to where the
    # script is run or the script file itself if not found there)
    [string]$ExtraCAs = "CA.cer",
    # Name of wrappers to install
    [string[]]$Wrappers = @("ancora.ai", "breastcancertrials.org", "carebox", "lungevity", "trialjectory"),
    # If $true, skip all install steps (and assume software is available)
    [switch]$NoInstall = $false,
    # If $true, don't attempt to update files
    [switch]$NoGitPull = $false,
    # If $true, skip the build step
    [switch]$NoBuild = $false,
    # If $true, don't attempt to configure the web apps
    [switch]$NoConfigureWebapps = $false
)

# Actual app config object
class CTMSWebApp {
    [string]$Name
    [string]$Path
    [string]$Branch
    [string]$GitURL

    CTMSWebApp([string]$Name, [string]$Path, [string]$Branch, [string]$GitURL) {
        $this.Name = $Name
        $this.Path = $Path
        $this.Branch = $Branch
        if ($this.Branch -eq "") {
            # For now, default to master, a future version might try and figure
            # out what the "real" default branch is
            $this.Branch = "master"
        }
        $this.GitURL = $GitURL
    }

    # Clones this into whatever the root branch is. If it appears to be checked
    # out, runs git pull instead.
    [void]CloneBranch([CTMSInstaller]$Installer) {
        if (Test-Path -Path "$($this.Path)\.git") {
            if ($Installer.SkipGitPull) {
                return
            }
            $Installer.StartSubtask("Updating $($this.Name)...")
            Push-Location $this.Path
            git pull
            if ($LastExitCode -ne 0) {
                # Failing this probably means the remaining steps will fail but
                # just flag it as a warning and continue
                Write-Warning "Error updating $($this.Name) via Git, may be out of date"
            } else {
                $current_branch = git rev-parse --abbrev-ref HEAD
                if ($current_branch -ne $this.Branch) {
                    $Installer.StartSubtask("Checking out $($this.Branch)...")
                    git checkout $this.Branch
                    if ($LastExitCode -ne 0) {
                        Write-Warning "Failed to switch branch to $($this.Branch)."
                    }
                }
            }
            Pop-Location
        } else {
            $Installer.StartSubtask("Cloning branch $($this.Branch) for $($this.Name)...")
            git clone $this.GitURL -b $this.Branch
            if ($LastExitCode -ne 0) {
                throw "Failed to check out $($this.GitURL) for $($this.Name)"
            }
        }
    }

    [boolean]NeedsDependenciesUpdated() {
        # Checks to see if any dependencies need to be updated
        if (-Not (Test-Path "$($this.Path)\node_modules" -PathType "container")) {
            return $true
        }
        $node_modules = Get-Item "$($this.Path)\node_modules"
        return ($node_modules.LastWriteTime -lt (Get-Item "$($this.Path)\package.json").LastWriteTime) -Or ($node_modules.LastWriteTime -lt (Get-Item "$($this.Path)\package-lock.json").LastWriteTime)
    }

    [void]RunInstallDependencyCommand() {
        & npm ci | Out-Host
    }

    [void]InstallDependencies([CTMSInstaller]$Installer) {
        if (-Not $this.NeedsDependenciesUpdated()) {
            # If dependencies appear to be up to date, report that and do nothing
            $Installer.Info("Dependenices for $($this.Name) appear to be up to date.")
            return
        }
        Push-Location $this.Path
        try {
            $Installer.StartSubtask("Installing dependencies for $($this.Name)...")
            # For now this will always regenerate everything, the assumption being this
            # script will only ever be run to install or update things anyway
            $this.RunInstallDependencyCommand()
            if ($LastExitCode -ne 0) {
                Throw "Unable to install dependencies for $($this.Name)."
            }
        } finally {
            Pop-Location
        }
    }

    [void]RunBuildCommand() {
        & npm run build | Out-Host
    }

    [void]Build([CTMSInstaller]$Installer) {
        Push-Location $this.Path
        try {
            $Installer.StartSubtask("Building $($this.Name)...")
            $this.RunBuildCommand()
            If ($LastExitCode -ne 0) {
                Throw "An error occurred while building the wrapper for $($this.Name)!"
            }
        } finally {
            Pop-Location
        }
    }

    # Runs through every part of the install process
    [void]Install([CTMSInstaller]$Installer) {
        $Installer.StartActivity("Install $($this.Name)...")
        if (-Not $Installer.SkipInstall) {
            $this.CloneBranch($Installer)
            $this.InstallDependencies($Installer)
        }
        if (-Not $Installer.SkipBuild) {
            $this.Build($Installer)
        }
    }

    [Hashtable]GetAppSettings([CTMSInstaller]$Installer) {
        $settings = @{
            "IISNODE_BASE_URI" = "/$($this.Name)"
        }
        if ($Installer.HasExtraCerts) {
            $settings["NODE_EXTRA_CA_CERTS"] = $Installer.CACertsPEM
        }
        return $settings
    }

    [string]GetIndexScript([CTMSInstaller]$Installer) {
        return "start.js"
    }

    [string]GenerateWebConfig([CTMSInstaller]$Installer) {
        $app_settings = $this.GetAppSettings($Installer).GetEnumerator() | ForEach-Object { "    <add key=""$([System.Net.WebUtility]::HtmlEncode($_.Name))"" value=""$([System.Net.WebUtility]::HtmlEncode($_.Value))"" />" }
        $index_script = $this.GetIndexScript($Installer)
        return @"
<configuration>
  <appSettings>
    <clear />
$($app_settings -join "`r`n")
  </appSettings>
  <system.webServer>
    <handlers>
      <add name="$($this.Name)-iisnode" path="$index_script" verb="*" modules="iisnode" />
    </handlers>
    <rewrite>
      <rules>
        <clear />
        <rule name="$($this.Name)-rewrite">
          <match url="/*" />
          <action type="Rewrite" url="$index_script" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
"@
    }

    [void]Configure([string]$Site, [CTMSInstaller]$Installer) {
        # See if we already exist
        $webapp = Get-WebApplication -Site $Site -Name $this.Name
        if (-Not $webapp) {
            $Installer.StartSubtask("Generating IIS web application...")
            $physical_path = Resolve-Path $this.Path
            $webapp = New-WebApplication -Site $Site -Name $this.Name -PhysicalPath $physical_path
        }
        if (-Not (Test-Path -Path "$($this.Path)\web.config")) {
            $Installer.StartSubtask("Writing web.config file...")
            $this.GenerateWebConfig($Installer) | Out-File -FilePath "$($this.Path)\web.config"
        }
    }
}

# Extends the base webapp with wrapper-specific details
class CTMSWrapper : CTMSWebApp {
    [System.Collections.Hashtable]$LocalEnv

    CTMSWrapper([string]$Name) :
    base($Name,
        "clinical-trial-matching-service-$Name",
        "",
        "https://github.com/mcode/clinical-trial-matching-service-$Name.git"
    ) {
        $this.LocalEnv = @{}
    }
    CTMSWrapper([string]$Name, [string]$Branch) :
    base($Name,
        "clinical-trial-matching-service-$Name",
        $Branch,
        "https://github.com/mcode/clinical-trial-matching-service-$Name.git"
    ) {
        $this.LocalEnv = @{}
    }
    CTMSWrapper([string]$Name, [string]$Branch, [System.Collections.Hashtable]$LocalEnv) :
    base($Name,
        "clinical-trial-matching-service-$Name",
        $Branch,
        "https://github.com/mcode/clinical-trial-matching-service-$Name.git"
    ) {
        $this.LocalEnv = $LocalEnv
    }

    [void]Configure([string]$Site, [CTMSInstaller]$Installer) {
        # Let the base inmplementation deal with the generic stuff
        ([CTMSWebApp]$this).Configure($Site, $Installer)
        if ($this.LocalEnv.Count -gt 0) {
            $Installer.StartSubtask("Writing .env.local file...")
            # Write out values to .env.local
            $lines = $this.LocalEnv.GetEnumerator() | ForEach-Object { "{0}=""{1}""" -f $_.Name, $_.Value }
            # Out-File will output as Unicode with BOM, but we want plain UTF-8,
            # so directly invoke System.IO.File to save as plain BOM-less UTF-8.
            [IO.File]::WriteAllLines("$($Installer.InstallPath)\$($this.Path)\.env.local", $lines)
        }
    }
}

# The CTMS app. Currently an entire special case.
class CTMSApp : CTMSWebApp {
    CTMSApp() : base("clinical-trial-matching-app", "clinical-trial-matching-app", "epic", "https://github.com/mcode/clinical-trial-matching-app.git") {}

    [boolean]NeedsDependenciesUpdated() {
        # Checks to see if any dependencies need to be updated
        if (-Not (Test-Path "$($this.Path)\node_modules" -PathType "container")) {
            return $true
        }
        $node_modules = Get-Item "$($this.Path)\node_modules"
        return ($node_modules.LastWriteTime -lt (Get-Item "$($this.Path)\package.json").LastWriteTime) -Or ($node_modules.LastWriteTime -lt (Get-Item "$($this.Path)\yarn.lock").LastWriteTime)
    }

    [void]RunInstallDependencyCommand() {
        & yarn install | Out-Host
    }

    [void]RunBuildCommand() {
        # Next.js will ALWAYS use md4 for some hashes regardless of what we tell it to do
        $Env:NODE_OPTIONS = "--openssl-legacy-provider"
        & yarn build | Out-Host
    }

    [Hashtable]GetAppSettings([CTMSInstaller]$Installer) {
        $secret = node -e "console.log(require('crypto').randomBytes(33).toString('base64'))"
        $settings = @{
            "SESSION_SECRET_KEY" = $secret
            "NODE_ENV" = "production"
        }
        if ($Installer.HasExtraCerts) {
            $settings["NODE_EXTRA_CA_CERTS"] = $Installer.CACertsPEM
        }
        return $settings
    }

    [string]GetIndexScript([CTMSInstaller]$Installer) {
        return "server.js"
    }
}

$WrapperConfig = @{
    "ancora.ai" = [CTMSWrapper]::New("ancora.ai", "", @{
        ANCORA_AI_API_KEY="<ancora.ai key>"
    })
    "breastcancertrials.org" = [CTMSWrapper]::New("breastcancertrials.org", "remove-unused-dependencies")
    "carebox" = [CTMSWrapper]::New("carebox", "remove-copy", @{
        MATCHING_SERVICE_AUTH_CLIENT_ID="<client id>"
        MATCHING_SERVICE_AUTH_CLIENT_SECRET="<client secret>"
    })
    "lungevity" = [CTMSWrapper]::New("lungevity", "update-dependencies")
    "trialjectory" = [CTMSWrapper]::New("trialjectory", "update-depenencies")
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
    [boolean]$HasExtraCerts
    [boolean]$SkipInstall
    [boolean]$SkipGitPull
    [boolean]$SkipBuild
    [boolean]$SkipWebappConfigure
    [string]$CurrentActivity
    [string]$CurrentStatus
    [CTMSWrapper[]]$Wrappers
    [CTMSApp]$Frontend
    [System.Collections.Generic.List[CTMSWrapper]]$InstalledWrappers
    [System.Collections.Generic.List[CTMSWrapper]]$FailedWrappers

    CTMSInstaller([string]$InstallPath, [string]$CACerts, [CTMSWrapper[]]$Wrappers) {
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
        $this.CurrentActivity = "Installing CTMS"
        $this.Wrappers = $Wrappers
        $this.Frontend = [CTMSApp]::new()
        $this.InstalledWrappers = [System.Collections.Generic.List[CTMSWrapper]]::new()
        $this.FailedWrappers = [System.Collections.Generic.List[CTMSWrapper]]::new()
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
        [CTMSPreReq]::New("https://github.com/git-for-windows/git/releases/download/v2.40.1.windows.1/Git-2.40.1-64-bit.exe", "Git", "git version 2.40.1.windows.1", $git_version, @"
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

        [CTMSPreReq]::New("https://nodejs.org/dist/v18.16.0/node-v18.16.0-x64.msi", "Node.js", "v18.16.0", $node_version).Install($this)
        # These installs will have updated PATH but we won't have the new
        # version, so copy that over
        Rebuild-Path

        try {
            $npm_version = npm --version
        } catch {
            throw "NPM does not appear to be installed. It should have been installed along with Node.js."
        }

        # Yarn can be automatically installed
        try {
            $yarn_version = yarn --version
        } catch {
            # This is OK, try to install it
            $this.Info("Yarn does not appear to be installed, installing it...")
            $this.StartActivity("Installing Yarn...", "Running NPM install...")
            npm install -g yarn
            if ($LastExitCode -ne 0) {
                throw "Yarn does not appear to be installed, and was not able to be automatically installed."
            }
            # And rebuild the path to get Yarn onto it
            Rebuild-Path
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

    [void]InstallWrappers() {
        ForEach ($Wrapper in $this.Wrappers) {
            $this.StartActivity("Installing $($Wrapper.Name)...")
            try {
                $Wrapper.Install($this)
                [void]$this.InstalledWrappers.Add($Wrapper)
            } catch {
                Write-Error "Unable to install $($Wrapper.Name): $_"
                [void]$this.FailedWrappers.Add($Wrapper)
            }
        }
    }

    [void]InstallFrontend() {
        $this.Frontend.Install($this)
    }

    [void]ConfigureIIS() {
        $this.StartActivity("Configuring IIS...")

        $default_website = Get-Website -Name "Default Web Site"
        if ($default_website) {
            $this.StartSubtask("Removing the default web site...")
            Remove-Website "Default Web Site"
        }
        $website = Get-Website -Name "CTMS"
        if (-Not $website) {
            $this.StartSubtask("Creating CTMS website...")
            $website = New-Website -Name "CTMS" -Port 80 -PhysicalPath "$($this.InstallPath)\clinical-trial-matching-app"
        } else {
            $this.StartSubtask("Stopping running CTMS website...")
            Stop-Website "CTMS"
        }
    }

    [void]ConfigureWrappers() {
        $this.StartActivity("Configuring wrappers...")
        ForEach ($Wrapper in $this.InstalledWrappers) {
            try {
                $this.StartSubtask("Configuring wrapper $($Wrapper.Name)...")
                $wrapper.Configure("CTMS", $this)
            } catch {
                Write-Error "Unable to configure $($Wrapper.Name): $_"
            }
        }
    }

    [void]ConfigureFrontend() {
        $this.StartActivity("Configuring frontend...")
        $this.Frontend.Configure("CTMS", $this)
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
            $this.InstallWrappers()
            $this.InstallFrontend()
            $this.ConfigureIIS()
            if (-Not $this.SkipWebappConfigure) {
                $this.ConfigureWrappers()
                $this.ConfigureFrontend()
            }
            $this.RestartIIS()
            # If here, everything succeeded
            Write-Host ""
            Write-Host "Install Complete"
            Write-Host "================"
            If ($this.InstalledWrappers.Count -gt 0) {
                Write-Host ""
                Write-Host "Successfully" -Foreground "green" -NoNewLine
                Write-Host " installed the following wrappers:"
                ForEach ($wrapper in $this.InstalledWrappers) {
                    Write-Host "  - $($wrapper.Name)"
                }
            }
            If ($this.FailedWrappers.Count -gt 0) {
                Write-Host ""
                Write-Host "The following wrappers " -NoNewLine
                Write-Host "FAILED" -NoNewLine -Foreground "red"
                Write-Host " to install:"
                Foreach ($wrapper in $this.FailedWrappers) {
                    Write-Host "  - " -NoNewLine
                    Write-Host $wrapper.Name -Foreground "red"
                }
            }
            Write-Host ""
            Write-Host "Clinical Trial Matching Service was " -NoNewLine
            Write-Host "successfully" -NoNewLine -Foreground "green"
            Write-Host " installed."
        } finally {
            # And return to wherever the script was originally run from
            Pop-Location
        }
    }
}

$wrappers_to_install = ForEach ($name in $Wrappers) {
    $wrapper = $WrapperConfig[$name]
    if (-Not $wrapper) {
        throw "Invalid wrapper $name - no configuration for wrapper of that name"
    }
    $wrapper
}

Write-Host "Running CTMS Installer..."

$ca_file = ""
try {
    $ca_file = (Get-Item -Path $ca_file).ToString()
} catch {
    # If that failed, it's fine, try it relative to ourself
    try {
        $ca_file = (Get-Item -Path "$PSScriptRoot\$ExtraCAs").ToString()
    } catch {
        # Again, this is fine, it'll just be ignored
    }
}

try {
    $installer = [CTMSInstaller]::New($InstallPath, $ca_file, $wrappers_to_install)
    $installer.SkipInstall = $NoInstall
    $installer.SkipGitPull = $NoGitPull
    $installer.SkipBuild = $NoBuild
    $installer.SkipWebappConfigure = $NoConfigureWebapps
    $installer.Install()
} catch {
    Write-Error "The CTMS system failed to install: $_"
    throw $_
}
