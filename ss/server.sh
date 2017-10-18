#!/bin/bash

# TODO: Requirements checking

PASSWORD=$(< /dev/urandom tr -dc _A-Za-z0-9 | head -c${1:-32};echo;)

docker run --name ss-server-80-obfs -idt --network host mritd/shadowsocks -m ss-server -s "-s 0.0.0.0 -p 80 -k $PASSWORD -m chacha20-ietf-poly1305 -u --fast-open --plugin obfs-server --plugin-opts \"obfs=http;failover=127.0.0.1:8080\" -v"

echo "Finished server setup"
echo "Port        : 80"
echo "Password    : $PASSWORD"
echo "Encryption  : chacha20-ietf-poly1305"
echo "UDP Relay   : ON"
echo "Fast Open   : ON"
echo "simple-obfs : obfs=http;failover=127.0.0.1:8080"
