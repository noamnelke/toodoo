# Toodoo

## Description
Toodoo is a task management application designed to help and motivate kids to perform their daily routines. It can be installed as a Progressive Web Application (PWA) on mobile or tablet devices.

It runs completely offline, after initial loading. All data is stored in local storage, on device. You can export your routines as JSON to back them up or transfer to a different device.

The code has virtually no dependencies. The sole exception is Google's Material Icons font which is loaded directly from their CDN. The app was implemented in pure HTML, CSS and JavaScript.

## Running locally
Since the app is just static HTML, CSS and JavaScript, it can simply be opened directly. However, using a simple server to serve the files is easy and more convenient, especially if you want to test on mobile devices.

After cloning this repository, I recommed installing `http-server` or `live-server` and runnng it from the `src/` directory:

```bash
npm install -g live-server
cd src/
live-server
```

## Contributions
I welcome contributions. Please report any issues you encounter or make suggestions and feature requests, but also feel free to just fork the project and submit a pull request.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
