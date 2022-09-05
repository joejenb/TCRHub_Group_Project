$( window ).on("load", function () {
    window.BlockParams = {};
    window.location.hash = "#homepage";
    $("body").addClass("loaded");

});

// *** Abstract operations *** //
// These functions interface directly with the webserver

// Replace a selected element with a specified rendered HTML Block
function loadBlock(block, selector, params) {
    window.BlockParams[block] = params;
    $.getJSON("/api/block/" + block + "?" + $.param(params), function(block_json) {
        $(selector).replaceWith(block_json["blob"]);
    });
}

// Replace an element with a rendered HTML Block using cached parameters
function reloadBlock(block, selector) {
    loadBlock(block, selector, window.BlockParams[block]);
}


// Load the data associated with an entity and update all references to that data
function loadEntity(entity, id) {
    jQuery.getJSON("/api/entity/" + entity + "/" + id, function(load_json) {
        for (var prop in load_json["properties"]) {
            let prop_class = "." + entity + "-" + id + "-" + prop;
            console.log(prop_class);
            $(prop_class).each(function() {
                $(this).text(load_json["properties"][prop]);
            });
        }
    });
}

// Change the data associated with an entity
function updateEntity(entity, id, data) {
    $.ajax({
        "type": "PUT",
        "url": "/api/entity/" + entity + "/" + id,
        "data": data,
        "dataType": "json",
    });
}

// Create a new entity and return the ID
async function createEntity(entity, data) {
     let result = await $.ajax({
        "type": "POST",
        "url": "/api/entity/" + entity + "/",
        "data": data,
        "dataType": "json",
    });
	if (result["status"] !== 200){
		alert(result["error"]);
	}
	return result["id"];
}

// Delete an entity and all elements tied to it
function deleteEntity(entity, id) {
      $.ajax({
        "type": "DELETE",
        "url": "/api/entity/" + entity + "/" + id,
        "success": function() {
            $("." + entity + "-" + id + "-del").each( function() {
                $(this).remove()
            });
        },
        "dataType": "json",
    });
}


// *** Functions for more complex operations on Clients *** //

// Read the values from the input fields, and update the relevant entity
// Then we load the read-only input pane and reload the entity
async function saveClient(id) {
    let values = {
        "name" : $("#client-name").val(),
        "address": $("#client-address").val(),
        "email": $("#client-email").val(),
        "mobile": $("#client-mobile").val(),
    };
    await updateEntity("client", id, values);
    loadBlock("clientInfo", "#client-pane", {"client": id});
    loadEntity("client", id);
}

// Read the values from the input fields and2 create a new entity
// Then we load the read-only input pane and the client list
async function createClient() {
    let values = {
        "name" : $("#client-name").val(),
        "address": $("#client-address").val(),
        "email": $("#client-email").val(),
        "mobile": $("#client-mobile").val(),
    };
    let id = await createEntity("client", values);
    loadBlock("clientInfo", "#client-pane", {"client": id});
    reloadBlock("clientList", "#client-list");
}

// Delete the entity and load a blank info pane
async function deleteClient(id) {
    await deleteEntity("client", id);
    loadBlock("clientInfo", "#client-pane", {});
}

// *** Functions for more complex operations on Personnel *** //

// Read the values from the input fields, and update the relevant entity
// Then we load the read-only input pane and reload the entity
async function savePersonnel(id) {
    let values = {
        "name" : $("#personnel-name").val(),
        "address": $("#personnel-address").val(),
        "email": $("#personnel-email").val(),
        "mobile": $("#personnel-mobile").val(),
        "password": $("#personnel-password").val(),
    };
    await updateEntity("personnel", id, values);
    loadBlock("personnelInfo", "#personnel-pane", {"personnel": id});
    loadEntity("personnel", id);
}

// Read the values from the input fields and create a new entity
// Then we load the read-only input pane and the personnel list
async function createPersonnel() {
    let values = {
        "name" : $("#personnel-name").val(),
        "address": $("#personnel-address").val(),
        "email": $("#personnel-email").val(),
        "mobile": $("#personnel-mobile").val(),
        "password": $("#personnel-password").val(),
    };
    let id = await createEntity("personnel", values);
	if (id){
		loadBlock("personnelInfo", "#personnel-pane", {"personnel": id});
		reloadBlock("personnelList", "#personnel-list");
	}
}

// Delete the entity and load a blank info pane
async function deletePersonnel(id) {
    await deleteEntity("personnel", id);
    loadBlock("personnelInfo", "#personnel-pane", {});
}

