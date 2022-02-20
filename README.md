# vue-verovio-canvas

A Vue 3 component to display music scores with verovio.

## Props

| Prop             | Default      | Description                                        |
|------------------|--------------|----------------------------------------------------|
| url              | –            | URL of the score file to display                   |
| scale            | 40           | Scale of the output in percent (min: 1; max: 1000) |
| viewMode         | `horizontal` | `page`, `horizontal`, `vertical`                   |
| pageMargin       | 0            | Change all page margins at once                    |
| pageMarginTop    | 0            | Set page margin top                                |
| pageMarginRight  | 0            | Set page margin right                              |
| pageMarginBottom | 0            | Set page margin bottom                             |
| pageMarginLeft   | 0            | Set page margin left                               |


## Info

If you want to display the whole score at once with the available width of the
parent container element and the hight of the score adjusted to the required
height use the `vertical` view mode:

```
<VerovioCanvas url="/file.mei" view-mode="vertical" />
```

Or use the `horizontal` view mode to make the score scrollable on the x-axis:

```
<VerovioCanvas url="/file.mei" view-mode="horizontal" />
```

If you want to use pagination wrap the `<VerovioCanvas />` component in a
container element with specific dimensions:

```
<div style="width: 640px; height: 360px">
    <VerovioCanvas url="/file.mei" view-mode="page" />
</div>
```

You can also use the wrapper element with specific dimensions if you want to use
`vertical` view mode but with scrollable on the y-axis.
