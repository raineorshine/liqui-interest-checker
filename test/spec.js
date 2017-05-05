/* eslint-env mocha */
const chai = require('chai')
const liquiInterestChecker = require('../index.js')
chai.should()

describe('liqui-interest-checker', () => {
  it('should do something', () => {
    liquiInterestChecker().should.equal(12345)
  })
})
