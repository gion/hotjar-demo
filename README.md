# hotjar-demo

### Description:
This project aims to reproduce [Hotjar](https://www.hotjar.com/)'s "record" functionality.
It's not intended to be a fully working app, it's just a prototype that should allow further investigations/conclusions for this kind of feature.

### Disclaimer:
I intentionally didn't use any modern stack (no react/angular, no gulp or webpack and no other linters and preprocessors of any kind) in order to focus on fast iterations rather than setting up bullet proof project.

### How to use:
This *project* has 2 parts:
 - [gathering data from a page](https://gion.github.io/hotjar-demo/)
 - [viewing that data](https://gion.github.io/hotjar-demo/view.html)

For the first part, you need to head to [the root page](https://gion.github.io/hotjar-demo/) of the project and supply some interactions with the page (click, scroll, type stuff, resize...), try to simulate a normal user.

The *fun* part happens when you try to view any previous recorded user activity by going to [the view page](https://gion.github.io/hotjar-demo/view.html). Here you can select which recording you want to see and control it like a video (play/pause/seek).
You should see an exact replica of how you've previously interacted with the first page.
