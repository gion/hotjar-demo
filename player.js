class Player {
  constructor() {
    this._paused = true

    this.timeline = new TimelineMax({
      paused: this.paused,
      onUpdate: this.onUpdate.bind(this),
      onComplete: this.onComplete.bind(this)
    })

    this.dom = {
      player: $('#player'),
      progress: $('#progress')
    }

    this.addEventHandlers()
    this.addAction()
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
    this.dom.player.on('click', () => this.paused = !this.paused)
  }

  onUpdate() {
    let progress = this.timeline.progress().toFixed(2) * 100
    let currentTime = this.timeline.time().toFixed(2)

    this.dom.progress.val(progress)
    this.dom.player
      .attr('data-progress', progress)
      .attr('data-current-time', currentTime)
  }

  onComplete() {
    this.timeline.restart(0)
    this.paused = true

    console.log('DONE!');
  }

  // adds a new action into the timeline
  addAction(action) {
    let tween = TweenMax.to({x: 0}, 2, {x: 100})
    this.timeline.add(tween)
  }

  // draw on the graphic layer
  _drawAction() {

  }

  // apply the action to the iframe
  _doAction() {

  }

  applyAction() {
    this._doAction()
    this._drawAction()
  }
}

const player = new Player()