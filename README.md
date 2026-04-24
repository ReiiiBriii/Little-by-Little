# Little-by-Little

A fast-paced, precision platformer built with Phaser. Master the dash, manipulate gravity, and navigate a world of floating platforms.

## Features

- **Fluid Movement**: Tight controls with acceleration and friction for a responsive feel.
- **Dynamic Physics**: Advanced mechanics including jump-cutting, variable gravity (rise vs. fall), and downward dash bounces.
- **The Dash**: A powerful directional dash that allows for quick navigation and platforming recovery.
- **Expressive Animations**: Custom sprite animations for idling, running, and stopping.
- **Cross-Platform Input**: Full support for both Keyboard and Gamepad controllers.

## Controls

| Action | Keyboard | Gamepad |
| :--- | :--- | :--- |
| **Move Left/Right** | `A` / `D` | Left Stick |
| **Jump** | `W` / `Space` | `A` / `B` Button |
| **Dash** | `Shift` | `X` / `Y` / `R1` / `R2` |
| **Fast Fall / Down Dash** | `S` + `Shift` | Left Stick Down + Dash |

## Tech Stack

- **Engine**: [Phaser](https://phaser.io/)
- **Language**: JavaScript (ESM)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Package Manager**: npm

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)

### Installation

1. Clone the repository.
2. Navigate to the project directory:
   ```bash
   cd Little-by-Little
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the development server:
```bash
npm run dev
```
The game will be available at the local server address provided in your terminal (usually `http://localhost:5173`).

---
*Developed with Phaser.*