#!/bin/bash

echo_err() {
    echo -e "\033[0;31m$1\033[0m"
}

# TODO: Requirements checking

if [[ "$#" -ne 2 ]]; then
    echo_err "Usage: ./client.sh <server host> <password>"
    exit 1
fi

SERVER_HOST=$1
PASSWORD=$2

docker run --name ss-local-1080-obfs -idt --network host --restart always mritd/shadowsocks -m ss-local -s "-s $SERVER_HOST -p 80 -l 1080 -k $PASSWORD -m chacha20-ietf-poly1305 -u --fast-open --plugin obfs-local --plugin-opts obfs=http;obfs-host=cn.bing.com -v"

echo "Finished client setup"
echo "SOCKS5 Port : 1080"
