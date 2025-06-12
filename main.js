$(document).ready(function() {
    // Application state
    const state = {
        brands: ["Porsche", "Volkswagen", "Audi", "BMW"],
        carCounts: {
            Porsche: 4,
            Volkswagen: 6,
            Audi: 5,
            BMW: 3
        },
        prices: {
            Porsche: 650000,
            Volkswagen: 180000,
            Audi: 300000,
            BMW: 250000
        },
        queue: [],
        carSlots: {},
        stats: {
            customersServed: 0,
            carsSold: 0,
            amountCollected: 0
        }
    };

    // Preload car images
    function preloadCarImages() {
        const images = [];
        for (const brand of state.brands) {
            const count = state.carCounts[brand];
            for (let i = 1; i <= count; i++) {
                images.push(`images/${brand.toLowerCase()}_${i}.jpg`);
            }
        }
        
        // Create hidden image elements to preload
        images.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }
    
    // Initialize car slots
    function initializeCarSlots() {
        for (const brand of state.brands) {
            state.carSlots[brand] = [];
            const $brandDiv = $(`#${brand.toLowerCase()}`);
            
            for (let i = 0; i < state.carCounts[brand]; i++) {
                const $slot = $(`<div class="car-slot available" data-brand="${brand}" data-index="${i}">
                                    <div class="car-label">${brand} ${i+1}</div>
                                    </div>`);
                    
                // Set car image
                $slot.css('background-image', `url('images/${brand.toLowerCase()}_${i+1}.jpg')`);
                
                $brandDiv.append($slot);
                state.carSlots[brand].push({
                    element: $slot,
                    occupied: false,
                    sold: false
                });
            }
        }
    }

    // Create a new customer with provided images
    function newClient() {
        if (state.queue.length >= 10) {
            // Queue full, try again later
            setTimeout(newClient, 3000);
            return;
        }
        
        const preference = Math.floor(Math.random() * 4);
        const brand = state.brands[preference];
        const clientNum = Math.floor(Math.random() * 10) + 1;
        
        const clientId = `client-${Date.now()}`;
        const $client = $(`<div class="client" id="${clientId}" data-original-brand="${brand}" data-current-brand="${brand}">
                                <div class="client-label">${brand}</div>
                            </div>`);
        
        // Use the provided client images
        $client.css('background-image', `url('images/client_${clientNum}.jpg')`);
        
        $("#clients-queue").append($client);
        
        state.queue.push({
            id: clientId,
            brand: brand,
            element: $client
        });
        
        // Make the client draggable
        $client.draggable({
            revert: "invalid",
            cursor: "move",
            zIndex: 1000,
            containment: "document",
            start: function() {
                $(this).css('z-index', '1001');
            }
        });
        
        // Set timeout for next customer
        const time = Math.floor(Math.random() * 5000) + 2000;
        setTimeout(newClient, time);
    }

    // Initialize droppable areas
    function initializeDroppables() {
        // Make car slots droppable
        $(".car-slot").droppable({
            accept: ".client",
            hoverClass: "ui-state-hover",
            drop: function(event, ui) {
                const $slot = $(this);
                const brand = $slot.data("brand");
                const slotIndex = $slot.data("index");
                const $client = ui.draggable;
                const clientOriginalBrand = $client.data("original-brand");
                
                // Only allow if car slot is available
                if (state.carSlots[brand][slotIndex].occupied || 
                    state.carSlots[brand][slotIndex].sold) {
                    return;
                }
                
                // Check if customer can be placed here
                if (clientOriginalBrand === brand || isBrandSoldOut(clientOriginalBrand)) {
                    // Move client to car slot
                    $client.detach().css({
                        top: 0,
                        left: 0,
                        width: "50px",
                        height: "50px"
                    }).appendTo($slot);
                    
                    // Update client state
                    $client.addClass("in-slot");
                    $client.attr("data-current-brand", brand);
                    
                    // Update state
                    state.carSlots[brand][slotIndex].occupied = true;
                    $slot.removeClass("available").addClass("occupied");
                    
                    // Remove from queue
                    const clientIndex = state.queue.findIndex(c => c.id === $client.attr("id"));
                    if (clientIndex !== -1) {
                        state.queue.splice(clientIndex, 1);
                    }
                    
                    // Make client draggable again
                    $client.draggable({
                        revert: "invalid",
                        cursor: "move",
                        zIndex: 1000,
                        containment: "document",
                        start: function() {
                            $(this).css('z-index', '1001');
                        }
                    });
                }
            }
        });
        
        // Make cashier droppable
        $("#cashier").droppable({
            accept: ".client",
            hoverClass: "ui-state-hover",
            drop: function(event, ui) {
                const $client = ui.draggable;
                const brand = $client.attr("data-current-brand");
                
                // Create a custom dialog instead of using confirm()
                const dialog = $(`
                    <div id="purchase-dialog" title="Purchase Confirmation">
                        <p>Would you like to purchase the ${brand} for RM ${state.prices[brand].toLocaleString()}?</p>
                    </div>
                `).appendTo('body');
                
                dialog.dialog({
                    resizable: false,
                    height: "auto",
                    width: 400,
                    modal: true,
                    buttons: {
                        "YES": function() {
                            $(this).dialog("close");
                            dialog.remove();
                            handlePurchase($client, brand);
                        },
                        "NO": function() {
                            $(this).dialog("close");
                            dialog.remove();
                            // Customer leaves without purchase
                            $client.addClass("fade-out");
                            setTimeout(() => {
                                $client.remove();
                                state.stats.customersServed++;
                                updateStats();
                            }, 500);
                        }
                    },
                    close: function() {
                        dialog.remove();
                    }
                });
            }
        });
        
        // Make exit droppable
        $("#exit").droppable({
            accept: ".client",
            hoverClass: "ui-state-hover",
            drop: function(event, ui) {
                const $client = ui.draggable;
                
                // Remove client with animation
                $client.addClass("fade-out");
                setTimeout(() => {
                    $client.remove();
                    state.stats.customersServed++;
                    updateStats();
                }, 500);
            }
        });
    }
    
    // Handle car purchase
    function handlePurchase($client, brand) {
        // Find the car slot the client came from
        const $slot = $client.parent();
        const slotIndex = $slot.data("index");
        
        if ($slot.hasClass("car-slot")) {
            // Mark car as sold
            state.carSlots[brand][slotIndex].sold = true;
            state.carSlots[brand][slotIndex].occupied = false;
            
            $slot.removeClass("occupied").addClass("sold");
            $slot.append('<div class="sold-badge">SOLD</div>');
            
            // Update stats
            state.stats.customersServed++;
            state.stats.carsSold++;
            state.stats.amountCollected += state.prices[brand];
            
            // Remove client
            $client.addClass("fade-out");
            setTimeout(() => {
                $client.remove();
                updateStats();
            }, 500);
        }
    }
    
    // Check if a brand is sold out
    function isBrandSoldOut(brand) {
        return state.carSlots[brand].every(slot => slot.sold);
    }
    
    // Update statistics display
    function updateStats() {
        $("#clients-served").text(state.stats.customersServed);
        $("#cars-sold").text(state.stats.carsSold);
        $("#amount").text(`RM ${state.stats.amountCollected.toLocaleString()}`);
        
        // Add pulse animation to stats when updated
        $(".stat-value").addClass("pulse");
        setTimeout(() => $(".stat-value").removeClass("pulse"), 500);
    }
    
    // Initialize the application
    preloadCarImages();
    initializeCarSlots();
    initializeDroppables();
    newClient();
});