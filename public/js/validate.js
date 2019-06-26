const $ = jQuery;
function fillError(err){
    const text= "Error: " + err;
    document.getElementById("error").textContent=text;
    flash();
}
function flash(){
    $("#error").fadeTo(500, .1,function(){
        $("#error").fadeTo(500, 1,function(){
            $("#error").fadeTo(500,.1,function(){
                $("#error").fadeTo(500,1,function(){
                
                });
            });
        });
    });
}
function validateForm() {
    var email = document.forms["registerForm"]["email"].value;
    var password = document.forms["registerForm"]["password"].value;
    var confirmPassword = document.forms["registerForm"]["password2"].value;
    if(password.length<8){
        fillError("Password must be at least 8 characters");
        return false;
    }
    if(password!==confirmPassword){
        fillError("Passwords do not match");
        return false;
    }
  } 