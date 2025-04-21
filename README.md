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

### 🔒 Security & Storage
- All logic runs on the client-side (no server required)
- Messages can be encrypted using Web Crypto API when a passphrase is used
- Capsules are stored in browser localStorage
- Small capsule link generated for easy sharing (uses URL fragment)

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

No server or installation is required! All data is stored in the browser's localStorage.

## Technical Details

- Built with vanilla JavaScript, HTML, and CSS
- Uses the Web Crypto API for secure message encryption
- Canvas-based animations are optimized for performance
- Fully responsive design that works on mobile and desktop
- No external dependencies or frameworks required

## Browser Compatibility

This application works best in modern browsers that support the Web Crypto API and modern JavaScript features:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available under the MIT License.

## Created By

Made with ❤️ by [Your Name] 