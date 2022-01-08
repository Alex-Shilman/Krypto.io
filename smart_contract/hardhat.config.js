require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/QSW2ThEhD2FGAZ7gHh9-ETcAxOXSCMSK',
      accounts: [
        'bc91da60f8aa32fc78558e7e933e364fd90216191f2aa02226ac5afa58f7add9'
      ]
    }
  }
}