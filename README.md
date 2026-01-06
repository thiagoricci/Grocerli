# 🛒 Grocerli - Smart Grocery Shopping Assistant

A modern grocery shopping application that helps you create and manage shopping lists with ease. Simply type your grocery needs and let Grocerli handle the rest!

![Grocerli Demo](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Grocerli+Demo)

## ✨ Key Features

### 🎯 **Easy Text Input**

- **Simple Interface**: Type items directly into the input field
- **Quick Entry**: Press Enter to add items instantly
- **Smart Parsing**: Automatically extracts quantities from your input
- **Duplicate Detection**: Prevents adding the same item twice

### 🛒 **Dual-Mode Operation**

- **Editing Mode**: Create and manage your shopping list
- **Shopping Mode**: Check off items as you shop with progress tracking
- **Flexible Editing**: Edit item names or remove items anytime
- **Add While Shopping**: Continue adding items even in shopping mode

### 🎉 **Enhanced User Experience**

- **Celebration System**: Audio celebration when shopping list is completed
- **Visual Feedback**: Smooth animations and real-time updates
- **Progress Tracking**: Live completion counter and percentage display
- **History Management**: Save and reload previous shopping lists (up to 10 lists)
- **Local Storage**: Your lists persist between sessions

### 📱 **Modern Interface**

- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Beautiful Animations**: Smooth transitions and micro-interactions
- **Accessibility**: Full keyboard navigation and screen reader support
- **Clean UI**: Streamlined interface with no unnecessary visual clutter
- **Category Organization**: Items automatically grouped by category with emojis

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern web browser

### Installation

1. **Clone the repository**

   ```bash
   git clone <YOUR_GIT_URL>
   cd grocerli
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📋 Usage Guide

### Getting Started

1. **Add Items**: Type items in the input field and press Enter
2. **Edit List**: Click on any item to edit its name
3. **Remove Items**: Click the delete button to remove items
4. **Start Shopping**: Click "Start Shopping" when your list is ready
5. **Check Off Items**: Click items to mark them as completed
6. **Complete**: Enjoy the celebration when your list is done!

### Tips for Best Results

- **Type clearly** and press Enter to add items
- **Include quantities** naturally: "2 apples", "a dozen eggs"
- **Use compound words**: "peanut butter", "orange juice"
- **Edit items** by clicking on them to correct mistakes
- **Save time** by using the history tab to reload previous lists

### Supported Item Types

- **Fresh Produce**: fruits, vegetables, herbs
- **Dairy**: milk, cheese, yogurt, eggs
- **Bakery**: bread, pastries, baked goods
- **Meat & Seafood**: beef, chicken, fish, seafood
- **Pantry Staples**: canned goods, pasta, rice, beans
- **Beverages**: juices, sodas, water, coffee, tea
- **Household**: cleaning supplies, paper products
- **Personal Care**: toiletries, medications

### Shopping List Features

- **Editing Mode**: Create and modify your shopping list
- **Shopping Mode**: Check off items with progress tracking
- **Item Management**: Edit names, remove items, add quantities
- **History**: Save up to 10 completed shopping lists
- **Persistence**: Lists automatically saved to local storage

## 🏗️ Technical Architecture

### Frontend Stack

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development with enhanced developer experience
- **Vite** - Lightning-fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **shadcn/ui** - High-quality, accessible component library
- **Lucide React** - Beautiful icon library

### Core Technologies

- **React Hooks** - useState, useEffect, useCallback for state management
- **Local Storage** - Persistent shopping list history
- **Web Audio API** - Celebration sound effects
- **Context API** - State management for shopping data

### Performance Optimizations

- **Debounced Processing** - Optimized input handling
- **Mobile-First** - Responsive design with mobile optimizations
- **Efficient Rendering** - Optimized component updates
- **Clean State Management** - Proper cleanup prevents memory leaks

## 🎨 Features in Detail

### Text Input System

- **Quantity Extraction**: Automatically detects numeric and word-based quantities
- **Smart Parsing**: Handles "2 apples", "a dozen eggs", "three bananas"
- **Duplicate Prevention**: Warns when trying to add existing items
- **Quick Entry**: Press Enter to add items instantly

### Shopping List Management

- **Edit Items**: Click on any item to modify its name
- **Remove Items**: Delete items you no longer need
- **Progress Tracking**: Visual progress bar shows completion status
- **Auto-Save**: Lists automatically saved to local storage

### History System

- **Save Lists**: Completed lists automatically saved to history
- **Load Lists**: Reload any previous list from history
- **Delete Lists**: Remove individual lists from history
- **Clear History**: Remove all saved lists at once

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/your-username/grocerli.git
cd grocerli

# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev) for rapid prototyping
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)

## 🆘 Support

Having issues? Check out our [Troubleshooting Guide](TROUBLESHOOTING.md) or create an issue on GitHub.

---

**Made with ❤️ for smarter grocery shopping**
