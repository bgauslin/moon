# Moon Phase

[Moon.Gauslin.com](https://moon.gauslin.com)

They say that people who stare at the moon are a little crazy,<sup>*</sup> and I’m okay with that.

![Moon Phases](https://assets.gauslin.com/images/screenshots/moon-phase.png?v=1)

This project visualizes the relationship between a day’s lunar phase and sunrise, sunset, moonrise, and moonset times via polar graphs that map 360 degrees to 24 hours.

* A [single page application][spa] in tandem with the [GeoLocation API][geolocation] and a [US Naval Observatory API][usno_api] fetch [sun and moon data][fetch] for a [given day][day] at a [particular location][location].
* Times are then [converted into degrees][degrees] and rendered into the DOM as [SVG arcs][arcs] with [SVG labels][labels] via JavaScript.
* The photo of the current [moon phase][moon_phase] is a [single file containing 26 images][sprite] and is [positioned via an HTML attribute][sprite_position] and [CSS][sprite_css]. (It’s sort of like a background sprite, but it’s responsive and scales with the viewport.)
* [Previous and next navigation][prev_next] is configured [relative to the current date][controls_date] being displayed, and a particular date and location can be [bookmarked][bookmark].

---

<sup>*</sup> The words “lunar” and “lunatic” share the same _luna_ root, after all.


[spa]: https://github.com/bgauslin/moon/blob/7d3f32bd0e6e5548e2c5de5953aba803c51efbb6/source/js/modules/EventHandler.js#L22-L36
[geolocation]: https://github.com/bgauslin/moon/blob/7d3f32bd0e6e5548e2c5de5953aba803c51efbb6/source/js/modules/UserLocation.js#L146-L174
[usno_api]: https://aa.usno.navy.mil/data/docs/api.php#rstt
[fetch]: https://github.com/bgauslin/moon/blob/b17f8b28e15044b4062902b6e45f2c33ee9e6b7d/source/js/modules/SunAndMoonData.js#L212-L228
[day]: https://github.com/bgauslin/moon/blob/b17f8b28e15044b4062902b6e45f2c33ee9e6b7d/source/js/modules/DateTimeUtils.js#L32-L52
[location]: https://github.com/bgauslin/moon/blob/b17f8b28e15044b4062902b6e45f2c33ee9e6b7d/source/js/modules/UserLocation.js#L253-L269

[degrees]: https://github.com/bgauslin/moon/blob/7d3f32bd0e6e5548e2c5de5953aba803c51efbb6/source/js/modules/DonutChart.js#L209-L218
[arcs]: https://github.com/bgauslin/moon/blob/7d3f32bd0e6e5548e2c5de5953aba803c51efbb6/source/js/modules/DonutChart.js#L117-L181
[labels]: https://github.com/bgauslin/moon/blob/b17f8b28e15044b4062902b6e45f2c33ee9e6b7d/source/js/modules/DonutChart.js#L193-L201

[moon_phase]: https://github.com/bgauslin/moon/blob/b17f8b28e15044b4062902b6e45f2c33ee9e6b7d/source/js/modules/RenderUtils.js#L243-L274
[sprite]: https://github.com/bgauslin/moon/blob/master/source/img/moon-phases-26-240.min.jpg
[sprite_position]: https://github.com/bgauslin/moon/blob/7d3f32bd0e6e5548e2c5de5953aba803c51efbb6/source/js/modules/SunAndMoonData.js#L139-L167
[sprite_css]: https://github.com/bgauslin/moon/blob/7d3f32bd0e6e5548e2c5de5953aba803c51efbb6/source/stylus/moon/photo.styl#L37-L39

[prev_next]: https://github.com/bgauslin/moon/blob/b17f8b28e15044b4062902b6e45f2c33ee9e6b7d/source/js/modules/Controls.js#L20-L30
[controls_date]: https://github.com/bgauslin/moon/blob/b17f8b28e15044b4062902b6e45f2c33ee9e6b7d/source/js/modules/Controls.js#L86-L95
[bookmark]: https://moon.gauslin.com/2019/7/4/Boulder,+CO
