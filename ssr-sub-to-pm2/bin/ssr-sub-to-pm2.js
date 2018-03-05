const fs = require('fs')
const path = require('path')
const program = require('commander')
const rpn = require('request-promise-native')

program
  .version('1.0.0')
  .option('-u, --url <url>', 'SSR subscription URL')
  .option('-b, --ssr-bin <ssr bin path>', 'SSR executable file')
  .option('-d, --dir <path>', 'Output file directory for ecosystem.json and shell script', '.')
  .option('-p, --port-start <port start>', 'Starting port number for all clients', 1926)
  .option('-x, --proxy <proxy url>', 'Use HTTP proxy', null)
  .parse(process.argv)

if (!program.url || !program.ssrBin) {
  program.help()
}

const dir = path.resolve(program.dir)
const ssrBin = path.resolve(program.ssrBin)
const portStart = Number(program.portStart)

Promise.resolve().then(() => {
  return rpn({
    url: program.url,
    proxy: program.proxy,
    headers: {
      // User Agent is required
      'User-Agent': 'curl/7.58.0'
    }
  })
}).then(body => {
  const apps = Buffer.from(body, 'base64').toString('ascii').split(/\r?\n/).map((uri, index) => {
    const obj = {}
    // Parse SSR URI and create PM2 app config object
    const decoded = decodeUnpaddedBase64(uri.substr('ssr://'.length).replace('-', '+').replace('_', '/'))
    const splitted = decoded.split('/?')
    // Parse left part array
    const la = splitted[0].split(':')
    obj['serverHost'] = la[0]
    obj['serverPort'] = la[1]
    obj['protocol'] = la[2]
    obj['method'] = la[3]
    obj['obfs'] = la[4]
    obj['password'] = decodeUnpaddedBase64(la[5])
    // Parse right part K-V map
    splitted[1].split('&').forEach(kv => {
      const sp = kv.split('=')
      obj[sp[0]] = decodeUnpaddedBase64(sp[1])
    })
    obj['localPort'] = portStart + index
    // FIXME: Avoid abnormal characters, as this field will be used as part of filename
    obj['name'] = obj['localPort'] + '-' + (obj['group'] ? `${obj['group']}-` : '') + obj['serverHost']
    return obj
  })
  return apps
}).then(apps => {
  // Generate files
  return Promise.resolve().then(() => {
    return Promise.all(apps.map(app => {
      return writeFile(`${dir}/${app.name}.sh`, generateShellScript(app))
    }))
  }).then(() => {
    return writeFile(`${dir}/ecosystem.json`, generateEcosystem(apps))
  }).then(() => {
    apps.forEach(app => console.log(`Generated: ${app.name}`))
  })
}).catch(err => {
  console.error(err)
})

function decodeUnpaddedBase64 (str) {
  str = str + '==='.substr(0, str.length % 4 === 0 ? 0 : (4 - str.length % 4))
  return Buffer.from(str, 'base64').toString('utf-8')
}

function writeFile (filename, content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, content, err => err ? reject(err) : resolve())
  })
}

function generateShellScript (app) {
  return `#!/bin/bash

$BIN$ -s $HOST$ -p $PORT$ -O $PROTOCOL$ -m $METHOD$ -o $OBFS$ -g '$OBFS_PARAM$' -l $LOCAL_PORT$ -k '$PASSWORD$' -u --fast-open -v
`
    .replace('$BIN$', ssrBin)
    .replace('$HOST$', app.serverHost)
    .replace('$PORT$', app.serverPort)
    .replace('$PROTOCOL$', app.protocol)
    .replace('$METHOD$', app.method)
    .replace('$OBFS$', app.obfs)
    .replace('$OBFS_PARAM$', app.obfsparam)
    .replace('$LOCAL_PORT$', app.localPort)
    .replace('$PASSWORD$', app.password)
}

function generateEcosystem (apps) {
  return JSON.stringify({
    apps: apps.map(app => {
      return {
        name: app.name,
        script: `./${app.name}.sh`,
        cwd: dir,
        interpreter: '/bin/bash',
        // Only for user-friendly text
        remarks: app.remarks
      }
    })
  }, null, 2)
}