// *** Functions for more complex operations on Bookings *** //

// Read the values from the input fields, and update the relevant entity
// Then we load the read-only input pane and reload the entity
async function saveBooking(id) {

    let values = {
        "resource" : $("#booking-resource").val(),
        "date": $("#booking-date").val(),
        "unit": $("#booking-unit").text(),
        "documents": $("#booking-documents").text(),
        "bookedby": $("#booking-bookedby").text(),
        "notes": $("#booking-notes").text(),
    };
    await updateEntity("booking", id, values);
    loadBlock("bookingInfo", "#booking-pane", {"booking": id});
    loadEntity("booking", id);
}

// Read the values from the input fields and create a new entity
// Then we load the read-only input pane and the Booking list
async function createBooking() {

    let values = {
        "resource" : $("#booking-resource").val(),
        "date": $("#booking-date").val(),
        "time": $("#booking-time").val(),
        "unit": $("#booking-unit").text(),
        "documents": $("#booking-documents").text(),
        "bookedby": $("#booking-bookedby").text(),
        "notes": $("#booking-notes").text(),
    };
    let id = await createEntity("booking", values);
    loadBlock("bookingInfo", "#booking-pane", {"booking": id});
    reloadBlock("bookingList", "#booking-list");
}

// Delete the entity and load a blank info pane
async function deleteBooking(id) {
    await deleteEntity("booking", id);
    loadBlock("bookingInfo", "#booking-pane", {});
}

async function confirmBooking(id) {
    await updateEntity("booking", id, {"confirmed":"true"});
    loadBlock("bookingInfo", "#booking-pane", {"booking": id});
    //reloadBlock("bookingList", "#booking-list");
}

async function unconfirmBooking(id) {
    await updateEntity("booking", id, {"confirmed":"false"});
    loadBlock("bookingInfo", "#booking-pane", {"booking": id});
}

// *** Functions for more complex operations on Resources *** //

// Read the values from the input fields, and update the relevant entity
// Then we load the read-only input pane and reload the entity
async function saveResource(id) {
    let values = {
        "name" : $("#resource-name").val(),
        "unit": $("#resource-unit").val(),
        "slot-time": $("#resource-slot-time").val(),
        "location": $("#resource-location").val(),
        "description": $("#resource-description").val(),
    };
    await updateEntity("resource", id, values);
    loadBlock("resourceInfo", "#resource-pane", {"resource": id});
    loadEntity("resource", id);
}

// Read the values from the input fields and create a new entity
// Then we load the read-only input pane and the Resource list
async function createResource() {
    let values = {
        "name" : $("#resource-name").val(),
        "unit": $("#resource-unit").val(),
        "slot-time": $("#resource-slot-time").val(),
        "location": $("#resource-location").val(),
        "description": $("#resource-description").val(),
    };
    let id = await createEntity("resource", values);
    loadBlock("resourceInfo", "#resource-pane", {"resource": id});
    reloadBlock("resourceList", "#resource-list");
}

// Delete the entity and load a blank info pane
async function deleteResource(id) {
    await deleteEntity("resource", id);
    loadBlock("resourceInfo", "#resource-pane", {});
}


// *** On document load *** //

function handleLoad(tag) {
    if (tag === "clients") {
        loadBlock("clientList", "#client-list", {"q": ""});
    }
    else if (tag == "personnel") {
        loadBlock("personnelList", "#personnel-list", {"q": ""});
    }
    else if (tag == "bookings-manage") {
        loadBlock("bookingList", "#booking-list", {"q":""});
    }
    else if (tag == "resources") {
        loadBlock("resourceList", "#resource-list", {"q": ""});
    }
	else if (tag == "account"){
		loadBlock("accountPane", "#account-pane", {"q": ""});
	}
}

$(document).ready(function () {
    $( window ).on( "hashchange", function( e ) {
        const selector = location.hash.replace("#", "#");
        const elements = $(selector);

        $(".content").hide();
        elements.show();

	handleLoad(selector.replace("#", ""));
    } );

    $("#btnAddToBasket").click(function(event) {
        // TODO: Add thing to basket
        window.location.hash="#basket";
    });

    $("#btnBookMore").click(function(event) {
        // TODO: Go back to booking more things
        window.location.hash="#bookings-overview";
    });

    $("#btnConfirmBookings").click(function(event) {
        // TODO: Confirm and proceed to payment (?)
        window.location.hash="#bookings-confirmation";
    });
});

