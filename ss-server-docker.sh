#!/bin/bash

check_bin() {
    if [[ ! $(which $1) ]]; then
        echo "Executable not found: $1"
        exit 1
    fi
}

check_no_container() {
    if [[ $(docker container ls --all --filter name=$1 | wc -l) -ne 1 ]]; then
        echo "Docker container already exists: $1"
        exit 1
    fi
}

check_no_file() {
    if [[ -e "$1" ]]; then
        echo "File exists, remove it first: $1"
        exit 1
    fi
}

# Check requirements
if [[ "$#" -ne 2 ]]; then
    echo "Usage: ./ss-server-docker.sh <ssmgr home directory> <ss-manager manage address port>"
    exit 1
fi
SSMGR_HOME=$(readlink -f $1)
check_bin docker
check_no_container ss-manager
check_no_container ssmgr-server
check_no_container ssmgr-telegram

# ss-manager
SS_MANAGER_ARGS="-m aes-256-cfb -u --manager-address 127.0.0.1:$2 -v"
docker run --name ss-manager -dt --network host mritd/shadowsocks -m ss-manager -s "$SS_MANAGER_ARGS"
echo "Docker container started: ss-manager"

# ssmgr-server
docker run --name ssmgr-server -idt -v $SSMGR_HOME:/root/.ssmgr --network host gyteng/ssmgr --debug
echo "Docker container started: ssmgr-server"

# ssmgr-telegram
docker run --name ssmgr-telegram -idt -v $SSMGR_HOME:/root/.ssmgr --network host gyteng/ssmgr -c /root/.ssmgr/telegram.yml --debug
echo "Docker container started: ssmgr-telegram"

# Done
echo "Finish deployment!"

exit 0
