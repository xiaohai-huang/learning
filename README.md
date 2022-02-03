# screen share app

[xiaohai-huang.net](https://xiaohai-huang.net)

## build

```bash
docker build -t xiaohaihuang/screen-share .
```

## run

```bash
sudo docker run --name screen-share-app \
    -p 8080:3000 \
    -itd \
    --restart always \
    xiaohaihuang/screen-share
```

## start the TURN server

```bash
sudo docker run --name turn-server \
                --network=host \
                -itd \
                --restart always \
                -v $(pwd)/turnserver.conf:/etc/coturn/turnserver.conf \
                coturn/coturn
```

```sh
# TURN server name and realm
realm=screen.xiaohai-huang.net
server-name=myTurnServer

# IPs the TURN server listens to
listening-ip=0.0.0.0

# External IP-Address of the TURN server
external-ip=43.156.46.25


# Main listening port
listening-port=3478

# Further ports that are open for communication
min-port=10000
max-port=20000

# Use fingerprint in TURN message
fingerprint

# Log file path
log-file=/var/log/turnserver.log

# Enable verbose logging
verbose

# Specify the user for the TURN authentification
user=xiaohai:password123

# Enable long-term credential mechanism
lt-cred-mech
```
