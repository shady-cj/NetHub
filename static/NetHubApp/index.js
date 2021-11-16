$.getScript("/static/NetHubApp/authFormFunc.js", function () {
  $(function () {
    var hamIcon = $(".navigator-menu");
    var subMain = $(".submain-1");
    var footerLinks = $("footer a");
    var editBtnIcon = $(".fi-rr-pencil");
    var searchForm = $(".submain-3 .submain-3-search form");
    var searchField = $(searchForm).find("input");
    var searchIcon = $(searchForm).find("button");
    var newPostTextarea = $(".textarea");
    var mobileNewPostBtn = $(".new-post-mobile-btn");
    var mobileNewPostCon = $(".new-post-mobile-container");
    var bookmarkBtn = $(
      ".post-container .post-content .post-info .bookmark-btn"
    );
    addToBookmark(bookmarkBtn);
    $(mobileNewPostBtn).click(function (e) {
      e.preventDefault();
      $(this).css("background-color", "rgb(30, 30, 30)");
      $(mobileNewPostCon).css("left", "0");
    });
    $(".mobile-back-post-btn").click(function () {
      $(mobileNewPostCon).css("left", "150%");
    });
    console.log(newPostTextarea);
    $(newPostTextarea).each(function (index, textArea) {
      var hiddenPost = $(textArea).siblings(".hidden-post");
      var newPostBtn = $(textArea).siblings(".new-post-btn");
      enablePostBtn(textArea, hiddenPost, newPostBtn);
    });

    function enablePostBtn(newPostTextarea, hiddenPost, newPostBtn) {
      $(newPostTextarea).keyup(function () {
        var content = $(newPostTextarea).html();
        $(hiddenPost).val(content);
        if ($(hiddenPost).val().length > 0) {
          $(newPostBtn).attr("disabled", false);
          $(newPostBtn).removeClass("btn-inactive");
          console.log(newPostBtn);
        } else {
          $(newPostBtn).attr("disabled", true);
          $(newPostBtn).addClass("btn-inactive");
        }
      });
    }

    // $(newPostBtn).click(function(){
    //     console.log('clicked')
    // })

    $.each(footerLinks, function (index, link) {
      $(link).click(function (e) {
        e.preventDefault();
        var page = $(this).attr("data-footerLink");

        var historyTitle = $(this).attr("data-footerName");

        viewsHandler(page, historyTitle, this);
        addActive(footerLinks, this, "footer-active");
      });
    });
    editEvent(editBtnIcon);

    // clicking on edit button
    function editEvent(editBtn) {
      $.each(editBtn, function (index, btn) {
        var postMessage = $(btn).parent().parent().siblings(".post-message");
        var editBtnInfo = $(postMessage).siblings(".edit-info");
        $(btn).click(function () {
          var iContent = $(postMessage).html();
          $(postMessage).attr("contenteditable", "true");
          $(postMessage).focus();

          document.execCommand("selectAll", false, null);
          document.getSelection().collapseToEnd();
          $(postMessage).css("outline", "none");
          $(editBtnInfo).show(function () {
            var closeBtn = $(editBtnInfo).find("i");
            $(closeBtn).each(function (index, eachbtn) {
              $(eachbtn).click(function () {
                $(postMessage).attr("contenteditable", "false");
                $(editBtnInfo).hide(200);
                var postId = $(postMessage).attr("data-postId");
                var token = $("#csrf").val();

                if ($(eachbtn).hasClass("fa-save")) {
                  $.ajax({
                    type: "POST",
                    url: `/edit_post/${postId}`,
                    dataType: "json",
                    data: { post_content: $(postMessage).html() },
                    // contentType: 'application/json',
                    headers: { "X-CSRFToken": token },
                  }).done(function (result) {
                    console.log(result.edited);
                  });
                } else {
                  $(postMessage).html(iContent);
                }
              });
            });
          });
        });
      });
    }

    $(searchField).focusin(function () {
      $(searchForm).css({
        "background-color": "rgb(32, 32, 32)",
        border: " 1px solid #f1ec40",
      });
      $(searchIcon).css("color", "#f1ec40");
    });

    $(searchField).focusout(function () {
      $(searchForm).css({
        "background-color": "rgb(68, 67, 67)",
        border: "none",
      });
      $(searchIcon).css("color", "whitesmoke");
    });

    $(hamIcon).click(function () {
      $(subMain).css("left", "0");
      setTimeout(function () {
        $(".blur-main").show();
        $(".post-content div").css("color", "rgb(90, 88, 88)");
      }, 200);

      $(document).click(function (e) {
        var elem = e.target;
        if ($(subMain).css("left") === "0px") {
          if (!$(elem).hasClass("submain-1")) {
            $(subMain).css("left", "-500px");
            $(".post-content div").css("color", "whitesmoke");
            $(".blur-main").hide();
          }
        }
      });
    });

    function addActive(Links, activeLink, attrClass) {
      $.each(Links, function (index, link) {
        $(link).removeClass(attrClass);
      });
      $(activeLink).addClass(attrClass);
    }

    // LOGOUT POPUP
    var logoutLink = $(".main-logout-link");
    var logoutPopup = $(".logout-popup");
    var cancelSpan = $(logoutPopup).find("span");
    $(logoutLink).click(function (e) {
      console.log("clicked");
      e.preventDefault();
      $(".popup-dark").show();

      $(logoutPopup).show();
      $(logoutPopup).css("display", "flex");

      $(cancelSpan).click(function () {
        $(logoutPopup).hide();
        $(".popup-dark").hide();
      });
    });
    // LOGOUT POPUP ENDS

    // REGISTER FORM AUTHENTICATION SECTION

    $("#datepicker").datepicker({
      maxDate: "-18y",
      yearRange: "c-52:c",
      changeMonth: true,
      changeYear: true,
    });

    $("#datepicker").datepicker("option", "showAnim", "drop");
    $("#datepicker").datepicker("option", "dateFormat", "yy-mm-dd");

    var inputFields = $("form .form-group .form-container div input");
    var allInputSpans = $("form .form-group .form-container div span");
    $(allInputSpans).each(function (index, span) {
      $(span).click(function () {
        $(span).siblings("input").focus();
      });
    });
    $("#datepicker").change(function () {
      var inputSpan = $(this).siblings("span");
      checkInput(this, inputSpan, false);
      focusEffect(field, inputSpan, false);
    });
    $(inputFields).each(function (index, field) {
      var inputSpan = $(field).siblings("span");

      checkInput(field, inputSpan, false);
      $(field).focusin(function () {
        checkInput(field, inputSpan, true);
        focusEffect(field, inputSpan, true);
      });
      $(field).focusout(function () {
        checkInput(field, inputSpan, false);
        focusEffect(field, inputSpan, false);
      });
      $(field).keyup(function () {
        checkInput(field, inputSpan, false);
      });
    });

    // REGISTER FORM AUTHENTICATION ENDS

    // LOADING VIEWS

    // $(window).on('popstate',
    //     function(event) {
    //         if (event.originalEvent.state !== null){
    //             // displayForm(event.originalEvent.state.displayHeader,true)
    //             ajaxNavPage(event.originalEvent.state.page,event.originalEvent.state.emptyMessage)
    //             // console.log(event.originalEvent)
    //         }else{
    //             // if (authDisplay !== undefined){
    //             //     displayForm(authDisplay,true)

    //             // }
    //         }

    //     }
    // );

    var mainNavLinks = $(".submain-1-nav-link").not(".main-logout-link");
    var altView = $("#alternative-post-container");
    var mainView = $("#main-home-post-container");
    var profileView = $("#main-profile-section");
    var followView = $("#following-info-container");
    var headerTitle = $(".header-title");
    var userOnlineId = $(".submain-1-username").attr("data-userId");
    var homePageOnload = true;
    var homeClicked = 0;
    var reloadHome = false;
    var activeUrl = $(headerTitle).text();
    var targetUser = $(".submain-1-username").attr("data-username");
    var updatedUserProfile = false;
    homePageOnload = activeUrl.trim() !== "Home" ? false : true;

    if (activeUrl.trim() === "Following" || activeUrl.trim() === "Followers") {
      showActiveView(followView);

      var followHeaders = $(".follow-ind");

      changeFollowPage(followHeaders, activeUrl.trim());
    }

    function changeFollowPage(followHeaders, page) {
      $(followHeaders).each(function (index, eachHeader) {
        $(eachHeader)
          .find("span")
          .click(function () {
            setIndicator(eachHeader);
            var activeSpanTitle = $(this).text().trim();
            var activeSpanText = activeSpanTitle.toLowerCase();
            $(mainNavLinks).each(function (ind, val) {
              if ($(val).text().trim().toLowerCase() === activeSpanText) {
                addActive(mainNavLinks, val, "active-link");
              }
            });
            $(headerTitle).text(activeSpanTitle);
            $("title").text(`NETHUB | ${activeSpanTitle.toUpperCase()}`);
            var emptyMessage =
              activeSpanText === "following"
                ? `<h3> You are Following No one</h3>`
                : `<h3>No Followers Yet</h3>`;
            history.pushState(
              { page: activeSpanText, emptyMessage: emptyMessage },
              null,
              activeSpanText
            );
            ajaxNavPage(activeSpanText, emptyMessage);
          });
        if (
          $(eachHeader).find("span").text().trim().toLowerCase() ===
          page.toLowerCase()
        ) {
          setIndicator(eachHeader);
        }
      });
    }

    function setIndicator(followHeader) {
      var innerSpan = $(followHeader).find("span");
      var followIndicator = $(".follow-active-ind");
      var initialVal = $(innerSpan).text().trim() === "Followers" ? 50 : 0;

      $(".follow-ind").each(function (index, value) {
        $(value).find("span").css("color", "rgb(145, 141, 141)");
      });

      $(innerSpan).css("color", "whitesmoke");
      var translateIndBy = 20 + initialVal;

      $(followIndicator).css("left", `${translateIndBy}%`);
    }

    $(mainNavLinks).each(function (index, navLink) {
      if (activeUrl.trim() === $(navLink).text().trim()) {
        addActive(mainNavLinks, navLink, "active-link");
      }

      $(navLink).click(function (e) {
        e.preventDefault();
        var page = $(this).attr("data-link");
        var historyTitle = $(this).text();
        console.log(page);
        viewsHandler(page, historyTitle, this);
      });
    });

    function viewsHandler(page, historyTitle, clickedLink) {
      var emptyMessage;
      addActive(mainNavLinks, clickedLink, "active-link");
      $(altView).html("");

      $(headerTitle).text(historyTitle);
      $("title").text(`NETHUB | ${historyTitle.toUpperCase()}`);

      if (page === "home") {
        if (homePageOnload) {
          reloadHome = true;
          homePageOnload = false;
          console.log("hi hi");
        } else {
          if (homeClicked > 0) {
            reloadHome = true;
          } else {
            homeClicked++;
          }
        }
        showActiveView(mainView);

        emptyMessage = `
                    <h1 class='empty-post'>No posts yet!!!</h1>
                    <h4 class='empty-post'>Be the first to make a post</h4>
                    `;
      } else if (page === "bookmarks") {
        emptyMessage = `<h1 class='empty-post'>No Bookmarks</h1>`;
        showActiveView(altView);
      } else if (page === "followers" || page === "following") {
        emptyMessage =
          page === "followers"
            ? `<h3 class='empty-post'>No Followers Yet</h3>`
            : `<h3 class='empty-post'> You are Following No one</h3>`;
        showActiveView(followView);
        var followHeaders = $(".follow-ind");
        changeFollowPage(followHeaders, page.trim());
      } else if (page === "profile") {
        emptyMessage =
          "<h3 class='empty-post'> You haven't made any post yet</h3>";
        showActiveView(profileView);
      } else {
        showActiveView(altView);
        emptyMessage = `<h1 class='empty-post'>No user you are following has made a post </h1>`;
      }
      pushHistoryState(page, emptyMessage);

      ajaxNavPage(page, emptyMessage);
    }

    function showActiveView(activeView) {
      $(".post-overlay").each(function (index, value) {
        $(value).hide();
      });
      $(activeView).show();
    }

    function pushHistoryState(page, emptyMessage) {
      infoPages = ["followers", "following", "profile"];
      if (infoPages.includes(page)) {
        history.pushState(
          { page: page, emptyMessage: emptyMessage },
          null,
          `/${targetUser}/${page}`
        );
      } else {
        history.pushState(
          { page: page, emptyMessage: emptyMessage },
          null,
          `/${page}`
        );
      }
    }

    function ajaxNavPage(page, emptyMessage) {
      console.log(page);
      $.ajax({
        url: `/indexAjax/${page}?username=${targetUser}`,
        type: "GET",
      }).done(function (data) {
        if (data["profpic_empty"]) {
          $("#submain-1-userpic").attr("src", data.user.pic);
          updatedUserProfile = true;
        }
        if (page === "following" || page === "followers")
          loadViews(
            data.follow,
            emptyMessage,
            page,
            true,
            data["is_following"],
            data.user
          );
        else
          loadViews(
            data.posts,
            emptyMessage,
            page,
            false,
            false,
            data.user,
            data.numfollowing,
            data.numfollowers
          );
      });
    }

    function loadViews(
      dataset,
      empty,
      page,
      follow = false,
      is_following = false,
      user = null,
      numfollowing = null,
      numfollower = null
    ) {
      if (page === "profile") {
        homeClicked = 0;
        reloadHome = false;
        $(profileView).html("");
        renderProfilePage(dataset, user, numfollowing, numfollower);
      } else if (page !== "home") {
        homeClicked = 0;
        reloadHome = false;
        formatPost(dataset, empty, false, follow, is_following, user);
      } else {
        if (reloadHome || updatedUserProfile) {
          formatPost(dataset, empty, true, false, null, user);
        }
      }
    }

    function formatPost(
      dataset,
      empty,
      forHome = false,
      follow = false,
      is_following,
      user
    ) {
      var followSection = $(followView).find(".actual-follow-con");
      if (dataset.length === 0) {
        if (follow) $(followSection).html(empty);
        else if (forHome) $(mainView).html(empty);
        else $(altView).html(empty);
      } else {
        if (follow) {
          $(followSection).html("");
          var follow_btn = is_following
            ? `<button>Following</button>`
            : `<button class='not-follow'>Follow</button>`;
          $(dataset).each(function (index, followInfo) {
            var followTemplate = `
                                    <div>
                                        <div class='follow-img'><img src ='${followInfo.pic}'></div>
                                        <div class='follow-username'><span>${followInfo.username}<span></div>
                                        <div class='follow-btn'>${follow_btn}</div>
                                    </div>
                                `;

            $(followSection).append(followTemplate);
          });
        } else {
          if (forHome) {
            var newPostTemp = `
                            <div class="new-post-container">
                                <form action='/create_new_post' method='post'>
                                    <input type="hidden" name="csrfmiddlewaretoken" value=${$(
                                      "#csrf"
                                    ).val()}>
                                    <div contenteditable="true" placeholder="What's going on buddy?" class="textarea"></div>
                                    <input type ='text' class='hidden-post' name='post_content' hidden>
                                    <input type="submit" class='new-post-btn btn-inactive' value="Post" disabled>
                                </form>
                            
                            </div>
                            
                            `;

            $(mainView).html("");
            $(mainView).append(newPostTemp);
            var postTextarea = $(mainView).find(".textarea");
            var hiddenInput = $(mainView).find(".hidden-post");
            var postBtn = $(mainView).find(".new-post-btn");
            enablePostBtn(postTextarea, hiddenInput, postBtn);
          }
          $(dataset).each(function (index, post) {
            var template = postTemplate(post, user);
            var postCon = $("<div>");
            $(postCon).addClass("post-container");
            $(postCon).html(template);
            $(postCon).attr("data-postId", post.id);

            if (forHome) $(mainView).append(postCon);
            else $(altView).append(postCon);
          });

          var view;
          if (forHome) {
            view = mainView;
            $(view).scrollTop(0);

            updatedUserProfile = false;
          } else view = altView;
          editEvent($(view).find(".fi-rr-pencil"));
          addToBookmark($(view).find(".bookmark-btn"));
        }
      }
    }

    function renderProfilePage(dataset, user, numfollowing, numfollower) {
      var bioData = user.about ? user.about : "No Bio";
      var profileMain = `
                            <section class='profile-main-info'>
                                <div class='profile-pic-con'>
                                    <img src=${user.pic} alt="">
                                </div>
                                <div class='profile-info-con'>
                                    <div><span class='profile-info-name' >${user.firstName} ${user.lastName}</span></div>
                                    <div><span class='profile-info-username' >${user.username}</span> <button id='profile-edit-btn'>Edit Profile</button></div>
                                    
                                </div>
                            </section>
                            <section class='profile-more-info'>
                                <div class='profile-info-about-header'><span>About Me</span><span></span></div>
                                <div class='profile-info-about'><span>${bioData}</div>
                                
                                <div class='profile-info-activity'>
                                    <div>
                                        <span>${dataset.length}</span>
                                        <span>Posts</span>
                                    </div>
                                    <div>
                                        <span>${numfollowing}</span>
                                        <span>Following</span>
                                    </div>
                            
                                    <div>
                                        <span>${numfollower}</span>
                                        <span>Followers</span>
                                    </div>
                                </div>
    
                            </section> 
                    `;
      $(profileView).html(profileMain);

      $(profileView).find("#profile-edit-btn").click(activateEditPage);

      var profileSection = $("<section>");
      $(profileSection).addClass("profile-info-posts");
      var profPostHeader = `   
                        <div class='profile-post-header'>
                            <h1>My Posts</h1>
                        </div>
                    `;
      $(profileSection).html(profPostHeader);

      $(dataset).each(function (index, post) {
        var profileTemplate = postTemplate(post, user);
        var postCon = $("<div>");
        $(postCon).addClass("post-container");
        $(postCon).attr("data-postId", post.id);
        $(postCon).html(profileTemplate);
        $(profileSection).append(postCon);
      });
      addToBookmark($(profileSection).find(".bookmark-btn"));
      $(profileView).append(profileSection);

      editEvent($(profileView).find(".fi-rr-pencil"));
    }

    function postTemplate(post, user) {
      if (user.bookmarks.includes(post.id)) {
        bookmarkClass = "fi-sr-bookmark";
      } else {
        bookmarkClass = "fi-rr-bookmark";
      }
      var userEditBtn =
        +post.post_creator_id === +userOnlineId
          ? `<div><i class="fi fi-rr-pencil"></i></div>`
          : ``;
      template = `
                                
                        <div class='post-image'>
                            <img src="${post.post_creator_pic} " alt="">
                        </div>
                        <div class='post-content'>
                            <div class='post-title'>
                                <span class='post-username'>${post.post_creator_username}</span> <span class='post-timestamp'>${post.post_date}</span>
                            </div>
                            <div data-postId='${post.id}' class='post-message'>
                                ${post.post_content}
                            </div>
                            <div class='edit-info'>
                                
                                <i class="far fa-window-close"></i>
                                <i class="fas fa-save"></i>
                            </div>
                            <div class='post-info'>
                                <!-- <i class="fi fi-sr-heart"></i> -->
                                <div><i class="fi fi-rr-heart"></i></div>
                                <div><i class="fi fi-rr-comment"></i> </div>
                                ${userEditBtn}
                                <div><i class="fi ${bookmarkClass} bookmark-btn "></i> </div>
                                <!-- <i class="fi fi-sr-bookmark"></i> -->
                            </div>
                        </div>

            
                    `;
      return template;
    }

    $("#profile-edit-btn").click(activateEditPage);
    var profileEdited;
    var imageByte;

    function activateEditPage() {
      profileEdited = false;
      console.log(targetUser);
      $.ajax({
        url: `/get_current_user/?username=${targetUser}`,
        type: "GET",
      }).done(function (data) {
        editProfileTemplate(data.user);
        $(".hide-edit-info").show();
        $(".popup-dark").show();
        $(".edit-profile-text").each(function (index, el) {
          var eachInputField;
          if ($(el).hasClass("profile-textarea"))
            eachInputField = $(el).find("textarea");
          else eachInputField = $(el).find("input");

          $(eachInputField).focusin(function () {
            $(eachInputField)
              .closest(".edit-profile-text")
              .css("border-color", "#d9d43b");
            $(eachInputField).siblings("label").css("color", "#d9d43b");
          });

          $(eachInputField).focusout(function () {
            $(eachInputField)
              .closest(".edit-profile-text")
              .css("border-color", "rgb(112, 110, 110)");
            $(eachInputField)
              .siblings("label")
              .css("color", "rgb(112, 110, 110)");
          });
        });

        $(".edit-profile-header i").click(function () {
          if (profileEdited) {
            $(".update-confirm-modal").css("display", "flex");
            $("#edit-discard").on("click", function () {
              $(".hide-edit-info").hide();
              $(".popup-dark").hide();
              $(".update-confirm-modal").hide();
              profileEdited = false;
            });
            $("#edit-cancel").on("click", function () {
              $(".update-confirm-modal").hide();
            });
          } else {
            $(".hide-edit-info").hide();
            $(".popup-dark").hide();
          }
        });

        $("#save-edited-profile-btn")
          .off("click")
          .on("click", function () {
            var updatedData = {
              fname: $("#update-fname").val().trim(),
              lname: $("#update-lname").val().trim(),
              username: $("#update-username").val().trim(),
              bio: $("#update-bio").val().trim(),
              dob: $("#update-dob").val().trim(),
              pic: imageByte,
              imageFile: $("#edit-pics").val(),
            };
            var token = $("#csrf").val();
            $.ajax({
              url: `/updateUser/${targetUser}`,
              type: "PUT",
              dataType: "json",
              contentType: "application/json",
              data: JSON.stringify(updatedData),
              headers: {
                "X-CSRFToken": token,
                "X-Requested-With": "XMLHttpRequest",
              },

              success: (data) => {
                if (data.error) {
                  alert("An error occured " + data.error);
                } else {
                  targetUser = data.user.username.toLowerCase();
                  renderProfilePage(
                    data["users_posts"],
                    data.user,
                    data["num_following"],
                    data["num_followers"]
                  );
                  console.log(data.user);
                  var empty =
                    "<h3 class='empty-post'> You haven't made any post yet</h3>";
                  if (imageByte !== null) {
                    $("#submain-1-userpic").attr("src", imageByte);
                  }
                  pushHistoryState("profile", empty);

                  $(".submain-1-username").attr("data-username", targetUser);
                  $(".submain-1-username").find("h4").text(data.user.username);
                  $(".hide-edit-info").hide();
                  $(".popup-dark").hide();
                  updatedUserProfile = true;
                  imageByte = null;
                }
              },

              error: (XMLHttpRequest, textStatus, errorThrown) => {
                console.log(textStatus);
                console.log(errorThrown);
              },
            });
          });
      });

      // $('#main-profile-section').hide()
    }

    function editProfileTemplate(user) {
      var editSection = $("<section>");
      $(editSection).addClass("edit-profile-submain");
      var Bio;
      if (user.about === null) Bio = "";
      else Bio = user.about;

      var editTemplate = `    
                        <form action="">
                            <div class='img-crop-container'>
                                <div class='img-crop-submain'>
                                    
                                    <div class='img-crop-btn'>
                                        <div><i class="mobile-back-post-btn fas fa-arrow-left"></i> <span>Edit Media</span></div><button id='cropped-img-upload'>Apply</button>
                                        
                                    </div>
                                    <div class='img-crop-main'></div>
                                </div>
                            </div>
                            <div class ='update-confirm-modal'>
                                <div class='update-confirm-submain' >

                                    <h1>Discard Changes?</h1>
                                    <div>
                                        <button id='edit-discard'> Discard</button>
                                        <button id='edit-cancel'> Cancel </button>
                                    </div>
                                </div>
                            </div>
                            <div class= 'edit-profile-header'>
                                <i class="fas fa-times"></i>
                                
                                <h1>Edit Profile</h1>
                                <button id='save-edited-profile-btn'>Save</button>
                            </div>
                            <div class='edit-profile-section'>
                                <div class='edit-profile-image'>
                                    <img id="edit-pics-con" src="${user.pic}" alt="">
                                    <label for= 'edit-pics'><i class="fas fa-camera"></i></label>
                                    <input id='edit-pics' type='file' hidden>
                                </div>
                                <div class='edit-profile-text-section'>
                                    <div class='edit-profile-text'>
                                        <label>First Name</label>
                                        <input id='update-fname' type="text" value="${user.firstName}">
                                    </div>
                                    <div class='edit-profile-text'>
                                        <label>Last Name</label>
                                        <input id='update-lname' type="text" name="" id="" value="${user.lastName}">
                                    </div>
                                    <div class='edit-profile-text'>
                                        <label>Username</label>
                                        <input id='update-username' type="text" value="${user.username}">
                                    </div>
                                    <div class='edit-profile-text profile-textarea'>
                                        <label>Bio</label>
                                        <textarea id='update-bio' style='font-family:sans-serif; font-weight: 400;'>${Bio}</textarea>
                                    </div>
                                </div>
                                <div class='edit-profile-dob'>Date Of Birth <label for='update-dob'><i class='fas fa-chevron-down'></i></label> <span>${user.dob}</span> <input id='update-dob' type='text'> </div>
                            </div>
                        </form> 
              
                    `;
      $(editSection).append(editTemplate);
      var updateDob = $(editSection).find("#update-dob");
      var cropMainCon = $(editSection).find(".img-crop-container");
      var imageCon = $(editSection).find(".img-crop-main");
      var removeIcon = $(editSection).find(".img-crop-btn").find("i");
      var inputFileField = $(editSection).find("#edit-pics");
      var imageUpdate = $(editSection).find("#cropped-img-upload");
      var textFields = $(editSection).find(
        ".edit-profile-section input,textarea"
      );

      $(textFields).each(function (index, field) {
        $(field).on("change", function () {
          profileEdited = true;
        });
      });
      var cropper = $(imageCon).croppie({
        enableOrientation: true,
        enableExif: true,
        viewport: {
          width: 150,
          height: 150,
          type: "square",
        },
        boundary: {
          width: 350,
          height: 250,
        },
      });

      console.log(inputFileField);
      $(inputFileField).change(function () {
        var reader = new FileReader();
        reader.onload = function (e) {
          $(cropMainCon).css("display", "flex");
          $(editSection).css("overflow-y", "hidden");

          cropper.croppie("bind", {
            url: e.target.result,
          });
        };

        reader.readAsDataURL(this.files[0]);
      });
      $(imageUpdate).click(function () {
        cropper
          .croppie("result", {
            type: "canvas",
            size: "viewport",
          })
          .then(function (img) {
            imageByte = img;
            var getImage = $(editSection).find("#edit-pics-con");
            $(getImage).attr("src", img);
            $(cropMainCon).css("display", "none");
            $(editSection).css("overflow-y", "scroll");
            profileEdited = true;
          });
      });

      $(removeIcon).on("click", function () {
        $(cropMainCon).hide();
      });
      $(updateDob).focusin(function () {
        var icon = $(this).siblings("label").children("i");
        $(icon).removeClass("fa-chevron-down");
        $(icon).addClass("fa-chevron-up");
      });
      $(updateDob).focusout(function () {
        var icon = $(this).siblings("label").children("i");
        $(icon).removeClass("fa-chevron-up");
        $(icon).addClass("fa-chevron-down");
      });

      $(updateDob).datepicker({
        maxDate: "-18y",
        yearRange: "c-52:c",
        changeMonth: true,
        changeYear: true,
      });

      $(updateDob).datepicker("option", "showAnim", "drop");
      $(updateDob).datepicker("option", "dateFormat", "dd MM, yy");

      $(updateDob).change(function () {
        $(this).siblings("span").text($(this).val());
      });
      $(editSection)
        .find("form")
        .submit(function (e) {
          e.preventDefault();
        });
      $(".profile-edit-container").html(editSection);
    }

    // handle adding to posts to bookmarks
    function addToBookmark(allBtn) {
      $(allBtn).each(function (index, btn) {
        $(btn).on("click", function () {
          let token = $("#csrf").val();
          let classToRemove, classToAdd, statusInfo, post_Id;
          post_Id = +$(btn).closest(".post-container").attr("data-postId");
          if ($(btn).hasClass("fi-rr-bookmark")) {
            statusInfo = "add";
          } else {
            statusInfo = "remove";
          }
          $.ajax({
            url: "/bookmark",
            type: "PUT",
            dataType: "json",
            data: JSON.stringify({
              username: targetUser,
              status: statusInfo,
              postId: post_Id,
            }),
            headers: {
              "X-CSRFToken": token,
              "X-Requested-With": "XMLHttpRequest",
            },
            success: function (data) {
              console.log(data);
              if (data.message) {
                if (statusInfo === "add") {
                  classToRemove = "fi-rr-bookmark";
                  classToAdd = "fi-sr-bookmark";
                } else {
                  classToRemove = "fi-sr-bookmark";
                  classToAdd = "fi-rr-bookmark";
                }
                $(btn).removeClass(classToRemove);
                $(btn).addClass(classToAdd);
              }
            },
          });
        });
      });
    }
  });
});