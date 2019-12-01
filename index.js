#!/usr/bin/env node

require('./src/fxrc')

const _process                = require('process')

const _line                   = require('./src/lexers/line')
const _streamObject           = require('./src/lexers/streamObject')
const _bulk                   = require('./src/parsers/bulk')
const _single                 = require('./src/parsers/single')
const _map                    = require('./src/updaters/map')
const _flatMap                = require('./src/updaters/flatMap')
const _stringify              = require('./src/marshallers/stringify')

const _argv                   = require('./src/args')
const _run                    = require('./src/run')

const _failEarly              = _argv.e || false
const _functionString         = _argv.f || 'json => json'
const _lexer                  = _argv.l || 'line'
const _marshaller             = _argv.m || 'stringify'
const _parser                 = _argv.p || 'bulk'
const _updater                = _argv.u || 'map'
const _verbose                = _argv.v || false

const _f                      = eval(_functionString)

let _lex = _catchUndefined('lexer', _lexer, lexer =>
  lexer === 'streamObject' ? _streamObject :
  lexer === 'line'         ? _line
                           : eval(lexer)
)(_verbose, _failEarly, _argv)

let _parse = _catchUndefined('parser', _parser, parser =>
  parser === 'bulk'   ? _bulk :
  parser === 'single' ? _single
                      : eval(parser)
)(_verbose, _failEarly, _argv)

let _update = _catchUndefined('updater', _updater, updater =>
  updater === 'map'     ? _map :
  updater === 'flatMap' ? _flatMap
                        : eval(updater)
)(_verbose, _failEarly, _f, _argv)

let _marshal = _catchUndefined('marshaller', _marshaller, marshaller =>
  marshaller === 'stringify' ? _stringify
                             : eval(marshaller)
)(_verbose, _failEarly, _argv)

_run(_lex, _parse, _update, _marshal)

function _catchUndefined (type, field, choose) {
  let func
  try {
    func = choose(field)
  } catch (e) {
    _process.stderr.write('No ' + type + ' defined with name ' + field + '!\n')
    _process.exit(1)
  }
  return func
}