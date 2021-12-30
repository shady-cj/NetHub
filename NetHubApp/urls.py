from django.urls import path

from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("create_new_post",views.create_post,name="create_post"),
    path("bookmark", views.BookmarkPost, name='bookmark'),
    path("handle_follow",views.handleFollow,name = 'handleFollow'),
    path("handle_like",views.handleLike, name='handleLike'),
    path("handle_comments",views.handleComments, name= 'handleComments'),
    path("edit_post/<int:post_id>",views.edit_post, name="edit_post"),
    path("get_current_user/",views.getUserInfo,name='get_user'),
    path("updateUser/<str:username>", views.updateProfile, name='update-profile'),
    path("indexAjax/<str:page>",views.indexAjax),
    path("<str:username>/<str:page>",views.UsersInfoPage,name="user_info_page"),
    path("<str:page>", views.index, name="index"),
    

#     path("profile_page/<str:user_name>",views.profile_page, name="profile_page"),
#     path("followers/<int:user_id>/<str:follow_type>",views.followers,name="followers"),
#     path("update_follow_page",views.update_follow_page,name="updatefollowpage"),
#     path("addFollower/<int:user_id>",views.addFollower,name="addFollower"),
#     path("removeFollower/<int:user_id>",views.removeFollower,name="removeFollower"),
#     path("NewComment/<int:post_id>",views.NewComment, name="NewComment"),
#     path("MainPostPage/<int:post_id>",views.MainPostPage, name="MainPostPage"),
#     path("Comment_Numbers/<int:post_id>",views.Comment_Numbers,name="commentNmbers"),
#     path("showfollower",views.showfollower, name="showfollower"),
#     path("like_page/<int:post_id>",views.like_page, name="like_page"),
#     path("like_post/<int:post_id>",views.like_post, name="like_post"),
  
]