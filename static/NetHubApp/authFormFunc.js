function focusEffect(field, inputSpan, onFocus) {
    var container = $(field).closest(".form-container");
    var label = $(field).closest("div").siblings("label");
    var coLor, bgColor, lColor, sColor;

    if (onFocus) {
        coLor = "#f1ec40";
        sColor = coLor;
        bgColor = "transparent";
        lColor = coLor;
    } else {
        if ($(field).val().trim().length > 0) {
            var black = "gray";
            coLor = "rgb(83, 81, 81,0.6)";

            lColor = black;
            sColor = black;
        } else {
            var white = "whitesmoke";
            coLor = "rgb(83, 81, 81,0.6)";
            lColor = white;
            sColor = white;
            bgColor = "gray";
        }
    }
    $(container).css({
        backgroundColor: bgColor,
        border: `1px solid ${coLor}`,
    });
    $(inputSpan).css("color", sColor);
    $(label).css("color", lColor);
}

function checkInput(field, inputSpan, onFocus) {
    if (onFocus) {
        activeInput(inputSpan);
    } else {
        if ($(field).val().trim().length > 0) {
            activeInput(inputSpan);
        } else {
            $(inputSpan).css({
                fontSize: "20px",
                top: "50%",
                transform: "translateY(-50%)",
                left: "12px",
            });
        }
    }
}
function activeInput(inputSpan) {
    $(inputSpan).css({
        fontSize: "10px",
        top: "20%",
        transform: "0",
        left: "20px",
    });
}
