options for setting screen size to full screen
```
{
    "maxInstances":1,
    "browserName": "chrome",
    "acceptInsecureCerts":" true,
    "goog:chromeOptions": {
        "args": [
            "--start-fullscreen"
        ]
    }
}
```

for setting specific window size
```
        "args": [
            "--start-fullscreen"
        ]
```

for setting max window size (not same as full screen), use
```
        "args": [
            "--start-maximized"
        ]
```