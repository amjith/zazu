module.exports = (pluginContext) => {
  return {
    respondsTo: (query) => {
      return !query.match(/^(egg|food )/) && query.length > 0
    },
    search: (query, env = {}) => {
      return new Promise((resolve, reject) => {
        resolve([
          {
            icon: 'fa-lightbulb-o',
            title: 'You typed: "' + query + '"',
            subtitle: 'Action to copy to clipboard',
            value: query,
          },
        ])
      })
    },
  }
}
