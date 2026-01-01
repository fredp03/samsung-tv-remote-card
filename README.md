# Samsung TV Remote Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![GitHub Release](https://img.shields.io/github/v/release/fredp03/samsung-tv-remote-card?style=flat-square)](https://github.com/fredp03/samsung-tv-remote-card/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A sleek, modern Samsung TV remote card for Home Assistant. Features a beautiful design inspired by physical Samsung remotes with D-pad navigation, power, home, back, play/pause, and mute controls.

![Samsung TV Remote Card](https://via.placeholder.com/212x468/373737/D5D5D5?text=Remote+Preview)

## Features

- 🎨 **Beautiful Design** - Sleek dark theme matching Samsung's aesthetic
- 📺 **Samsung TV Optimized** - Uses native Samsung TV key commands
- 🔘 **D-Pad Navigation** - Up, Down, Left, Right, and Center Select (OK) controls
- ⚡ **Essential Controls** - Power, Home, Back, Play/Pause, and Mute
- 📐 **Scalable** - Adjust the remote size from 50% to 200%
- 📳 **Haptic Feedback** - Vibration feedback on button presses (requires HA companion app)
- 🔧 **Visual Editor** - Full configuration UI support
- 🔌 **Multiple Integration Support** - Works with standard Samsung TV integration and SamsungTV Smart custom integration

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Click the three dots in the top right corner
3. Select "Custom repositories"
4. Add this repository URL: `https://github.com/fredp03/samsung-tv-remote-card`
5. Category: **Dashboard**
6. Click "Add"
7. Find "Samsung TV Remote Card" in HACS and click "Download"
8. Restart Home Assistant

### Manual Installation

1. Download `samsung-tv-remote-card.js` from the [latest release](https://github.com/fredp03/samsung-tv-remote-card/releases)
2. Copy it to your `config/www/` directory
3. Add the resource in Home Assistant:
   - Go to **Settings** → **Dashboards** → **Resources** (three dots menu)
   - Add Resource: `/local/samsung-tv-remote-card.js`
   - Resource type: JavaScript Module
4. Restart Home Assistant

## Configuration

### Using the Visual Editor

1. Add a new card to your dashboard
2. Search for "Samsung TV Remote Card"
3. Select your Samsung TV entity
4. Adjust the scale if desired
5. Save

### YAML Configuration

```yaml
type: custom:samsung-tv-remote-card
entity: media_player.samsung_tv
haptic: true
use_samsungtv_smart: false
```

**Custom Sizing Example**:
```yaml
type: custom:samsung-tv-remote-card
entity: media_player.samsung_tv
width: 200px
height: 500px
scale: 0.9
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **Required** | Your Samsung TV `media_player` or `remote` entity |
| `haptic` | boolean | `true` | Enable haptic feedback (vibration) on button presses |
| `use_samsungtv_smart` | boolean | `false` | Enable if using the [SamsungTV Smart Component](https://github.com/ollo69/ha-samsungtv-smart) custom integration |
| `width` | string | `100%` | Card width (e.g., `200px`, `50%`, `auto`) |
| `height` | string | `100%` | Card height (e.g., `500px`, `100%`, `auto`) |
| `max_width` | string | `none` | Maximum width constraint |
| `min_height` | string | `400px` | Minimum height constraint |
| `scale` | number | `1` | Scale the remote (e.g., `0.8` = 80%, `1.2` = 120%) |

### CSS Custom Properties

For advanced styling, you can also set these CSS custom properties from outside the card (e.g., via card-mod or theme):

```css
--samsung-remote-width: 200px;
--samsung-remote-height: 500px;
--samsung-remote-max-width: 300px;
--samsung-remote-min-height: 400px;
--samsung-remote-scale: 0.9;
```

**Example with card-mod**:
```yaml
type: custom:samsung-tv-remote-card
entity: media_player.samsung_tv
card_mod:
  style: |
    :host {
      --samsung-remote-width: 180px;
      --samsung-remote-height: 450px;
    }
```

## Supported Keys

The remote sends the following Samsung TV commands:

| Button | Key Command |
|--------|-------------|
| Power | `KEY_POWER` |
| Up | `KEY_UP` |
| Down | `KEY_DOWN` |
| Left | `KEY_LEFT` |
| Right | `KEY_RIGHT` |
| Enter (D-pad center) | `KEY_ENTER` |
| Back | `KEY_RETURN` |
| Home | `KEY_HOME` |
| Play/Pause | `KEY_PLAY` (or `media_player.media_play_pause`) |
| Mute | `KEY_MUTE` |

## Entity Types

### Remote Entity (Recommended)

If you use a `remote.` entity, commands are sent via `remote.send_command`:

```yaml
type: custom:samsung-tv-remote-card
entity: remote.samsung_tv
```

### Media Player Entity

If you use a `media_player.` entity:

1. **Standard Samsung TV Integration**: The card will try to find the corresponding `remote.` entity automatically
2. **SamsungTV Smart Integration**: Enable `use_samsungtv_smart: true` to use the custom integration's `samsungtv_smart.send_key` service

```yaml
type: custom:samsung-tv-remote-card
entity: media_player.samsung_tv
use_samsungtv_smart: true
```

## Sizing Examples

```yaml
# Small remote with fixed dimensions
type: custom:samsung-tv-remote-card
entity: remote.samsung_tv
width: 180px
height: 450px

# Scaled down remote (80%)
type: custom:samsung-tv-remote-card
entity: remote.samsung_tv
scale: 0.8

# Scaled up remote (120%)
type: custom:samsung-tv-remote-card
entity: remote.samsung_tv
scale: 1.2

# Constrained width with auto height
type: custom:samsung-tv-remote-card
entity: remote.samsung_tv
max_width: 250px
height: auto
```

## Troubleshooting

### Commands not working

1. **Check entity type**: For best results, use a `remote.` entity
2. **Verify integration**: Make sure your Samsung TV is properly connected
3. **Check Developer Tools**: Go to Developer Tools → Services and test `remote.send_command` manually
4. **SamsungTV Smart**: If using the custom integration, enable `use_samsungtv_smart: true`

### Card not appearing

1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Check browser console (F12) for errors
3. Verify the resource is loaded in Settings → Dashboards → Resources

## Credits

- Design inspired by the [Universal Remote Card](https://github.com/Nerwyn/universal-remote-card) approach
- Samsung TV key mappings from the Home Assistant [Samsung TV integration](https://www.home-assistant.io/integrations/samsungtv/)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
