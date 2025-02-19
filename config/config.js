//NOTE: Changes in this file will not persist between updates at this point.
//Change port number in /config.
exports.editor = {
  "port": 80,
  "version": "0.2.1",
  "version_url": "https://raw.github.com/adafruit/Adafruit-WebIDE/alpha/release/version.txt",
  "offline": false
};

exports.adafruit = {
  "repository": "Adafruit-Raspberry-Pi-Python-Code",
  "remote": "git://github.com/adafruit/Adafruit-Raspberry-Pi-Python-Code.git",
  "remote_name": "adaremote"
};

exports.defaults = {
  "repository": "my-pi-projects",
  "readme": "README.md"
};

exports.term = {
  "shell": "bash",
  "cwd": "./repositories",
  "log": true,
  "term": {
    "termName": "xterm",
    "geometry": [80, 15],
    "scrollback": 1000,
    "visualBell": false,
    "popOnBell": false,
    "cursorBlink": false,
    "screenKeys": false,
    "colors": [
      "#2e3436",
      "#cc0000",
      "#4e9a06",
      "#c4a000",
      "#3465a4",
      "#75507b",
      "#06989a",
      "#d3d7cf",
      "#555753",
      "#ef2929",
      "#8ae234",
      "#fce94f",
      "#729fcf",
      "#ad7fa8",
      "#34e2e2",
      "#eeeeec"
    ]
  }
};