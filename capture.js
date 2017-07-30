class Capturer {
  constructor() {
    console.log('capturer enabled')
    const processActionDebounceTime = 100

    this.id = +new Date

    this._actions = []

    this.dom = {
      window: $(window),
      document: $(document),
      body: $('body'),
      redirectLink: $('section:last a')
    }

    this.dom.redirectLink.attr('href', `view.html#actions-${this.id}`)

    this.addAction = this.addAction.bind(this)
    this.processAction = this.processAction.bind(this)
    this.debouncedProcessAction = _.throttle(this.processAction, processActionDebounceTime, true)

    this.captureBrowserResize = this.captureBrowserResize.bind(this)
    this.captureBlurAction = this.captureBlurAction.bind(this)
    this.captureFocusAction = this.captureFocusAction.bind(this)
    this.captureKeyAction = this.captureKeyAction.bind(this)
    this.captureMouseAction = this.captureMouseAction.bind(this)
    this.captureScrollAction = this.captureScrollAction.bind(this)

    this.addEventHandlers()
    this.captureBrowserResize()
  }

  set actions(actions) {
    // save to localstorage

    localStorage.setItem(`actions-${this.id}`, JSON.stringify(actions))

    this._actions = actions
  }

  get actions() {
    return this._actions
  }

  get lastAction() {
    return this.actions[this.actions.length - 1]
  }

  set lastAction(action) {
    // it's considered best to use immutable data, so...
    this.actions = this.actions.slice(0, -1).concat(action)
  }

  addEventHandlers() {
    this.dom.window
      .on('resize.capture', this.captureBrowserResize)
      .on('mousemove.capture', e => this.captureMouseAction(e, 'mousemove'))

      // the following event handlers are delegated to the window
      // even though they are originally triggered on different elements
      // .on('click.capture', '*', e => this.captureMouseAction(e, 'click'))
      .on('focus.capture', '*', this.captureFocusAction)
      .on('blur.capture', '*', this.captureBlurAction)
      .on('keypress.capture', '*', e => this.captureKeyAction(e, 'keypress'))

      // the scroll event can't be delegated in jQuery because it normally doesn't bubble
      // thus... good ol' addEventListener with capture flag turned on does the trick
      document.addEventListener('scroll', this.captureScrollAction, true)
      document.addEventListener('click', e => this.captureMouseAction(e, 'click'), true)
      document.addEventListener('keypress', e => this.captureKeyAction(e, 'keypress'), true)
  }

  removeEventHandlers() {
    this.window.off('.capture')
    document.removeEventListener('scroll', this.captureScrollAction, true)
    document.removeEventListener('click', this.captureScrollAction, true)
    document.removeEventListener('keypress', this.captureScrollAction, true)
  }

  addAction(action) {
    // add a timestamp to the action
    let newAction = Object.assign({}, action, {timestamp: +new Date})

    console.log('newAction', newAction)

    this.debouncedProcessAction(newAction)
  }

  processAction(action) {
    let isSameAsLastAction = this.lastAction && this.lastAction.type === action.type
    let isMergebleAction = 'scroll resize mousemove'.split(' ').indexOf(action.type) !== -1
    let isNotFarApart = this.lastAction && action.timestamp - this.lastAction.timestamp > 500

    // if the action is the same type as the last processed one
    // and if it's a scroll, resize or mousemove
    // and if it didn't pass more than 300ms
    // maybe we should merge/skip/overwrite
    if (isSameAsLastAction && isMergebleAction && isNotFarApart) {

      // overwrite the previous action
      this.lastAction = action
      return
    }

    // add the action to the list
    this.actions = this.actions.concat(action)
  }

  captureBrowserResize () {
    this.addAction({
      type: 'resize',
      data: {
        height: this.dom.window.height(),
        width: this.dom.window.width()
      }
    })
  }

  captureMouseAction(e, type) {
    this.addAction({
      type: type,
      data: {
        x: e.pageX,
        y: e.pageY
      }
    })
  }

  captureScrollAction(e) {
    let target = e.target

    if (!target || target === document) {
      target = this.dom.body.get(0)
    }

    this.addAction({
      type: 'scroll',
      target: $(target).getSelector()[0],
      data: {
        y: target.scrollTop,
        x: target.scrollLeft
      }
    })
  }

  captureFocusAction(e) {
    this.addAction({
      type: 'focus',
      target: $(e.target).getSelector()[0],
      data: {}
    })
  }

  captureBlurAction(e) {
    this.addAction({
      type: 'blur',
      target: $(e.target).getSelector()[0],
      data: {}
    })
  }

  captureKeyAction(e, type) {
    let target = e.target

    this.addAction({
      type: type,
      target: $(target).getSelector()[0],
      data: {
        value: target.value
      }
    })
  }
}