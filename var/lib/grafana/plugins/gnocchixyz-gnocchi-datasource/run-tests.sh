#!/bin/bash
cd $(readlink -f $(dirname $0))
exec node_modules/grunt-cli/bin/grunt $*
