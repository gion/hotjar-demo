
class App {
  constructor() {
    this.addEventHandlers()
  }

  init() {
    this.player = new Player()

    this.getActionKeys().forEach(k => {
      let date = new Date(+k.split('-')[1]).toString()

      $(`<li><a href="#${k}">${date}</a> | <a class="delete-actions" data-actions="${k}" href="#">delete</a></li>`).appendTo('#menu ul')
    })

    this.handleHashChange()
  }

  addEventHandlers() {
    $(document)
      .ready(() => this.init())
      .on('click', 'a.delete-actions', e => {
        let el = $(e.target)
        el.parent().remove()
        localStorage.removeItem(el.data('actions'))
      })

    $(window)
      .on('hashchange', () => this.handleHashChange())
  }

  handleHashChange() {
    let newActionsKey = location.hash.replace(/^#/, '')

    if (!newActionsKey) {
      return
    }

    this.playActions(newActionsKey)
  }

  getActionKeys() {
    return Object.keys(localStorage)
      .filter(k => /^actions-\d+$/.test(k))
  }

  playActions(key) {
    this.player.reset()
    this.player.loadActions(key)
    this.player.paused = false
  }
}

const app = new App()