#!/bin/bash

# This script "bootstraps" the install process, installing necessary software
# (if possible) before passing off to the Node.js-based install script.
set -e

# Installer configuration

# Directory to install everything to
CTMS_DIR=/opt/ctms

# User to use
CTMS_USER=ctms

# Group to use
CTMS_GROUP="$CTMS_USER"

EXTRA_CA_CERTS_FILE=extra-cas.crt

# Wrappers being installed:
WRAPPERS=("breastcancertrials.org" "carebox" "lungevity" "trialjectory")
MINIMUM_NODE_VERSION=20

# Script for installing the various components. Requires root privileges via
# sudo.

REMAINING_ARGS=()

# Parse command line options if possible
while [[ $# -gt 0 ]]; do
  case $1 in
    --install-dir)
      CTMS_DIR="$2"
      shift
      shift
      ;;
    --username)
      CTMS_USER="$2"
      shift
      shift
      ;;
    --group)
      CTMS_GROUP="$2"
      shift
      shift
      ;;
    --extra-ca-certs)
      EXTRA_CA_CERTS_FILE="$2"
      shift
      shift
      ;;
    --no-extra-certs)
      EXTRA_CA_CERTS_FILE=""
      shift
      ;;
    *)
      # Save
      REMAINING_ARGS+=("$1")
      shift
      ;;
  esac
done

# Restore existing arguments to pass to the JS script
set -- "${REMAINING_ARGS[@]}"

# Check which distro this is being run on
if DISTRO=`lsb_release --id --short`; then
    if ! DISTRO_VERSION=`lsb_release --release --short`; then
        echo "Unable to determine your Linux release version." >&2
        exit 1
    fi
else
    echo "Unable to determine which Linux distribution this is being run under." >&2
    exit 1
fi

case "$DISTRO" in
    Ubuntu)
        # Check to make sure this is recent enough
        if [ "${DISTRO_VERSION%.*}" -lt 22 ]; then
            echo "Unsupported Ubuntu version $DISTO_VERSION. Please use Ubuntu 22 or later." >&2
            exit 1
        fi
        ;;
    *)
        echo "Unknown Linux distribution $DISTRO. The automated install won't work." >&2
        echo "However, you may manually install the prerequisite software and use the Node.js-based install.js script to complete installation of the CTMS wrappers and front end." >&2
        exit 1
        ;;
esac

# Install extra CA certs
if [ ! -z "$EXTRA_CA_CERTS_FILE" ] && [ -f "$EXTRA_CA_CERTS_FILE" ]; then
    echo "Adding $EXTRA_CA_CERTS_FILE to the CA chain..."
    case "$DISTRO" in
        Ubuntu|Debian)
            # This will convert the input file to a PEM format CRT file
            DEST_NAME=`basename "${EXTRA_CA_CERTS_FILE%.*}"`.crt
            if openssl x509 -in "$EXTRA_CA_CERTS_FILE" -out - | sudo tee "/usr/local/share/ca-certificates/$DEST_NAME" > /dev/null; then
                # Update to point EXTRA_CA_CERTS_FILE to this location
                EXTRA_CA_CERTS_FILE="/usr/local/share/ca-certificates/$DEST_NAME"
                if ! sudo update-ca-certificates; then
                    echo "Unable to update CA certificates. Remaining steps may fail!" >&2
                fi
            else
                echo "Unable to copy certificate file to "/usr/local/share/ca-certificates/$DEST_NAME". Remaining steps may fail!" >&2
            fi
            ;;
        *)
            echo "Unable to add extra CA certificate file to $DISTRO. The remaining steps may fail!" >&2
    esac
fi

# Check to see if git is installed...
if ! git --version > /dev/null ; then
    echo "Git is missing. Please install git before continuing."
    exit 1
fi

# Check to make sure an appropriate version of Node.js is available
if ! node_version=`node --version`; then
    echo "Node is missing." >&2
    echo -n "Install NodeSource Node.js wrappers? This will run the NodeSource install script and install it. (Y/n)" >&2
    read do_install
    if [ -z "$do_install" ]; then
        do_install=Y
    fi
    case $do_install in
        Y|y)
            if curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -; then
                if sudo apt satisfy "nodejs (>=18.0)"; then
                    echo "Successfully installed Node.js from NodeSource."
                else
                    echo "Unable to install Node.js!" >&2
                    exit 1
                fi
            else
                echo "Failed to add NodeSource packages!" >&2
                exit 1
            fi
            ;;
        *)
            echo "Node.js is required to continue. Please install it manually and re-run this script." >&2
            exit 1
            ;;
    esac
elif [ -z "$node_version" ]; then
    echo "Unable to get current Node version. Node --version shows:" >&2
    node --version >&2
    echo "If the above line is empty, the process ran successfully but did not return any useful output." >&2
