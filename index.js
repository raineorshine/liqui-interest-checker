const fetch = require('isomorphic-fetch')
const notifier = require('node-notifier')

const ethCurrencyId = 12
const pollingDelay = 30000 // ms
const liquiInterestRecordsUrl = 'https://liqui.io/Interest/Records'

function print (message) {
  console.log(`[${new Date()}] ${message}`)
}

function error (message) {
  console.error(`[${new Date()}] ${message}`)
}

function notify (message) {
  notifier.notify({
    title: 'Liqui Interest Checker',
    message,
    wait: true // doesn't seem to work
  })
}

function handleResponse (res) {
  if (res.status >= 400) {
    throw new Error('Bad response from server')
  }
  return res.json()
}

function checkLiqui () {
  return fetch(liquiInterestRecordsUrl)
    .then(handleResponse)
    .then(results => {
      const eth = results.find(result => +result.CurrencyId === ethCurrencyId)
      const availableLoans = eth.MaxAmountLimit - eth.CurrentAmount
      return availableLoans
    })
}

function checkLiquiRepeat () {
  checkLiqui().then(availableLoans => {
    if (availableLoans > 0) {
      const message = 'Available Loans: ' + availableLoans + ' ETH'
      notify(message)
      print(message)
    } else {
      print('No loans available.')
    }
    setTimeout(checkLiquiRepeat, pollingDelay)
  })
  .catch(err => {
    error(err)
    setTimeout(checkLiquiRepeat, pollingDelay)
  })
}

module.exports = input => {
  print('Fetching Interest Records...')
  checkLiquiRepeat()
}
