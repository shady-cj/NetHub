
$.getScript('/static/NetHubApp/authFormFunc.js', function(){


    $(function(){
        
        var authHeadVal = $('#auth-header')
        
        var authDisplay  = $(authHeadVal).text().trim() 

        displayForm(authDisplay)


        $(window).on('popstate',  
            function(event) {
                if (event.originalEvent.state !== null){
                    displayForm(event.originalEvent.state.displayHeader,true)
                }else{
                    if (authDisplay !== undefined){
                        displayForm(authDisplay,true)
                        
                    }
                }
         
            });

        $(".submain-1-auth-link").each(function(index,eachLink){
            $(eachLink).click(function(e){
                var historyTitle

                e.preventDefault()   
                
                $(".error-message").each(function(){
                    $(this).text('')
                })
                historyTitle = $(this).attr('data-auth') === "SIGN UP" ? "register":"login"
  
                history.pushState({displayHeader:$(this).attr('data-auth')},null, historyTitle)
                displayForm($(this).attr('data-auth'),true)
            })
        })

        

        function displayForm(displayHeader,fromLink=false){
            $('#signIn-link').hide()
            $('#signUp-link').hide()
            $("#login-form").hide()
            $("#register-form").hide()
            $(".form-control").each(function(index,inp){
            
                $(inp).val("")
                var inputSpan = $(this).siblings('span')

                focusEffect(inp,inputSpan,false)
                checkInput(inp,inputSpan,false)
            })

        
            var signLink,signForm,formTitle
            if( displayHeader == 'SIGN UP'){
                signLink = '#signIn-link'
                signForm = '#register-form'
                formTitle= "Create An Account With NETHUB Real Quick and Easy"
                
            }else{
                signLink = '#signUp-link'
                signForm = '#login-form'
                formTitle ="Sign in to NETHUB"
    
                
            }


            $(signLink).show()
            $('#auth-header').text(displayHeader)
            $('title').text(`NETHUB | ${displayHeader}`)
            $(signForm).show()
            $(signForm).css('display','flex')

            
            if (fromLink){
                $("form > h2").each(function(){
                    $(this).html(formTitle)
                })
            
            }
          
        }
    })

})