else
    # Remove the 'v' from the returned version (Node will give something like v18.0.1)
    node_version="${node_version#v*}"
    node_major_version="${node_version%%.*}"
    if [ $node_major_version -ge "$MINIMUM_NODE_VERSION" ]; then
        echo "Valid Node.js version $node_version found"
    else
        echo "Node.js version $node_version is too old." >&2
        echo "This requires at least Node.js version $MINIMUM_NODE_VERSION. Currently mixing Node.js versions is not supported." >&2
        echo "Please remove the existing Node.js install." >&2
        exit 1
    fi
fi

echo "Installing NGINX..."
if ! sudo apt-get install -y nginx ; then
    echo "Unable to install NGINX." >&2
    exit 1
fi
echo "Installing Passenger for NGINX..."

# Make sure necessary packages are installed
if ! sudo apt-get install -y dirmngr gnupg apt-transport-https ca-certificates curl ; then
    echo "Some prerequiste software failed to install." >&2
    exit 1
fi

# Add the Passenger signing key
if [ ! -f /etc/apt/trusted.gpg.d/phusion.gpg ]; then
    echo "Adding Passenger signing key..."
    if !(curl https://oss-binaries.phusionpassenger.com/auto-software-signing-gpg-key.txt | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/phusion.gpg >/dev/null); then
        echo "Unable to add the Passenger software signing key." >&2
        exit 1
    fi
fi

# Add the Passenger APT repository
if ! sudo sh -c 'echo deb https://oss-binaries.phusionpassenger.com/apt/passenger jammy main > /etc/apt/sources.list.d/passenger.list' ; then
    echo "Unable to add Passenger to the Apt sources list." >&2
    exit 1
fi
if ! sudo apt-get update ; then
    echo "Unable to update available packages." >&2
    exit 1
fi

# Install Passenger + Nginx module
if ! sudo apt-get install -y libnginx-mod-http-passenger; then
    echo "Unable to install the Passenger module." >&2
    exit 1
fi

# Enable Passenger on NGINX
if [ ! -f /etc/nginx/modules-enabled/50-mod-http-passenger.conf ]; then sudo ln -s /usr/share/nginx/modules-available/mod-http-passenger.load /etc/nginx/modules-enabled/50-mod-http-passenger.conf ; fi
if [ ! -f /etc/nginx/conf.d/mod-http-passenger.conf ]; then
    echo "Generating basic Passenger configuration..."
    sudo sh -c 'echo "passenger_root /usr/lib/ruby/vendor_ruby/phusion_passenger/locations.ini;" > /etc/nginx/conf.d/mod-http-passenger.conf; echo "passenger_ruby /usr/bin/passenger_free_ruby;" >> /etc/nginx/conf.d/mod-http-passenger.conf'
fi

echo "Restarting Passenger..."
if ! sudo service nginx restart ; then
    echo "Unable to restart NGINX with Passenger. Please check the configuration to ensure it is functioning." >&2
    exit 1
fi

if ! sudo /usr/bin/passenger-config validate-install --auto ; then
    echo "Passenger is not functioning as expected. Please attempt to correct any issues." >&2
    exit 1
fi

if ! id -u "$CTMS_USER" > /dev/null 2>&1; then
    echo "Creating CTMS user \"$CTMS_USER\", this may require a password for root permssion."
    # This user account needs a home directory to store npm stuff
    if ! sudo useradd --comment "CTMS User" --user-group --create-home "$CTMS_USER"; then
        echo "Failed to create CTMS user \"$CTMS_USER\"." >&2
        exit 1
    fi
fi
echo "Creating install directory. Password may be required for root permissions..."
sudo mkdir -p "$CTMS_DIR"
sudo chown "$CTMS_USER:$CTMS_USER" "$CTMS_DIR"

echo "Moving to Node.js-based install script..."
SCRIPT_DIR=`dirname "$0"`
# Copy the install script to the install directory. This is necessary because the install script may otherwise not be visible.
for FILE in wrappers.json wrappers.local.json; do
  if [ "$FILE" != "wrappers.local.json" ] || [ -f "$SCRIPT_DIR/$FILE" ]; then
    sudo cp "$SCRIPT_DIR/$FILE" "$CTMS_DIR/$FILE"
    sudo chown "$CTMS_USER:$CTMS_USER" "$CTMS_DIR/$FILE"
  fi
done
cd "$CTMS_DIR"
# Bootstrap the CTMS directory if necessary
if ! [ -f "$CTMS_DIR/clinical-trial-matching-app/scripts/install.js" ] ; then
  pushd "$CTMS_DIR"
  git clone 'https://github.com/mcode/clinical-trial-matching-app.git'
  popd
fi
sudo -u "$CTMS_USER" node "$CTMS_DIR/clinical-trial-matching-app/install.js" --install-dir "$CTMS_DIR" --extra-ca-certs "$EXTRA_CA_CERTS_FILE" $*

# The wrapper script doesn't have permissions to write the nginx configuration file, so this needs to be done with a second step
echo "Copying nginx config..."
sudo cp "$CTMS_DIR/nginx.conf" /etc/nginx/sites-available/ctms
# Disable default site
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/ctms /etc/nginx/sites-enabled/ctms

echo "Restarting nginx..."
sudo systemctl restart nginx
