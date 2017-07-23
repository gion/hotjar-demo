class Player {
  constructor() {

    this.reset()

    let iframeWindow = $('iframe').get(0).contentWindow

    this.dom = {
      player: $('#player'),
      iframeContainer: $('#iframe'),
      iframe: $('iframe'),
      progress: $('#progress'),
      graphics: $('#graphics'),
      cursor: $('#cursor'),
      iframeWindow: iframeWindow,
      iframeElement: selector => $(iframeWindow.document.querySelector(selector))
    }

    this.addAction = this.addAction.bind(this)
    this.resize = this.resize.bind(this)

    this.addEventHandlers()
  }

  get paused() {
    return this._paused
  }

  set paused(value) {
    if (this._paused === value) {
      return
    }

    this._paused = value

    this.timeline.paused(this._paused)
    this.dom.player.toggleClass('paused', this._paused)
  }

  addEventHandlers() {
    $(window).on('resize', e => this.resize())

    this.dom.player.on('click', () => this.paused = !this.paused)
    this.dom.progress
      .on('click', e => e.stopPropagation())
      .on('change', () => this.timeline.progress(this.dom.progress.val() / 100))
  }

  onUpdate() {
    let progress = this.timeline.progress().toFixed(2) * 100
    let currentTime = this.timeline.time().toFixed(0)
    let formatTime = seconds => {
      let m = (seconds / 60).toFixed(0)
      let s = seconds % 60

      // add the first zero to the seconds
      if (s <= 9) {
        s = '0' + s
      }

      return `${m}:${s}`
    }

    this.dom.progress.val(progress)
    this.dom.player
      .attr('data-progress', progress)
      .attr('data-current-time', formatTime(currentTime))
  }

  onComplete() {
    this.timeline.restart(0)
    this.paused = true

    console.log('DONE!');
  }

  reset() {
    this._paused = true

    this.timeline = new TimelineMax({
      paused: this.paused,
      onUpdate: this.onUpdate.bind(this),
      onComplete: this.onComplete.bind(this)
    })
  }

  // adds a new action into the timeline
  addAction(action) {
    let tween = this._tweenFactory(action)

    if (tween) {
      this.timeline.add(tween)
    }
  }

  // parse and and add duration to actions
  processActions(actions) {

    let isValidAction = action => {
      // if there's no action to validate
      if (!action) {
        return false
      }

      // if there's no data
      if (Object.keys(action.data).length === 0) {
        return false
      }

      // let's make sure it's one of the supported types
      return action.type === 'resize' || action.type === 'mousemove' || action.type === 'click' || action.type === 'scroll'
    }

    return actions
      .filter(isValidAction)
      .map((action, i) => Object.assign({}, action, {
        duration:  (actions[i].timestamp - actions[i == 0 ? 0 : i - 1].timestamp) / 1000
      }))
  }

  loadActions(key) {
    let jsonActions = localStorage.getItem(key)

    if (!jsonActions) {
      throw `No actions found for ${key}!`
    }

    let actions = JSON.parse(jsonActions)

    this.actions = this.processActions(actions)
    this.actions.forEach(this.addAction)
  }

  _tweenFactory(action) {
    if (!action || !action.data) {
      return null
    }

    switch(action.type) {

      case 'mousemove':
        return TweenMax.to(this.dom.cursor, action.duration, {
          css: action.data
        })

      case 'click':
        return TweenMax.to(this.dom.cursor, action.duration, {
          onStart: () => {
            $(action.target).trigger('click')
            this.dom.cursor.addClass('clicked')
          },
          onComplete: () => this.dom.cursor.removeClass('clicked')
        })

      case 'scroll':
        return TweenMax.to(this.dom.iframeElement(action.target), action.duration, {
          scrollTo: action.data
        })

      case 'resize':
        return TweenMax.to({x: 0}, 0, {x: 1, onComplete:() => this.resize(action.data)})
    }

    return null;
  }

  resize(iframeSize) {
    if (iframeSize) {
      this.iframeSize = iframeSize
    }

    if (!this.iframeSize) {
      return
    }

    let playerWidth = this.dom.player.width()
    let playerHeight = this.dom.player.height()
    let scaleFactor = playerWidth / this.iframeSize.width
    let newStyle = {
      width: this.iframeSize.width,
      height: this.iframeSize.height,
      transform: `scale(${scaleFactor})`
    }

    this.dom.iframe.css(newStyle)
    this.dom.graphics.css(newStyle)

    // maintain the aspect ratio
    this.dom.player.css({
      height: this.iframeSize.height * playerWidth / this.iframeSize.width,
      transform: `scale(${Math.min(1, 1 / scaleFactor)})`
    })
  }
}

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