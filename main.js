// Function to handle selling a car
function sellCar(event) {
    const carBrandDiv = event.target.parentElement; // Get the parent div of the button
    const carCountElement = carBrandDiv.querySelector('.car-count'); // Get the car count element
    const carImages = carBrandDiv.querySelectorAll('.car-image'); // Get all car image elements

    let availableCount = parseInt(carCountElement.textContent); // Get the current count of available cars

    if (availableCount > 0) {
        availableCount--; // Decrease the count
        carCountElement.textContent = availableCount; // Update the displayed count

        // If there are still cars available, remove the last image
        if (availableCount > 0) {
            carImages[availableCount].style.display = 'none'; // Hide the last image
        } else {
            // If no cars are available, hide all images (optional)
            carImages.forEach(image => {
                image.style.display = 'none';
            });
        }
    } else {
        alert("No cars available for sale!");
    }
}

// Attach event listeners to all sell buttons
const sellButtons = document.querySelectorAll('.sell-car');
sellButtons.forEach(button => {
    button.addEventListener('click', sellCar);
});