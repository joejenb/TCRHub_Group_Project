/* Initialise globals */

$( window ).on("load", function () {
    window.BlockParams = {};
    window.client = null;
    window.location.hash = "#bookings-overview";
	const elements = $("#bookings-overview");
	elements.show();

    $("body").addClass("loaded");

});

/* Mock cookie */
let guest_basket = 6578987;


/* Load template block from server into DOM */
function loadBlock(block, selector, params) {
    window.BlockParams[block] = params;
    $.getJSON("/api/block/" + block + "?" + $.param(params), function(block_json) {
		console.log(block_json["blob"], selector);
        $(selector).replaceWith(block_json["blob"]);
    });
}

async function createEntity(entity, data){
	let ent = await $.ajax({
		type: "POST",
		url: "api/entity/" + entity + "/",
		data: data,
		dataType: "json",
	});
    return ent;
}

/* Obtain auth token from server */
async function validateClient(){
	let username = $("#login-email").val()
	let password = $("#login-pass").val()
	if (username === "" || password === ""){
		$("#sign-in-msg").text("Please complete the form below, an entry is missing");
	} else{
		let auth = await $.ajax({
			type: "POST",
			url: "/api/entity/login/",
			data: $("#login-form-obj").serialize(),
			dataType: "json"
		});
		if (auth["status"] === 200){
			location.reload();
		} else {
			$("#sign-in-msg").text("Sorry, those credentials are not correct");
		}
	}
}

/* Create new user account */
async function createClient(){
	let values = {
		"email": $("#register-email").val(),
		"name": $("#register-name").val().concat(' ', $("#register-surname").val()),
		"address": $("#register-address").val(),
		"password": $("#register-pass").val(),
	};
	let filled = true;
	for (var value of Object.values(values)) {
		if (value === ""){
			filled = false;
		}
	}
	if (filled){
		let ent = await createEntity("register", values);
		if (ent["status"] === 200) {
			window.location.hash = "sign-in";
		} else {
			$("#register-msg").text("Sorry, those credentials are already in use");
		}
	} else{
		$("#register-msg").text("Please complete the form below, an entry is missing");
	}

}

async function bookResource(rid) {
	let res = await loadBlock("bookingForm", "#booking-form", {"rid": rid});
	window.location.href = "#book";
}

async function clearBasket() {
    await $.ajax({
		type: "DELETE",
		url: "api/entity/basket/" + (guest_basket) + "/",
		dataType: "json",
	});
	$("#basket-item-info").html("");
}

async function createBooking() {
	let values = {
		"resource": $("#booking-resource").text().trim(),
		"date": $("#booking-date").val(),
		"time": $("#booking-time").val(),
		"documents": $("#booking-documents").val(),
        "notes": $("#booking-notes").val(),
	};
    let res = await $.ajax({
		type: "POST",
		url: "api/entity/basket/" + (guest_basket) + "/",
		data: values,
		dataType: "json",
	});
	//loadBlock("bookingForm", "#booking-form", {"rid": ""});
	window.location.href = "#basket";
	loadBlock("basketList", "#basket-list", {});
}

async function cancelBooking(basket_id, booking_id){
    let res = await $.ajax({
        type:"DELETE",
        url: "/api/entity/basket/" + basket_id + "/" + booking_id + "/"
    });
	handleLoad("basket");
	//window.location.href = "#bookings-overview";
}

function handleLoad(tag){
	if (tag == "sign-in"){
		loadBlock("loginForm", "#login-form", {});
	}
	else if (tag == "register") {
		loadBlock("registrationForm", "#registration-form", {});
	}
    else if (tag == "bookings-management") {
        loadBlock("bookingList", "#booking-list", {"q":""});
    }
    else if (tag == "resources") {
        loadBlock("resourceList", "#resource-list", {"q": ""});
    }

    if (tag == "sign-in") {
        $("#sign-in-msg").text("Please enter your email and password");
    }
    else if (tag == "basket") {
        loadBlock("basketList", ".basket-list", {"basket": guest_basket});
    }
}


$(document).ready(function () {
    $( window ).on( "hashchange", function( e ) {
        const selector = location.hash.replace("#", "#");
        const elements = $(selector);

        $(".content").hide();
        elements.show();

	    handleLoad(selector.replace("#", ""));
    });

    $("#btnAddToBasket").click(function(event) {
        window.location.hash="#basket";
    });

    $("#btnBookMore").click(function(event) {
        window.location.hash="#bookings-overview";
    });

    $("#btnConfirmBookings").click(function(event) {
        $.ajax({
            type: "GET",
            url: "api/confirm-basket/" + guest_basket,
        });
        clearBasket();
        window.location.hash="#bookings-confirmation";
    });
});
