# Memora: Open Source Digital Photoframe

![Memora Logo](https://example.com/path/to/your/logo.png)

Memora is an open-source digital photoframe software designed to run on Linux systems. 
The name "Memora" blends the words "memory" and "ora" (from the Latin word "orare," meaning "to speak"), embodying the idea that the memories displayed on this frame speak to you.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Running as a Kiosk](#running-as-a-kiosk)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features

- Synchronizes photos from S3 or WebDAV servers (like Nextcloud)
- Supports both image and video playback
- Auto-play functionality for videos
- Easy installation via .deb package

## Requirements

- Linux-based operating system
- Offline mode possible via local storage
- Internet connection for photo synchronization via S3 or Webdav
- S3 bucket or WebDAV server (e.g., Nextcloud) for photo storage

## Installation

1. Download the latest .deb file from the [releases page](https://github.com/yourusername/memora/releases).
2. Install the package using your system's package manager:

   ```
   sudo dpkg -i memora_version_amd64.deb
   ```

   Replace `version` with the actual version number of the downloaded file.

3. If you encounter any dependency issues, run:

   ```
   sudo apt-get install -f
   ```

## Configuration

1. Open Memora for the first time to configure.

## Usage

1. Launch Memora from your application menu or run `memora` in the terminal.
2. The application will start in fullscreen mode, displaying your photos and videos.

## Running as a Kiosk

To run Memora in kiosk mode on system startup:

1. Create a `kiosk.sh` script:

   ```bash
   #!/bin/bash
   xset s noblank
   xset s off
   xset -dpms
   unclutter -idle 0.5 -root &
   memora
   ```

2. Make the script executable:

   ```
   chmod +x /home/kiosk/kiosk.sh
   ```

3. Create a systemd service file `/etc/systemd/system/kiosk.service`:

   ```
   [Unit]
   Description=Memora Kiosk
   Wants=graphical.target
   After=graphical.target

   [Service]
   Environment=DISPLAY=:0
   Environment=XAUTHORITY=/home/kiosk/.Xauthority
   Type=simple
   ExecStart=/bin/bash /home/kiosk/kiosk.sh
   Restart=always
   RestartSec=5
   User=kiosk
   Group=kiosk

   [Install]
   WantedBy=graphical.target
   ```

4. Enable and start the service:

   ```
   sudo systemctl enable kiosk.service
   sudo systemctl start kiosk.service
   ```

## Troubleshooting

- **Sync issues**: Ensure your internet connection is stable and your S3 or WebDAV credentials are correct.
- **Blank screen**: Check if the photo directory is empty or if file permissions are set correctly.
- **Performance issues**: Reduce the number of high-resolution images or videos in your collection.

## Contributing

We welcome contributions to Memora! Please follow these steps:

1. Fork the repository
2. Create a new branch: `git checkout -b feature-branch-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-branch-name`
5. Submit a pull request

## License

Memora is released under the [GNU GPLv3](https://www.gnu.org/licenses/gpl-3.0.en.html).
