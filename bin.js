#! /usr/bin/env node

const com = require('commander')
const pkg = require('./package.json')
const liquiInterestChecker = require('./')

const extendedHelp = `

${pkg.description}

Here is an example:
$ blah blah blah`

com
  .version(pkg.version)
  .usage(extendedHelp)
  .parse(process.argv)

liquiInterestChecker()
