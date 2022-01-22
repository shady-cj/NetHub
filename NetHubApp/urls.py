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
    path("comment_page",views.comment_page,name='comment_page'),
    path("query_search",views.querySearch,name='query'),
    path("recent_search",views.recentSearch, name= 'recent_search'),
    path("edit_post/<int:post_id>",views.edit_post, name="edit_post"),
    path("get_current_user/",views.getUserInfo,name='get_user'),
    path("updateUser/<str:username>", views.updateProfile, name='update-profile'),
    path("indexAjax/<str:page>",views.indexAjax),
    path("<str:username>/<str:page>",views.UsersInfoPage,name="user_info_page"),
    path("discussion/<str:username>/<int:postId>",views.discussionPage, name= 'discussionPage'),
    path("<str:page>", views.index, name="index"),
]