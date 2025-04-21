# UnwrapLater - Time Capsule Messages

UnwrapLater is a web application that lets you create beautiful time capsule messages that can only be opened at a specific time. Create messages for special occasions, surprise loved ones, or send future you a note!

## Features

### 🎭 Themed Animations
- **User-selectable themes**: 💖 Love, 🤝 Best Friends, 🎂 Birthday, 🎉 Celebration, plus a Custom Theme option
- Each theme includes a unique canvas/CSS animation, background, and color scheme
- Confetti effects for Love, Birthday, and Celebration themes
- Custom Theme lets users define background color/image, font style, and optional animation

### ⏳ Real-Time Unlock Timer
- If the selected unlock time is more than 1 minute from now, a real-time countdown timer appears
- Unlocks only when the timer hits zero
- If less than a minute, unlocks instantly

### 🔒 Security & URL-Based Storage
- All logic runs on the client-side (no server required)
- Messages can be encrypted using Web Crypto API when a passphrase is used
- **Capsule data is embedded directly in the URL** (using base64 encoding in the URL fragment)
- Share links work on any device without requiring server storage or databases

### 🎨 UI/UX Features
- Live theme preview when selecting a theme
- Interactive preview of unlock screen before final capsule creation
- Hover animations, smooth transitions, modern fonts, responsive layout
- Dark/Light mode toggle

### 🧪 Bonus Features
- Ability to export/download capsule (JSON)
- Canvas/SVG-based particles and confetti (efficient, responsive)
- Drag-to-reveal interactions for message opening

## Getting Started

1. Open `index.html` in any modern web browser
2. Create your time capsule message
3. Set the unlock time and choose a theme
4. Click "Create Time Capsule"
5. Share the generated link with others

No server or installation required! All data is stored directly in the URL.

## Demo

You can try the application at [https://your-username.github.io/unwraplater](https://your-username.github.io/unwraplater)

## Technical Details

- Built with vanilla JavaScript, HTML, and CSS
- Uses the Web Crypto API for secure message encryption
- Canvas-based animations are optimized for performance
- All data is stored in the URL fragment (after the # symbol)
- No external dependencies, frameworks, or servers required

## How It Works

1. **Creating a capsule**: When you create a time capsule, the app bundles your message, unlock time, and theme settings into a JSON object.
2. **Embedding data**: This data is stringified, encoded to base64, and added to the URL as a fragment.
3. **Sharing**: When you share this URL, all the capsule data travels with it - no server needed!
4. **Decoding**: When someone opens the link, the app decodes the URL fragment to retrieve the original data.
5. **Unlock logic**: The app checks if it's time to unlock the message yet, and either shows a countdown timer or reveals the message.

## Browser Compatibility

This application works best in modern browsers that support the Web Crypto API and modern JavaScript features:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Created By

Made with ❤️ by [Your Name] 