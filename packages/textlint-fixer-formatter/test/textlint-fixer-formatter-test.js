// LICENSE : MIT
'use strict'
var path   = require('path')
var assert = require('power-assert')
import { getFormatterList } from 'textlint-fixer-formatter'

describe('textlint-fixer-formatter-test', function () {
  describe('getFormatterList', function () {
    it('should return list of formatter(s)', function () {
      assert(getFormatterList(), [
          {name: 'compact'},
          {name: 'diff'},
          {name: 'json'},
          {name: 'stylish'}
        ]
      )
    })
  })
})
