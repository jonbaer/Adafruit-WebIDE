#!/usr/bin/env bash

# curl https://raw.github.com/adafruit/Adafruit-WebIDE/alpha/scripts/install.sh | sudo sh
# curl https://raw.github.com/adafruit/Adafruit-WebIDE/test/scripts/install.sh | sudo sh

#tar -zcvf editor.tar.gz * --exclude .git --exclude .gitignore
#tar -zcvf editor-update.tar.gz * --exclude .git --exclude .gitignore
#scp pi@raspberrypi.local:/home/pi/Adafruit-WebIDE/editor.tar.gz editor-0.2.1.tar.gz
#scp pi@raspberrypi.local:/home/pi/Adafruit-WebIDE-Update/editor-update.tar.gz editor-0.2.1-update.tar.gz
#sudo -u webide -g webide node server

set -e
WEBIDE_ROOT="/usr/share/adafruit/webide"

#needed for SSH key and config access at this point.
WEBIDE_HOME="/home/webide"

#NODE_PATH="/usr/local/lib/node"

#if [ ! -d "$NODE_PATH" ]; then
#  mkdir -p "$NODE_PATH"
#    # Control will enter here if $DIRECTORY doesn't exist.
#fi

mkdir -p "$WEBIDE_ROOT"
mkdir -p "$WEBIDE_HOME"
cd "$WEBIDE_ROOT"

echo "**** Downloading the latest version of the WebIDE ****"
curl -L https://github.com/downloads/adafruit/Adafruit-WebIDE/editor-0.2.1.tar.gz | tar xzf -

echo "**** Installing required libraries ****"
echo "**** (nodejs npm redis-server git restartd libcap2-bin avahi-daemon i2c-tools python-smbus) ****"
apt-get update
apt-get install nodejs npm redis-server git restartd libcap2-bin avahi-daemon i2c-tools python-smbus -y

echo "**** Create webide user and group ****"
groupadd webide || true
useradd -g webide webide || true
usermod -a -G i2c,sudo webide || true

echo "**** Adding webide user to sudoers ****"
if [ -f "/etc/sudoers.tmp" ]; then
    rm /etc/sudoers.tmp
fi
cp /etc/sudoers /etc/sudoers.tmp
echo "webide ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers.tmp
visudo -c -f /etc/sudoers.tmp
if [ "$?" -eq "0" ]; then
    cp /etc/sudoers.tmp /etc/sudoers
fi
rm /etc/sudoers.tmp

chown -R webide:webide "$WEBIDE_HOME"
chown -R webide:webide "$WEBIDE_ROOT"
chmod 775 "$WEBIDE_ROOT"

echo "**** Adding default .bashrc file for webide user ****"
cp "$WEBIDE_ROOT/scripts/.bashrc" "$WEBIDE_HOME"

echo "**** Installing the WebIDE as a service ****"
echo "**** (to uninstall service, execute: 'sudo update-rc.d -f adafruit-webide.sh remove') ****"
cp "$WEBIDE_ROOT/scripts/adafruit-webide.sh" "/etc/init.d"
cd /etc/init.d
chmod 755 adafruit-webide.sh
update-rc.d adafruit-webide.sh defaults

#Check if port 80 is in use, use 3000 if so.
PORTS="$(netstat -lnt | awk '$6 == "LISTEN" && $4 ~ ".80"')"
PORT_USED=""
if [[ $PORTS =~ "LISTEN" ]]; then
  redis-cli HMSET server port 3000
  PORT_USED=":3000"
  echo "**** WARNING: PORT 80 IN USE. FALLING BACK TO 3000. ****"
  echo "**** TO CHOOSE A DIFFERENT PORT USE THE FOLLOWING COMMAND: ****"
  echo "**** redis-cli HMSET server port 3000 ****"
  echo "**** AND RESTART THE SERVER ****"
fi

service adafruit-webide.sh start

if grep -q adafruit-webide.sh /etc/restartd.conf
then
  echo "restartd already configured"
else
  echo 'webide "node" "service adafruit-webide.sh restart" ""' >> /etc/restartd.conf
fi

#kill all restartd processes, and restart one
pkill -f restartd || true
sleep 5s
restartd

echo "**** Starting the server...(please wait) ****"
sleep 20s

echo "**** The Adafruit WebIDE is installed and running! ****"
echo "**** Commands: sudo service adafruit-webide.sh {start,stop,restart} ****"
echo "**** Navigate to http://$(hostname).local$PORT_USED to use the WebIDE"
#echo "**** To run the editor: ****"
#echo "**** cd ~/Adafruit/WebIDE ****"
#echo "**** node webide ****"