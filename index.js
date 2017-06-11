const fetch = require('isomorphic-fetch')
const notifier = require('node-notifier')

// store API keys in config that is not committed to repo
const config = require('./config.js')

const ethCurrencyId = 12
const pollingDelaySeconds = 10
const emailThrottleMinutes = 20
const liquiInterestRecordsUrl = 'https://liqui.io/Interest/Records'

let lastEmailSent = 0

const print = console.log
const error = console.error

const mailgun = require('mailgun-js')({
  apiKey: config.mailgunApiKey,
  domain: config.mailgunDomain
})

function notify (message) {
  notifier.notify({
    title: 'Liqui Interest Checker',
    message,
    wait: true // doesn't seem to work
  })
}

function email (subject, message) {

  // only send one email every 10 minutes
  if ((new Date).getTime() - lastEmailSent < 1000 * 60 * emailThrottleMinutes) {
    return Promise.resolve()
  }

  const data = {
    from: 'Liqui Notifier <me@samples.mailgun.org>',
    to: 'raineorshine@gmail.com',
    subject: subject,
    text: message
  }

  return new Promise((resolve, reject) => {
    mailgun.messages().send(data, (err, body) => {
      if (err) return reject(err)
      lastEmailSent = (new Date()).getTime()
      print('Email sent')
      resolve(body)
    })
  })
}

function handleJsonResponse (res) {
  if (res.status >= 400) {
    throw new Error('Bad response from server')
  }
  return res.json()
}

function checkLiqui () {
  return fetch(liquiInterestRecordsUrl)
    .then(handleJsonResponse)
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
      return email('Liqui Loan Available', message)
    } else {
      print('No loans available.')
    }
  })
  .catch(error)
  .then(() => {
    setTimeout(checkLiquiRepeat, pollingDelaySeconds * 1000)
  })
}

module.exports = input => {
  print('Fetching Interest Records...')
  checkLiquiRepeat()
}
