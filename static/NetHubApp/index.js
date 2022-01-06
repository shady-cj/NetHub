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
            $(mobileNewPostCon).css("left", "0");
        });
        $(".mobile-back-post-btn").on("click", function () {
            let mobileTextDiv = $(".new-post-mobile-container .textarea");
            if ($(mobileTextDiv).text().length > 0) {
                let text = "Do you want to discard the changes";
                if (confirm(text) === true) {
                    mobileNewPostCon.css("left", "150%");
                    $(mobileTextDiv).text("");
                } else {
                    alert("Alrighty, then continue editing");
                }
            } else {
                mobileNewPostCon.css("left", "150%");
                $(mobileTextDiv).text("");
            }
        });
        $(newPostTextarea).each(function (index, textArea) {
            var hiddenPost = $(textArea).siblings(".hidden-post");
            var newPostBtn = $(textArea).siblings(".new-post-btn");
            enablePostBtn(textArea, hiddenPost, newPostBtn);

            addNewPost(
                $(textArea).closest("form"),
                $(hiddenPost),
                textArea,
                newPostBtn
            );
        });

        function enablePostBtn(newPostTextarea, hiddenPost, newPostBtn) {
            $(newPostTextarea).on("keyup", function () {
                var content = $(newPostTextarea).html();

                $(hiddenPost).val(content);

                if ($(newPostTextarea).text().trim().length > 0) {
                    $(newPostBtn).attr("disabled", false);
                    $(newPostBtn).removeClass("btn-inactive");
                } else {
                    $(newPostBtn).attr("disabled", true);
                    $(newPostBtn).addClass("btn-inactive");
                }
            });
        }

        // rendering text inside of contenteditable div
        // function renderToText(content) {
        //     div = $(content);
        //     if (div.innerText) {
        //         text = div.innerText;
        //     } else {
        //         escapedText = $(div)
        //             .html()
        //             .replace(/(?:\r\<br\>|\r|\<br\>)/g, "\n")
        //             .replace(/(\<([^\>]+)\>)/gi, "");
        //         text = decodeURIComponent(escapedText);
        //     }
        //     console.log(text);
        //     return text;
        // }

        // Adding new post asynchronously

        function addNewPost(form, inputContent, textDiv, postBtn) {
            $(form).on("submit", function (e) {
                e.preventDefault();
                let url = $(form).attr("action");
                payload = JSON.stringify({
                    post_content: $(inputContent).val(),
                    post_image: null,
                });
                mobileNewPostCon.css("left", "150%");

                let token = $("#csrf").val();

                $.ajax({
                    url: url,
                    type: "POST",
                    dataType: "json",
                    data: payload,
                    headers: {
                        "X-CSRFToken": token,
                        "X-Requested-With": "XMLHttpRequest",
                    },
                }).done((data) => {
                    if (data.message) {
                        $(textDiv).html("");
                        $(inputContent).val("");
                        $(postBtn).attr("disabled", true);
                        let template = postTemplate(
                            data.postInfo,
                            null,
                            false,
                            data.postUser
                        );
                        let postCon = $("<div>");
                        $(postCon).addClass("post-container");
                        $(postCon).addClass("viewProfilerContainer");
                        $(postCon).html(template);
                        $(postCon).css({
                            height: "0px",
                            minHeight: "0px",
                            overflow: "hidden",
                            marginTop: 0,
                            paddingTop: 0,
                        });
                        $(postCon).attr("data-postId", data.postInfo.id);
                        $(postCon).addClass("animateNewPost");

                        $(postCon).insertAfter(".new-post-container");

                        setTimeout(() => {
                            $(postCon).css({
                                height: "auto",
                                minHeight: "120px",
                                marginTop: "8px",
                                paddingTop: "9px",
                            });
                            $(postCon).removeClass("animateNewPost");
                        }, 1000);
                        editEvent($(postCon).find(".fi-rr-pencil"));
                        addToBookmark($(postCon).find(".bookmark-btn"));
                        addEventToLikeBtns(postCon);
                        addEventToCommentBtns(postCon);
                        displayDiscussion($(postCon));
                    }
                });
            });
        }

        // $(newPostBtn).click(function(){
        //     console.log('clicked')
        // })

        $.each(footerLinks, function (index, link) {
            $(link).on("click", function (e) {
                e.preventDefault();
                $("header").show();

                var page = $(this).attr("data-footerLink");
                console.log(page);
                var historyTitle = $(this).attr("data-footerName");

                viewsHandler(page, historyTitle, this);
                addActive(footerLinks, this, "footer-active");
                if (page !== "search") {
                    addActive(
                        mainNavLinks,
                        mainNavLinks.filter(`[data-link=${page}]`),
                        "active-link"
                    );
                }
            });
        });
        editEvent(editBtnIcon);

        // clicking on edit button
        function editEvent(editBtn, discussionID = null) {
            $.each(editBtn, function (index, btn) {
                let postMessage;
                let editBtnInfo;
                if (discussionID === null) {
                    postMessage = $(btn)
                        .parent()
                        .parent()
                        .siblings(".post-message");
                    editBtnInfo = $(postMessage).siblings(".edit-info");
                } else {
                    postMessage = $(btn)
                        .parent()
                        .parent()
                        .siblings(".discussion-post-message");
                    editBtnInfo = $(postMessage).siblings(".edit-info");
                }

                $(btn).click(function (e) {
                    e.stopPropagation();
                    var iContent = $(postMessage).html();
                    $(postMessage).attr("contenteditable", "true");

                    $(postMessage).focus();
                    $(postMessage).on("click", function (e) {
                        if ($(postMessage).attr("contenteditable") === "true")
                            e.stopPropagation();
                    });

                    document.execCommand("selectAll", false, null);
                    document.getSelection().collapseToEnd();
                    $(postMessage).css("outline", "none");
                    $(editBtnInfo).show(function () {
                        var closeBtn = $(editBtnInfo).find("i");
                        $(closeBtn).each(function (index, eachbtn) {
                            $(eachbtn)
                                .off("click")
                                .on("click", function (e) {
                                    e.stopPropagation();
                                    $(postMessage).attr(
                                        "contenteditable",
                                        "false"
                                    );
                                    $(editBtnInfo).hide(200);
                                    let postId;
                                    if (discussionID === null) {
                                        postId =
                                            $(postMessage).attr("data-postId");
                                    } else {
                                        postId = discussionID;
                                    }
                                    var token = $("#csrf").val();

                                    if ($(eachbtn).hasClass("fa-save")) {
                                        $.ajax({
                                            type: "POST",
                                            url: `/edit_post/${postId}`,
                                            dataType: "json",
                                            data: {
                                                post_content:
                                                    $(postMessage).html(),
                                            },
                                            // contentType: 'application/json',
                                            headers: { "X-CSRFToken": token },
                                        }).done(function (result) {
                                            console.log(result.edited);
                                            $(".fi-rr-pencil").each(
                                                (index, icon) => {
                                                    if (
                                                        +$(icon).attr(
                                                            "data-postPk"
                                                        ) === postId
                                                    ) {
                                                        $(icon)
                                                            .parent()
                                                            .parent()
                                                            .siblings(
                                                                ".post-message"
                                                            )
                                                            .html(
                                                                $(
                                                                    postMessage
                                                                ).html()
                                                            );
                                                    }
                                                }
                                            );
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

        $(hamIcon)
            .off("click")
            .on("click", function () {
                $(subMain).css("left", "0");
                setTimeout(function () {
                    $(".blur-main").show();
                    $(".post-content div").css("color", "rgb(90, 88, 88)");
                }, 200);

                $(document)
                    .off("click")
                    .on("click", function (e) {
                        var elem = e.target;
                        if ($(subMain).css("left") === "0px") {
                            if (
                                !$(elem).is("[class ^='submain-1-container']")
                            ) {
                                $(subMain).css("left", "-500px");
                                $(".post-content div").css(
                                    "color",
                                    "whitesmoke"
                                );
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

        var inputFields = $("form .form-group .form-container div input");
        var allInputSpans = $("form .form-group .form-container div span");
        $(allInputSpans).each(function (index, span) {
            $(span).click(function () {
                $(span).siblings("input").focus();
            });
        });
        $(inputFields).each(function (index, field) {
            var inputSpan = $(field).siblings("span");

            checkInput(field, inputSpan, false);
            $(field).on("focusin", function () {
                checkInput(field, inputSpan, true);
                focusEffect(field, inputSpan, true);
            });
            $(field).on("focusout", function () {
                checkInput(field, inputSpan, false);
                focusEffect(field, inputSpan, false);
            });
            $(field).on("change", function () {
                checkInput(field, inputSpan, false);
                focusEffect(field, inputSpan, false);
            });
            $(field).on("keyup", function () {
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
        var isMainUser = true;
        var clickedUser;
        var activeUrl = $(headerTitle).text();
        var targetUser = $(".submain-1-username").attr("data-username");
        var updatedUserProfile = false;
        homePageOnload = activeUrl.trim() !== "Home" ? false : true;

        if (activeUrl.trim() === "Discussion") {
            let discussionId = $("#discussionSpan").attr("data-discussionId");
            $(headerTitle).text("Home");
            discussionAjax(discussionId);
        }
        if (
            activeUrl.trim() === "Following" ||
            activeUrl.trim() === "Followers"
        ) {
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
                            if (
                                $(val).text().trim().toLowerCase() ===
                                activeSpanText
                            ) {
                                if (isMainUser) {
                                    addActive(mainNavLinks, val, "active-link");
                                } else {
                                    $(mainNavLinks).removeClass("active-links");
                                    $(footerLinks).removeClass("footer-active");
                                }
                            }
                        });
                        $(headerTitle).text(activeSpanTitle);
                        $("title").text(
                            `NETHUB | ${activeSpanTitle.toUpperCase()}`
                        );
                        var emptyMessage;
                        if (isMainUser) {
                            emptyMessage =
                                activeSpanText === "following"
                                    ? `<h3> You are Following No one</h3>`
                                    : `<h3>No Followers Yet</h3>`;
                        } else {
                            emptyMessage =
                                activeSpanText === "following"
                                    ? `<h3>Following No one</h3>`
                                    : `<h3>No Followers Yet</h3>`;
                        }

                        history.pushState(
                            {
                                page: activeSpanText,
                                emptyMessage: emptyMessage,
                            },
                            null,
                            activeSpanText
                        );
                        let sendUser = isMainUser ? targetUser : clickedUser;
                        ajaxNavPage(activeSpanText, emptyMessage, sendUser);
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
            var initialVal =
                $(innerSpan).text().trim() === "Followers" ? 50 : 0;

            $(".follow-ind").each(function (index, value) {
                $(value).find("span").css("color", "rgb(145, 141, 141)");
            });

            $(innerSpan).css("color", "whitesmoke");
            var translateIndBy = 20 + initialVal;

            $(followIndicator).css("left", `${translateIndBy}%`);
        }

        $(mainNavLinks).each(function (index, navLink) {
            let navLinkName = $(navLink).text().trim();

            if (activeUrl.trim() === navLinkName) {
                let userRequiredPages = ["Profile", "Following", "Followers"];
                if (userRequiredPages.includes(navLinkName)) {
                    let locationUrl = location.href;
                    let getUserName = locationUrl.split("/")[3];
                    console.log(getUserName, targetUser);
                    if (getUserName.trim() !== targetUser.trim()) {
                        let empty =
                            navLinkName === "Profile"
                                ? "User haven't made any post yet"
                                : navLinkName === "Following"
                                ? "Following No one"
                                : "No Followers Yet";

                        $(".empty-post")
                            .filter(`.empty-${navLinkName.toLowerCase()}`)
                            .text(empty);
                        $(mainNavLinks).removeClass("active-link");
                        $(footerLinks).removeClass("footer-active");
                        clickedUser = getUserName.trim();
                        isMainUser = false;
                    }
                }
                if (isMainUser) {
                    addActive(mainNavLinks, navLink, "active-link");

                    let pages_for_footer = [
                        "Home",
                        "Following Posts",
                        "Bookmarks",
                    ];
                    if (pages_for_footer.includes(navLinkName)) {
                        addActive(
                            footerLinks,
                            footerLinks.filter(
                                `[data-footerName ="${navLinkName}"]`
                            ),
                            "footer-active"
                        );
                    } else {
                        $(footerLinks).removeClass("footer-active");
                    }
                }
            }

            $(navLink).on("click", function (e) {
                e.preventDefault();
                $("header").show();
                var page = $(this).attr("data-link");
                var historyTitle = $(this).text();
                isMainUser = true;
                clickedUser = null;
                viewsHandler(page, historyTitle, this);
            });
        });

        function viewsHandler(page, historyTitle, clickedLink) {
            var emptyMessage;
            let pages_for_footer = ["home", "following_posts", "bookmarks"];
            if (clickedLink !== null)
                addActive(mainNavLinks, clickedLink, "active-link");
            if (pages_for_footer.includes(page)) {
                addActive(
                    footerLinks,
                    footerLinks.filter(`[data-footerLink=${page}]`),
                    "footer-active"
                );
            } else {
                $(footerLinks).removeClass("footer-active");
            }

            $(altView).html("");

            $(headerTitle).text(historyTitle);
            $("title").text(`NETHUB | ${historyTitle.toUpperCase()}`);

            var currentUser = targetUser;
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
                if (isMainUser) {
                    emptyMessage =
                        page === "followers"
                            ? `<h3 class='empty-post'>No Followers Yet</h3>`
                            : `<h3 class='empty-post'> You are Following No one</h3>`;
                } else {
                    currentUser = clickedUser;
                    emptyMessage =
                        page === "followers"
                            ? `<h3 class='empty-post'>No Followers Yet</h3>`
                            : `<h3 class='empty-post'> Following No one</h3>`;
                }

                showActiveView(followView);
                var followHeaders = $(".follow-ind");
                changeFollowPage(followHeaders, page.trim());
            } else if (page === "profile") {
                if (isMainUser) {
                    emptyMessage =
                        "<h3 class='empty-post'> You haven't made any post yet</h3>";
                } else {
                    currentUser = clickedUser;
                    emptyMessage =
                        "<h3 class='empty-post'> User haven't made any post yet</h3>";
                }
                showActiveView(profileView);
            } else {
                showActiveView(altView);
                emptyMessage = `<h1 class='empty-post'>No user you are following <br>has made a post </h1>`;
            }
            pushHistoryState(page, emptyMessage);
            ajaxNavPage(page, emptyMessage, currentUser);
        }

        function showActiveView(activeView) {
            $(".post-overlay").each(function (index, value) {
                $(value).hide();
            });
            $(activeView).show();
        }

        function pushHistoryState(page, emptyMessage, discussionInfo = null) {
            infoPages = ["followers", "following", "profile"];
            let user = isMainUser ? targetUser : clickedUser;
            if (infoPages.includes(page)) {
                history.pushState(
                    { page: page, emptyMessage: emptyMessage },
                    null,
                    `/${user}/${page}`
                );
            } else if (page === "discussion") {
                history.pushState(
                    { page: page, discussionInfo: discussionInfo },
                    null,
                    `/${page}/${discussionInfo.user}/${discussionInfo.postId}`
                );
            } else {
                history.pushState(
                    { page: page, emptyMessage: emptyMessage },
                    null,
                    `/${page}`
                );
            }
        }

        function ajaxNavPage(page, emptyMessage, presentUser) {
            $.ajax({
                url: `/indexAjax/${page}?username=${presentUser}`,
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
                        data.authUser,
                        data.user
                    );
                loadViews(
                    data.posts,
                    emptyMessage,
                    page,
                    false,
                    data.authUser,
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
            authUser,
            user = null,
            numfollowing = null,
            numfollower = null
        ) {
            if (page === "profile") {
                homeClicked = 0;
                reloadHome = false;
                homePageOnload = false;
                $(profileView).html("");
                renderProfilePage(
                    dataset,
                    user,
                    authUser,
                    numfollowing,
                    numfollower,
                    empty
                );
            } else if (page !== "home") {
                homeClicked = 0;
                reloadHome = false;
                homePageOnload = false;
                formatPost(dataset, empty, false, follow, authUser, user);
            } else {
                if (reloadHome || updatedUserProfile) {
                    formatPost(dataset, empty, true, false, authUser, user);
                }
            }
        }

        function formatPost(
            dataset,
            empty,
            forHome = false,
            follow = false,
            authUser,
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
                    let follow_btn, followBtnTemplate;
                    $(dataset).each(function (index, followInfo) {
                        if (
                            followInfo.username.toLowerCase() !==
                            authUser.username.toLowerCase()
                        ) {
                            if (
                                followInfo.followers.includes(
                                    authUser.username.toLowerCase()
                                )
                            ) {
                                follow_btn = `<button data-followFor='followPage' class= 'follow-info user-following-btn'>Following</button>`;
                            } else {
                                follow_btn = `<button data-followFor='followPage' class='follow-info user-not-following-btn'>Follow</button>`;
                            }
                            followBtnTemplate = `<div class='follow-btn'>${follow_btn}</div>`;
                        } else {
                            followBtnTemplate = "";
                        }

                        var followTemplate = `
                                    <div>
                                        <div class='follow-img'><img src ='${followInfo.pic}'></div>
                                        <div class='follow-username'><span>${followInfo.username}<span></div>
                                        ${followBtnTemplate}
                                    </div>
                                `;

                        $(followSection).append(followTemplate);
                    });
                    getUserToFollow($(followSection).find(".follow-info"));
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
                        addNewPost(
                            $(postTextarea).closest("form"),
                            $(hiddenInput),
                            postTextarea,
                            postBtn
                        );
                    }
                    $(dataset).each(function (index, post) {
                        var template = postTemplate(
                            post,
                            user,
                            false,
                            authUser
                        );
                        var postCon = $("<div>");
                        $(postCon).addClass("post-container");
                        $(postCon).addClass("viewProfilerContainer");
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
                    addEventToLikeBtns($(view).find(".post-container"));
                    addEventToCommentBtns($(view).find(".post-container"));
                    displayDiscussion($(view).find(".post-container"));

                    postToProfileEventHandler(
                        $(view).find(".viewProfilerContainer")
                    );
                }
            }
        }

        function renderProfilePage(
            dataset,
            user,
            authUser,
            numfollowing,
            numfollower,
            empty
        ) {
            $(profileView).scrollTop(0);

            let dispBtn;
            if (
                user.username.toLowerCase() === authUser.username.toLowerCase()
            ) {
                dispBtn = `<button id='profile-edit-btn'>Edit Profile</button></div>`;
            } else {
                if (user.followers.includes(authUser.username.toLowerCase())) {
                    dispBtn = `<button data-followFor='profilePage' class= 'follow-info user-following-btn'>Following</button>`;
                } else {
                    dispBtn = `<button data-followFor='profilePage' class='follow-info user-not-following-btn'>Follow</button>`;
                }
            }
            var bioData = user.about ? user.about : "No Bio";
            var profileMain = `
                            <section class='profile-main-info'>
                                <div class='profile-pic-con'>
                                    <img src=${user.pic} alt="">
                                </div>
                                <div class='profile-info-con'>
                                    <div><span class='profile-info-name' >${user.firstName} ${user.lastName}</span></div>
                                    <div><span class='profile-info-username' >${user.username}</span> 
                                    ${dispBtn}
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
                                    <div class= 'following-con'>
                                        <span>${numfollowing}</span>
                                        <span>Following</span>
                                    </div>
                            
                                    <div class='followers-con'>
                                        <span class='num_followers_count'>${numfollower}</span>
                                        <span>Followers</span>
                                    </div>
                                </div>
    
                            </section> 
                    `;
            $(profileView).html(profileMain);
            profUser = $(profileView)
                .find(".profile-info-username")
                .text()
                .trim();
            navToFollowPage($(profileView).find(".following-con"), profUser);
            navToFollowPage($(profileView).find(".followers-con"), profUser);
            getUserToFollow($(profileView).find(".follow-info"));
            $(profileView).find("#profile-edit-btn").click(activateEditPage);

            var profileSection = $("<section>");
            $(profileSection).addClass("profile-info-posts");
            var profPostHeader = `   
                        <div class='profile-post-header'>
                            <h1>My Posts</h1>
                        </div>
                    `;
            $(profileSection).html(profPostHeader);
            if (dataset.length === 0) {
                $(profileSection).append(empty);
            } else {
                $(dataset).each(function (index, post) {
                    var profileTemplate = postTemplate(
                        post,
                        user,
                        true,
                        authUser
                    );
                    var postCon = $("<div>");
                    $(postCon).addClass("post-container");
                    $(postCon).attr("data-postId", post.id);
                    $(postCon).html(profileTemplate);
                    $(profileSection).append(postCon);
                });
                addToBookmark($(profileSection).find(".bookmark-btn"));
            }

            $(profileView).append(profileSection);
            editEvent($(profileView).find(".fi-rr-pencil"));
            addEventToLikeBtns($(profileView).find(".post-container"));
            addEventToCommentBtns($(profileView).find(".post-container"));
            displayDiscussion($(profileView).find(".post-container"));
        }

        function postTemplate(post, user, forProfile, authUser) {
            let authorImage = "";
            let authorName = "";
            let dataAuthor = "";
            let likeBtnTemp;
            let likes;
            let comments =
                +post["post_comment_number"] > 0
                    ? +post["post_comment_number"]
                    : "";

            if (!forProfile) {
                authorImage = "class = 'authorProfileImage'";
                authorName = "authorProfileName";
                dataAuthor = `data-author=${post[
                    "post_creator_username"
                ].toLowerCase()}`;
            }
            if (authUser.bookmarks.includes(post.id)) {
                bookmarkClass = "fi-sr-bookmark";
            } else {
                bookmarkClass = "fi-rr-bookmark";
            }

            const checkLike = post["liked_by"].find((item) => {
                return item.username === authUser.username.toLowerCase();
            });

            if (checkLike) {
                likeBtnTemp = `<i data-postPk ='${post.id}' class="fi fi-sr-heart like-icon"></i> `;
            } else {
                likeBtnTemp = `<i data-postPk ='${post.id}' class="fi fi-rr-heart like-icon"></i>`;
            }

            if (+post.post_likes > 0) {
                likes = `${post.post_likes}`;
            } else {
                likes = "";
            }
            var userEditBtn =
                +post.post_creator_id === +userOnlineId
                    ? `<div><i data-postPk = '${post.id}' class="fi fi-rr-pencil"></i></div>`
                    : ``;
            template = `
                                
                        <div class='post-image'>
                            <img ${dataAuthor} ${authorImage} src="${post.post_creator_pic} " alt="">
                        </div>
                        <div class='post-content'>
                            <div class='post-title'>
                                <span ${dataAuthor} class='post-username ${authorName}'>${post.post_creator_username}</span> <span class='post-timestamp'>${post.post_date}</span>
                            </div>
                            <div data-postId='${post.id}' class='post-message'>
                                ${post.post_content}
                            </div>
                            <div class='edit-info'>
                                
                                <i class="far fa-window-close"></i>
                                <i class="fas fa-save"></i>
                            </div>
                            <div class='post-info'>
                
                                <div>${likeBtnTemp}<span class='like-count'>${likes}</span></div>
                                <div><i data-postPk ='${post.id}' class="fi fi-rr-comment comment-icon"></i> <span class='comment-count'>${comments}</span></div>
                                ${userEditBtn}
                                <div><i data-postPk ='${post.id}' class="fi ${bookmarkClass} bookmark-btn "></i> </div>
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
                        $(eachInputField)
                            .siblings("label")
                            .css("color", "#d9d43b");
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
                                    targetUser =
                                        data.user.username.toLowerCase();

                                    console.log(data.user);
                                    var empty =
                                        "<h3 class='empty-post'> You haven't made any post yet</h3>";
                                    if (imageByte !== null) {
                                        $("#submain-1-userpic").attr(
                                            "src",
                                            imageByte
                                        );
                                    }
                                    renderProfilePage(
                                        data["users_posts"],
                                        data.user,
                                        data.authUser,
                                        data["num_following"],
                                        data["num_followers"],
                                        empty
                                    );
                                    pushHistoryState("profile", empty);

                                    $(".submain-1-username").attr(
                                        "data-username",
                                        targetUser
                                    );
                                    $(".submain-1-username")
                                        .find("h4")
                                        .text(data.user.username);
                                    $(".hide-edit-info").hide();
                                    $(".popup-dark").hide();
                                    updatedUserProfile = true;
                                    imageByte = null;
                                }
                            },

                            error: (
                                XMLHttpRequest,
                                textStatus,
                                errorThrown
                            ) => {
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
            var docWidth = +document.documentElement.clientWidth;
            var docHeight = +document.documentElement.clientHeight;
            var boundaryWidth = docWidth < 400 ? 250 : 350;
            var boundaryHeight = docWidth < 400 ? 150 : 250;
            window.addEventListener("resize", () => {
                docWidth = +document.documentElement.clientWidth;
                docHeight = +document.documentElement.clientHeight;
                boundaryWidth = docWidth < 400 ? 250 : 350;
                boundaryHeight = docWidth < 400 ? 150 : 250;
            });

            if (docHeight < 400) {
                boundaryHeight = 150;
            }
            var cropper = $(imageCon).croppie({
                enableOrientation: true,
                enableExif: true,
                viewport: {
                    width: 150,
                    height: 150,
                    type: "square",
                },
                boundary: {
                    width: boundaryWidth,
                    height: boundaryHeight,
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
                        $(".image-nav-menu").attr("src", img);
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
        function addToBookmark(allBtn, id = null) {
            $(allBtn).each(function (index, btn) {
                $(btn).on("click", function (e) {
                    e.stopPropagation();
                    let token = $("#csrf").val();
                    let classToRemove, classToAdd, statusInfo, post_Id;
                    if (id === null) {
                        post_Id = +$(btn)
                            .closest(".post-container")
                            .attr("data-postId");
                    } else {
                        post_Id = id;
                    }

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
                                $(".bookmark-btn").each((index, button) => {
                                    if (
                                        +$(button).attr("data-postPk") ===
                                        post_Id
                                    ) {
                                        $(button).removeClass(classToRemove);
                                        $(button).addClass(classToAdd);
                                    }
                                });
                            }
                        },
                    });
                });
            });
        }

        // handle following and unfollowing

        // trying to get the user when the follow button is clicked
        getUserToFollow($(".follow-info"));
        function getUserToFollow(followBtns) {
            $(followBtns).each(function (index, btn) {
                $(btn)
                    .off("click")
                    .on("click", function () {
                        let userToFollow, forProfile;
                        console.log(this);
                        if ($(btn).attr("data-followFor") === "profilePage") {
                            userToFollow = $(btn)
                                .siblings(".profile-info-username")
                                .text()
                                .trim()
                                .toLowerCase();
                            forProfile = true;
                            console.log(userToFollow);
                        } else {
                            userToFollow = $(btn)
                                .closest(".follow-btn")
                                .siblings(".follow-username")
                                .find("span")
                                .text()
                                .trim()
                                .toLowerCase();
                            console.log(userToFollow);
                            forProfile = false;
                        }
                        handleFollowing(userToFollow, btn, forProfile);
                    });
            });
        }

        // handle follow and unfollow of users
        function handleFollowing(userToFollow, btn, forProfile) {
            let follow_type;

            if ($(btn).hasClass("user-following-btn")) {
                follow_type = "unfollow";
            } else {
                follow_type = "follow";
            }
            let putData = {
                follow_type: follow_type,
                authUser: targetUser,
                affectedUser: userToFollow,
            };
            let token = $("#csrf").val();
            $.ajax({
                url: "/handle_follow",
                type: "PUT",
                dataType: "json",
                data: JSON.stringify(putData),
                headers: {
                    "X-CSRFToken": token,
                    "X-Requested-With": "XMLHttpRequest",
                },
            }).done(function (resp) {
                if (resp.message === "successful") {
                    if (resp.follow && follow_type === "follow") {
                        $(btn).removeClass("user-not-following-btn");

                        $(btn).addClass("user-following-btn");
                        $(btn).text("Following");
                    } else {
                        $(btn).removeClass("user-following-btn");
                        $(btn).addClass("user-not-following-btn");
                        $(btn).text("Follow");
                    }
                    if (forProfile) {
                        $(btn)
                            .closest(".profile-main-info")
                            .siblings(".profile-more-info")
                            .find(".num_followers_count")
                            .text(resp["follow_count"]);
                    }
                }
            });
        }

        // Handle navigation to following page
        let profUser = $(".profile-info-username").text().trim();
        navToFollowPage($(".following-con"), profUser);
        navToFollowPage($(".followers-con"), profUser);
        function navToFollowPage(con, profileUser) {
            $(con)
                .off("click")
                .on("click", "span", function () {
                    let page, title;
                    if ($(con).hasClass("following-con")) {
                        page = "following";
                        title = "Following";
                    } else {
                        page = "followers";
                        title = "Followers";
                    }

                    if (targetUser === profileUser.toLowerCase()) {
                        isMainUser = true;

                        $(mainNavLinks).each(function (index, nav_link) {
                            if ($(nav_link).attr("data-link") === page) {
                                addActive(
                                    mainNavLinks,
                                    nav_link,
                                    "active-link"
                                );
                            }
                        });
                    } else {
                        isMainUser = false;
                        clickedUser = profileUser.toLowerCase();
                        $(mainNavLinks).removeClass("active-link");
                        $(footerLinks).removeClass("footer-active");
                    }
                    viewsHandler(page, title, null);
                });
        }

        // linking posts to profile pages by clicking on username or their pictures

        // First adding eventListener to the elements
        postToProfileEventHandler($(".viewProfilerContainer"));
        function postToProfileEventHandler(elem) {
            $(elem).each(function (index, eachEl) {
                $(eachEl)
                    .find("span.authorProfileName,img.authorProfileImage")
                    .off("click")
                    .on("click", function (e) {
                        e.stopPropagation();
                        if (targetUser) {
                            let targ = e.target;
                            console.log(e.target);

                            return routeToProfilePage(
                                $(targ).attr("data-author")
                            );
                        }
                    });
            });
        }

        // Then function for routing to profile page

        function routeToProfilePage(profUsername) {
            if (targetUser === profUsername) {
                isMainUser = true;

                $(mainNavLinks).each(function (index, nav_link) {
                    if ($(nav_link).attr("data-link") === "profile") {
                        addActive(mainNavLinks, nav_link, "active-link");
                    }
                });
            } else {
                isMainUser = false;
                clickedUser = profUsername;
                $(mainNavLinks).removeClass("active-link");
                $(footerLinks).removeClass("footer-active");
            }
            viewsHandler("profile", "Profile", null);
        }

        // Handling like features here, like and unliking posts with display of like counts
        addEventToLikeBtns($(".post-container"));
        addEventToCommentBtns($(".post-container"));

        // adding event listeners to the like icons and getting post id

        function addEventToLikeBtns(elems, id = null) {
            $(elems).each(function (index, elem) {
                $(elem)
                    .find("i.like-icon")
                    .off("click")
                    .on("click", function (e) {
                        e.stopPropagation();
                        let targ = e.target;
                        let status;

                        let postId;
                        if (id === null) {
                            postId = $(targ)
                                .closest(".post-container")
                                .attr("data-postId");
                        } else {
                            postId = id;
                        }

                        if ($(targ).hasClass("fi-sr-heart")) {
                            status = "unlike";
                        } else {
                            status = "like";
                        }
                        handleLikeFunctionality(postId, status, targ);
                    });
            });
        }

        // function to handle the likes

        function handleLikeFunctionality(postId, status, likeBtn) {
            let token = $("#csrf").val();
            if (targetUser) {
                $.ajax({
                    url: "/handle_like",
                    type: "PUT",
                    dataType: "json",
                    data: JSON.stringify({ postId: postId, status: status }),
                    headers: {
                        "X-CSRFToken": token,
                        "X-Requested-With": "XMLHttpRequest",
                    },
                }).done(function (data) {
                    if (data.message) {
                        let likeDisplaySpan =
                            $(likeBtn).siblings("span.like-count");
                        let postCon = $(likeBtn).closest("div");
                        if (
                            data.message === "liked successfully" &&
                            status === "like"
                        ) {
                            $(likeBtn).removeClass("fi-rr-heart");
                            $(likeBtn).addClass("fi-sr-heart");
                            let fixedWidth = $(postCon).css("width");
                            let fixedHeight = $(postCon).css("height");
                            $(postCon).css({
                                height: `${fixedHeight}`,
                                width: `${fixedWidth}`,
                            });

                            $(likeBtn).addClass("animateLike");
                            $(likeBtn).css("animation-play-state", "running");
                            $(likeDisplaySpan).addClass("like-count-animate");

                            setTimeout(() => {
                                $(likeDisplaySpan).removeClass(
                                    "like-count-animate"
                                );
                                $(likeBtn).css(
                                    "animation-play-state",
                                    "paused"
                                );
                            }, 420);

                            $(likeDisplaySpan).text(`${data.likes}`);
                            $(".like-icon").each((index, icon) => {
                                if (+$(icon).attr("data-postPk") === postId) {
                                    $(icon).removeClass("fi-rr-heart");
                                    $(icon).addClass("fi-sr-heart");
                                    $(icon)
                                        .siblings("span.like-count")
                                        .text(`${data.likes}`);
                                }
                            });
                        } else {
                            $(likeBtn).removeClass("fi-sr-heart");

                            $(likeBtn).addClass("fi-rr-heart");
                            $(likeBtn).removeClass("animateLike");
                            if (data.likes > 0) {
                                $(likeDisplaySpan).text(`${data.likes}`);
                            } else {
                                $(likeDisplaySpan).text("");
                            }
                            $(".like-icon").each((index, icon) => {
                                if (+$(icon).attr("data-postPk") === postId) {
                                    $(icon).removeClass("fi-sr-heart");
                                    $(icon).addClass("fi-rr-heart");
                                    if (data.likes > 0) {
                                        $(icon)
                                            .siblings("span.like-count")
                                            .text(`${data.likes}`);
                                    } else {
                                        $(icon)
                                            .siblings("span.like-count")
                                            .text("");
                                    }
                                }
                            });
                        }
                        interactionsUpdate(data.posts);
                    } else {
                        console.log(data);
                    }
                });
            }
        }

        // Add events to like icons and getting postIds

        function addEventToCommentBtns(elems, id = null) {
            $(elems).each(function (index, elem) {
                $(elem)
                    .find("i.comment-icon")
                    .off("click")
                    .on("click", function (e) {
                        e.stopPropagation();
                        let targ = e.target;
                        let postCon;

                        let postId;
                        let postUsername;
                        let post_date_class;
                        let post_message_class;
                        if (id === null) {
                            postCon = $(targ).closest(".post-container");

                            postId = $(postCon).attr("data-postId");
                            postUsername = $(postCon)
                                .find(".post-username")
                                .text();
                            post_date_class = ".post-timestamp";
                            post_message_class = ".post-message";
                        } else {
                            postId = id;
                            postCon = $(targ).closest(
                                ".discussion-body-container"
                            );
                            postUsername = $(postCon)
                                .find("#discussion-post-username")
                                .text();
                            post_date_class = ".discussion-post-timestamp";
                            post_message_class = ".discussion-post-message";
                        }

                        let postInfo = {
                            id: postId,
                            authUserPic: $("#submain-1-userpic").attr("src"),
                            profPic: $(postCon).find("img").attr("src"),
                            postUsername: postUsername,
                            postDate: $(postCon).find(post_date_class).text(),
                            replyMessage:
                                postUsername ===
                                $(".submain-1-username h4").text().trim()
                                    ? "Add another Post"
                                    : `Replying to <em>${postUsername}</em>`,
                            postMessage: $(postCon)
                                .find(post_message_class)
                                .html(),
                        };
                        console.log(postInfo);
                        handleCommentFunctionality(postId, postInfo, postCon);
                    });
            });
        }

        // handle comment functionality after the comment button is clicked
        let modalOpen = false;
        function handleCommentFunctionality(postId, postInfo, postCon) {
            modalOpen = true;
            let mediaQ = window.matchMedia("(min-width: 600px)");
            adjustCommentBox(mediaQ);
            mediaQ.onchange = () => {
                adjustCommentBox(mediaQ);
            };
            $(".comment-box-popup").html(commentBoxTemplate(postInfo));
            $(".comment-box-popup")
                .find("i.fa-times")
                .off("click")
                .on("click", function () {
                    $(".popup-dark").hide();
                    $(".comment-box-popup").hide();
                    modalOpen = false;
                });
            let btn = $(".comment-box-popup").find("button");
            let formDiv = $(".comment-box-popup").find(
                "div[contenteditable=true]"
            );
            $(formDiv).focus();
            $(formDiv).on("keyup", function () {
                $("#commentInputForDiv").val($(this).html());
                if ($(this).text().trim().length > 0) {
                    $(btn).prop("disabled", false);
                } else {
                    $(btn).prop("disabled", true);
                }
            });

            $(btn)
                .off("click")
                .on("click", function () {
                    // make request to the backend to store the comment made
                    sendCommentToBackend(postId, postCon);
                });
        }

        function sendCommentToBackend(postId, postCon, fromDiscussion = false) {
            let token = $("#csrf").val();
            $.ajax({
                url: "/handle_comments",
                type: "PUT",
                dataType: "json",
                data: JSON.stringify({
                    postId: postId,
                    message: fromDiscussion
                        ? $("#reply-editable-input").val()
                        : $("#commentInputForDiv").val(),
                }),
                headers: {
                    "X-CSRFToken": token,
                    "X-Requested-With": "XMLHttpRequest",
                },
            }).done((data) => {
                if (data.message) {
                    $(".popup-dark").hide();
                    $(".comment-box-popup").hide();
                    modalOpen = false;
                    let commentSpan = $(postCon).find(".comment-count");
                    setTimeout(() => {
                        $(commentSpan).text(data.commentNum);

                        $(commentSpan).addClass("like-count-animate");

                        setTimeout(() => {
                            $(commentSpan).removeClass("like-count-animate");
                        }, 420);
                    }, 1000);
                    $(".comment-icon").each((index, icon) => {
                        if (+$(icon).attr("data-postPk") === postId) {
                            $(icon)
                                .siblings("span.comment-count")
                                .text(data.commentNum);
                        }
                    });
                    if (!fromDiscussion) {
                        updateCommentsInfo(postId);
                    }
                }
            });
        }

        // adjust comment box popup based on the media query

        function adjustCommentBox(mediaQ) {
            if (modalOpen) {
                if (mediaQ.matches) {
                    $(".popup-dark").show();
                    $(".comment-box-popup").show();
                } else {
                    $(".comment-box-popup").show();
                    $(".popup-dark").hide();
                }
            } else {
                $(".comment-box-popup").hide();
                $(".popup-dark").hide();
            }
        }
        // the comment box template that is being displayed in the comment box when it is opened...
        function commentBoxTemplate(postInfo) {
            let commentBox = `
                <div class= 'commentBox'>
                    <div class='cancel-comment'>
                        <i class="fas fa-times"></i>
                    </div>
                    <div class='comment-post'>

                        <div class='post-container comment-box-container' data-postId="${postInfo.id}">
                            <div class='post-image'>
                                <img src='${postInfo.profPic}' alt="">
                            </div>
                            <div class='post-content'>
                                <div class='post-title'>
                                    <span class='post-username'>${postInfo.postUsername}</span> 
                                    <span class='post-timestamp'>${postInfo.postDate}</span>
                                    </div>
                            <div class='post-message'>
                                ${postInfo.postMessage}
                            </div>
                    
                        </div>
                        
                    </div>
                    <section>
                        ${postInfo.replyMessage}
                    </section>
                    <div class ='comment-content'>
                        <img src=${postInfo.authUserPic}>
                        <div contenteditable='true' class='commentTextarea' placeholder='Post your reply'></div>
                        <input type='text' id='commentInputForDiv' hidden></input>
                        
                    </div>
                    <div class='comment-btn'>
                        <button disabled>Reply</button>
                    </div>

                </div>
            
            `;
            return commentBox;
        }
        // ".post-container"

        // Displaying comment page
        displayDiscussion($(".post-container"));
        var commentContainer = $(".comment-posted-container");

        function displayDiscussion(elems) {
            $(elems).each(function (index, eachEl) {
                $(eachEl)
                    .off("click")
                    .on("click", function (e) {
                        let targ = $(e.target).closest(".post-container");

                        let postId = $(targ).attr("data-postId");
                        discussionAjax(postId);

                        console.log("clicked the post con", e.target);
                    });
            });
            $(".discussion-header-container i")
                .off("click")
                .on("click", function () {
                    $("header").show();
                    $(".reply-info").hide();
                    $(".reply-editable").css("flex-basis", "80%");
                    $(".reply-accessories").css("flex-basis", "7%");
                    $(".reply-accessories").css("paddingRight", "0px");
                    $(".reply-editable div[contenteditable=true]").html("");
                    $("#reply-editable-input").val("");
                    if ($("header .header-title").text().trim() === "Profile") {
                        showActiveView(profileView);
                        pushHistoryState("profile", null);
                        $("title").text(`NETHUB | PROFILE`);
                    } else {
                        let title = $("header .header-title").text().trim();
                        $("title").text(`NETHUB | ${title.toUpperCase()}`);
                        if (title === "Following Posts") {
                            title = title.replace(" ", "_");
                        }

                        pushHistoryState(title.toLowerCase(), null);
                        if (title === "Home") {
                            showActiveView(mainView);
                        } else {
                            showActiveView(altView);
                        }
                    }
                    //  showActiveView(altView)
                });
            $(".reply-editable div[contenteditable=true]").on(
                "keyup",
                function () {
                    $("#reply-editable-input").val($(this).html());
                    if ($(this).text().trim().length > 0) {
                        $(".reply-accessories button").prop("disabled", false);
                    } else {
                        $(".reply-accessories button").prop("disabled", true);
                    }
                }
            );
        }
        function discussionAjax(postId, partialUpdate = false) {
            $("header").hide();
            $(commentContainer).empty();
            let token = $("#csrf").val();
            // sendCommentToBackend(postId, postCon, (fromDiscussion = false));

            $(".reply-accessories button")
                .off("click")
                .on("click", function () {
                    sendCommentToBackend(
                        postId,
                        $(".discussion-body-container"),
                        true
                    );
                    $(".reply-editable div[contenteditable=true]").html("");
                    $("#reply-editable-input").val("");

                    // Update comment information on discussion page...
                    updateCommentsInfo(postId);
                });

            $.ajax({
                url: "/comment_page",
                type: "POST",
                dataType: "json",
                data: JSON.stringify({
                    postId: postId,
                }),
                headers: {
                    "X-CSRFToken": token,
                    "X-Requested-With": "XMLHttpRequest",
                },
            }).done((data) => {
                if (data.postInfo) {
                    if (!partialUpdate) {
                        showActiveView($(".discussion-wrapper"));
                        pushHistoryState("discussion", null, {
                            user: data.postInfo.post_creator_username.toLowerCase(),
                            postId: data.postInfo.id,
                        });
                        $("title").text(`NETHUB | DISCUSSION`);
                        displayDiscussionInfo(data.postInfo, data.user);
                    } else {
                        commentContainerUpdate(data.postInfo);
                    }
                }
            });
        }
        // function to pluralize words based on the number given
        function pluralizeWords(num) {
            if (num > 1) {
                return "s";
            } else {
                return "";
            }
        }
        // showing the right comment info

        function displayDiscussionInfo(data, user) {
            let content_creator_img = data.post_creator_pic;
            let content_creator_username = data.post_creator_username;
            let content_creator_message = data.post_content;
            let content_creator_timestamp = data.post_full_date;
            $(".discussion-post-info-profPic img").attr(
                "src",
                content_creator_img
            );
            $(".discussion-post-info-username span").text(
                content_creator_username
            );
            $(".discussion-post-message").html(content_creator_message);
            $(".discussion-post-timestamp").text(content_creator_timestamp);
            //  Defining the interaction information e.g likes, comments etc....
            interactionsUpdate(data);

            // Defining the action buttons e.g like button, comment button etc...

            // Like Action Button
            let likeStatus = null;
            data.liked_by.filter((user) => {
                if (user.username === targetUser.toLowerCase()) {
                    likeStatus = "<i class='fi fi-sr-heart like-icon'></i>";
                    return;
                }
            });
            let likeNumber =
                data.post_likes > 0
                    ? `<span class='like-count'>${data.post_likes}</span>`
                    : "<span class='like-count'></span>";

            let likeInfo =
                likeStatus !== null
                    ? likeStatus + likeNumber
                    : '<i class="fi fi-rr-heart like-icon"></i>' + likeNumber;

            let likeButton = `<div>
                ${likeInfo}
            </div>`;

            // Comment Action Button
            commentNumber =
                data.post_comment_number > 0
                    ? `<span class='comment-count'>
                               ${data.post_comment_number}
                            </span>`
                    : "<span class='comment-count'></span>";
            commentButton = `
                        <div>
                            <i class="fi fi-rr-comment comment-icon"></i> 
                            ${commentNumber}
                        </div>
            
            `;

            // Edit Button
            //  user.bookmarks.includes(data.id)
            editButton =
                user.username === data.post_creator_username
                    ? `<div><i class="fi fi-rr-pencil"></i></div>`
                    : "";

            // Bookmark button
            bookmarkButton = user.bookmarks.includes(data.id)
                ? `<div><i class="bookmark-btn fi-sr-bookmark"><i><div>`
                : `<div><i class="bookmark-btn fi-rr-bookmark"><i><div>`;

            actionButtons =
                likeButton + commentButton + editButton + bookmarkButton;

            $(".discussion-post-interaction-btn").html(actionButtons);

            editEvent(
                $(".discussion-post-interaction-btn").find(".fi-rr-pencil"),
                data.id
            );
            addToBookmark(
                $(".discussion-post-interaction-btn").find(".bookmark-btn"),
                data.id
            );

            addEventToLikeBtns($(".discussion-post-interaction-btn"), data.id);
            addEventToCommentBtns(
                $(".discussion-post-interaction-btn"),
                data.id
            );
            // replying to div

            $(".reply-info em").text(data.post_creator_username);

            // replying user profile picture

            $(".reply-user-image img").attr("src", user.pic);

            $(".reply-editable div[contenteditable='true']").on(
                "focusin",
                function () {
                    $(".reply-info").show();
                    $(".reply-editable").css("flex-basis", "100%");
                    $(".reply-accessories").css("flex-basis", "100%");
                    $(".reply-accessories").css("paddingRight", "10px");
                }
            );

            // Comments template

            data.post_comment_info.forEach((eachComment) => {
                commentPostedTemplate = `
                
                        <div class="individual-comment-posted">
                            <div class="individual-comment-user-pics">
                                <img src="${eachComment.comment_user_info.userCommentPic}" alt="" />
                            </div>
                            <div class="individual-comment-body">
                                <div class="individual-comment-user-info">
                                    <span>${eachComment.comment_user_info.userCommentUsername}</span>
                                    <span>${eachComment.comment_date}</span>
                                </div>
                                <div class="individual-comment-message">
                                   ${eachComment.comment_content}
                                </div>
                            </div>
                        </div>
                
                `;
                $(commentContainer).append(commentPostedTemplate);
            });
        }

        function interactionsUpdate(data) {
            let likeInteraction =
                data.post_likes > 0
                    ? `<div>${data.post_likes} <span>like${pluralizeWords(
                          data.post_likes
                      )}</span></div>`
                    : "";
            let commentInteraction =
                data.post_comment_number > 0
                    ? `<div>${
                          data.post_comment_number
                      } <span> comment${pluralizeWords(
                          data.post_comment_number
                      )}</span></div>`
                    : "";
            if (likeInteraction != "" || commentInteraction != "") {
                let interactionTemplate = likeInteraction + commentInteraction;
                $(".discussion-post-interactions").html(interactionTemplate);
            } else {
                $(".discussion-post-interactions").hide();
            }
        }

        function commentContainerUpdate(data) {
            interactionsUpdate(data);
            $(".reply-info").hide();
            $(".reply-editable").css("flex-basis", "80%");
            $(".reply-accessories").css("flex-basis", "7%");
            $(".reply-accessories").css("paddingRight", "0px");
            data.post_comment_info.forEach((eachComment) => {
                commentPostedTemplate = `
                
                        <div class="individual-comment-posted">
                            <div class="individual-comment-user-pics">
                                <img src="${eachComment.comment_user_info.userCommentPic}" alt="" />
                            </div>
                            <div class="individual-comment-body">
                                <div class="individual-comment-user-info">
                                    <span>${eachComment.comment_user_info.userCommentUsername}</span>
                                    <span>${eachComment.comment_date}</span>
                                </div>
                                <div class="individual-comment-message">
                                   ${eachComment.comment_content}
                                </div>
                            </div>
                        </div>
                
                `;
                $(commentContainer).append(commentPostedTemplate);
            });
        }

        function updateCommentsInfo(postId) {
            discussionAjax(postId, true);
        }
    });
});
// showActiveView(".discussion-wrapper");
// 192.168.13.64
