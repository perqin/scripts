#!/bin/bash

mitmproxy -p 9495 --replace '|~u version.jr.moefantasy.com/index/checkVer/3.5.0|"cheatsCheck":\s*0|"cheatsCheck":1' --follow
