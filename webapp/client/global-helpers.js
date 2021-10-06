Template.registerHelper('getBlockExplorerTxLink', (txId) => {
  return `https://test.bithomp.com/explorer/${txId.toUpperCase()}`;
})

Template.registerHelper('getBlockExplorerAddressLink', (address) => {
  return `https://test.bithomp.com/explorer/${address}`;
})
