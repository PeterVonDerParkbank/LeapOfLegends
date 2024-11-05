export default class AllowOrientationButton {
    constructor(x, y, width, height, text) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.element = document.createElement('button');
        this.element.innerText = text;
        this.element.style.position = 'absolute';
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
        this.element.style.width = `${width}px`;
        this.element.style.height = `${height}px`;
        this.element.style.backgroundColor = '#4CAF50'; // Background color
        this.element.style.color = 'white'; // Text color
        this.element.style.border = 'none'; // No border
        this.element.style.borderRadius = '5px'; // Rounded corners
        this.element.style.fontSize = '16px'; // Font size
        this.element.style.cursor = 'pointer'; // Pointer cursor on hover
        this.element.style.display = 'none'; // Hide button initially
        document.body.appendChild(this.element);
    }

    display() {
        this.element.style.display = 'block';
    }

    hide() {
        this.element.style.display = 'none';
    }

    addClickListener(callback) {
        this.element.addEventListener('click', callback);
    }
}