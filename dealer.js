// set customer info 
let customerQueue = [];
let customerBMW = [];
let customerPorsche = [];
let customerVolkswagen = [];
let customerAudi = [];

let customerIndex = 0;
let customersServed = 0;
let carsSold = 0;
let totalCollected = 0;

var brandlist = new Array("Porsche","Volkswagen","Audi","BMW");

let carsAvailable = {
    Porsche: 4,
    Volkswagen: 6,
    Audi: 5,
    BMW: 3
};

let carsPrice = {
	Porsche: 650000.00,
	Volkswagen: 180000.00,
	Audi: 300000.00,
	BMW: 250000.00
};

// add client
function newClient(){

	console.log(customerIndex);

	if(customerQueue.length + 1 <= 10){

		// set random client profile
		var preference = Math.floor((Math.random()*4));
		var client = Math.floor((Math.random()*10)+1);
		$("#clients_queue").append('<div class="client client_'+ client +'" data-index="'+customerIndex+'" data-preference="' + brandlist[preference] + '" ><span class="preference">Client for '+brandlist[preference]+'</span></div>'); customerQueue.push(customerIndex++);
		makeClientsDraggable();
	}
	else{

		alert(`Sorry, max 10 customers at any one time.`);
	}
	
}

// remove client
function exitClient(){
	$("#clients_queue .client").first().remove();
	customerQueue.shift();
}

function moveClient(carBrand){

	let clientAvatar = $("#clients_queue .client").first().remove();
	let clientInfo = customerQueue.shift();

	$("#"+ carBrand.toLowerCase()).append(clientAvatar); 

	if(carBrand == "BMW"){customerBMW.push(clientInfo);}
	else if(carBrand == "Volkswagen"){customerVolkswagen.push(clientInfo);}
	else if(carBrand == "Porsche"){customerPorsche.push(clientInfo);}
	else if(carBrand == "Audi"){customerAudi.push(clientInfo);}
	else{alert("Error")};

}

// show car
function showCar() {

    if (customerQueue.length > 0) {

        // const customer = customerQueue.shift();
        const carBrand = prompt("Enter preferred car brand (Porsche, Volkswagen, Audi, BMW):");
        
        if (carsAvailable[carBrand] > 0) {

			moveClient(carBrand);
			
        } 
		else {

			// error purchase car
            alert(`Sorry, ${carBrand} is sold out!`);
        }

        updateStatistics();
    } 
	else {

        alert("No customers in queue!");
    }
}

function purchaseCar(){

	// purchase car
    const carBrandDiv = event.target.parentElement; // Get the parent div of the button
	customersServed++;
	// totalCollected += carsPrice[carBrand]; 
	alert(`Customer purchased a ${carBrandDiv.id}!`);
	updateStatistics();
	cashier(carBrandDiv.id)

}

function cashier(carBrand){
	carsSold++;
	carsAvailable[carBrand]--;
}

// client click profile
$(document).on('click', '.place .client', function() {
	let clientName = $(this).data('index'); // Get the client name from data attribute
	let userChoice = prompt(`Do you want to buy a car or exit? Type "buy" to purchase or "exit" to leave.`);

	if (userChoice && userChoice.toLowerCase() === "buy") {
		// Handle the purchase logic here
		purchaseCar()
		alert(`${clientName} has chosen to buy a car!`);

	} 
	else if (userChoice && userChoice.toLowerCase() === "exit") {
		exitClient();
	} 
	else {
		alert("Invalid choice. Please type 'buy' or 'exit'.");
	}
});


function makeClientsDraggable() {

    $(".client").draggable({

        revert: function(dropped) {
            // If the item was not dropped on a valid droppable, revert to original position
            return !dropped;

        },

        start: function(event, ui) {

            // Store the original position
            $(this).data("originalPosition", ui.position);

        }

    });


    $(".place").droppable({

        accept: ".client",
        drop: function(event, ui) {
            var clientAvatar = ui.draggable;
            var carBrand = $(this).attr("id");
            var clientPreference = clientAvatar.data("preference");

            if (clientPreference.toLowerCase() === carBrand) {
                clientAvatar.remove();
                moveClientToBrand(carBrand);
                purchaseCar(carBrand);
                alert("Success! Client placed in " + carBrand);

            } else {
                // If the drop is not valid, revert to the original position
                var originalPosition = clientAvatar.data("originalPosition");
                clientAvatar.animate({
                    top: originalPosition.top,
                    left: originalPosition.left
                }, 500); // Animate back to original position
                alert("This client prefers a different brand! " + clientPreference + " vs " + carBrand);
            }
        }
    });
}

function updateStatistics(){

	document.getElementById('clients_served').textContent = `${customersServed} clients`;
	document.getElementById('cars_sold').textContent = `${carsSold} cars`;
	document.getElementById('amount').textContent = `$ ${totalCollected}`;
}

$("document").ready(function(e) {
	updateStatistics();
});
