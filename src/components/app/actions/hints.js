export default {
  hideHint (hint) {
    var _ = this

    _.app.hints.push(hint)
    _.app.store.setItem(
      'hints',
      JSON.stringify(_.app.hints)
    )
  },

  hintIsShown (hint) {
    var _ = this

    return _.app.hints.indexOf(hint) === -1
  }
}
