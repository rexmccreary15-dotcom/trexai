# Installing Tesseract.js for Image Analysis

MyAI now supports image analysis! To enable this feature, you need to install the `tesseract.js` package.

## Installation

Run this command in your project directory:

```bash
npm install tesseract.js
```

Or if you're using the batch files, the package should be installed automatically when you run the website.

## What It Does

- **OCR (Optical Character Recognition)**: Extracts text from images and screenshots
- **Image Understanding**: MyAI can now "see" and understand what's in uploaded images
- **Screenshot Analysis**: Perfect for analyzing screenshots, documents, or any image with text

## How to Use

1. Click the image icon next to the chat input
2. Select an image or screenshot
3. Type your question (or just send the image)
4. MyAI will analyze the image and respond based on what it sees!

## Note

The first time you use image analysis, Tesseract.js will download language data (about 1-2 MB). This only happens once and is cached for future use.
